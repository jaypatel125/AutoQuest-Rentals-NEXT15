import { getServerSideSession } from "@/hooks/SessionHandler";
import pool from "@/lib/db";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

function formatDate(d: Date) {
  return d.toISOString().split("T")[0];
}

export async function GET(request: NextRequest) {
  const session = await getServerSideSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (session.user?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Parse date range from query params, fallback to last 30 days
  const params = request.nextUrl.searchParams;
  const endParam = params.get("end");
  const startParam = params.get("start");

  const today = new Date();
  const defaultEnd = formatDate(today);
  const defaultStart = formatDate(
    new Date(Date.now() - 29 * 24 * 60 * 60 * 1000)
  ); // last 30 days

  const isDay = (v: string | null): v is string =>
    !!v && /^\d{4}-\d{2}-\d{2}$/.test(v) && !Number.isNaN(Date.parse(v));
  const startDate = isDay(startParam) ? startParam : defaultStart;
  const endDate = isDay(endParam) ? endParam : defaultEnd;

  const client = await pool.connect();
  try {
    // --- SUMMARY & QUICK STATS ---
    const summaryQuery = `
      SELECT
        COUNT(*) FILTER (WHERE status = 'Completed')::int AS total_completed_rentals,
        COALESCE(SUM(total_price) FILTER (WHERE status = 'Completed'),0)::numeric(14,2) AS total_revenue,
        COALESCE(AVG((DATE(end_date) - DATE(start_date)) + 1) FILTER (WHERE status = 'Completed'),0)::numeric(8,2) AS avg_days,
        COALESCE(AVG(total_price) FILTER (WHERE status = 'Completed'),0)::numeric(12,2) AS avg_revenue,
        COUNT(DISTINCT user_id) FILTER (WHERE status = 'Completed')::int AS unique_customers,
        COUNT(DISTINCT car_id) FILTER (WHERE status = 'Completed')::int AS vehicles_rented
      FROM bookings
      WHERE DATE(start_date) BETWEEN $1 AND $2;
    `;

    // --- DAILY TRENDS ---
    const dailyTrendQuery = `
      SELECT
        DATE(start_date) AS day,
        COUNT(*) FILTER (WHERE status = 'Completed') AS rentals,
        COALESCE(SUM(total_price) FILTER (WHERE status = 'Completed'),0)::numeric(14,2) AS revenue
      FROM bookings
      WHERE DATE(start_date) BETWEEN $1 AND $2
      GROUP BY day
      ORDER BY day;
    `;

    // --- TOP 5 RENTED VEHICLES (with carbon data) ---
    const topVehiclesQuery = `
      SELECT
        c.id,
        c.brand,
        c.model,
        c.carbon_emissions,
        COUNT(b.id) AS rental_count,
        SUM(b.total_price) AS total_revenue
      FROM bookings b
      JOIN cars c ON b.car_id = c.id
      WHERE b.status = 'Completed'
        AND DATE(b.start_date) BETWEEN $1 AND $2
      GROUP BY c.id, c.brand, c.model, c.carbon_emissions
      ORDER BY rental_count DESC
      LIMIT 5;
    `;

    // --- TOP BRANCHES BY REVENUE (with carbon efficiency) ---
    const topBranchesQuery = `
      SELECT
        br.id,
        br.name,
        br.city,
        COALESCE(SUM(b.total_price),0)::numeric(14,2) AS total_revenue,
        COUNT(b.id) AS total_bookings,
        SUM(c.carbon_emissions * (EXTRACT(day FROM (b.end_date - b.start_date)) + 1)) AS total_carbon_emissions,
        CASE 
          WHEN SUM(c.carbon_emissions * (EXTRACT(day FROM (b.end_date - b.start_date)) + 1)) > 0 
          THEN ROUND((SUM(b.total_price) / SUM(c.carbon_emissions * (EXTRACT(day FROM (b.end_date - b.start_date)) + 1)))::numeric, 2)
          ELSE 0 
        END AS revenue_per_carbon_unit
      FROM bookings b
      JOIN cars c ON b.car_id = c.id
      JOIN branches br ON c.branch_id = br.id
      WHERE b.status = 'Completed'
        AND DATE(b.start_date) BETWEEN $1 AND $2
      GROUP BY br.id, br.name, br.city
      ORDER BY total_revenue DESC
      LIMIT 5;
    `;

    // --- TOP 5 USERS BY RENTALS (with spending) ---
    const topUsersQuery = `
      SELECT
        u.id,
        u.name,
        u.email,
        u.reward_points,
        COUNT(b.id) AS total_rentals,
        SUM(b.total_price) AS total_spent
      FROM bookings b
      JOIN "user" u ON b.user_id = u.id
      WHERE b.status = 'Completed'
        AND DATE(b.start_date) BETWEEN $1 AND $2
      GROUP BY u.id, u.name, u.email, u.reward_points
      ORDER BY total_rentals DESC
      LIMIT 5;
    `;

    // --- CANCELLATION RATE ---
    const cancellationQuery = `
      SELECT
        COUNT(*)::int AS total_bookings,
        SUM(CASE WHEN status = 'Cancelled' THEN 1 ELSE 0 END)::int AS cancelled_count,
        CASE WHEN COUNT(*) = 0 THEN 0
             ELSE (SUM(CASE WHEN status = 'Cancelled' THEN 1 ELSE 0 END)::float / COUNT(*)::float) * 100
        END AS cancel_pct
      FROM bookings
      WHERE DATE(start_date) BETWEEN $1 AND $2;
    `;

    // --- REWARDS SUMMARY ---
    const rewardsSummaryQuery = `
      SELECT
        COALESCE(SUM(CASE WHEN transaction_type = 'Earned' THEN points ELSE 0 END),0)::int AS points_earned,
        COALESCE(SUM(CASE WHEN transaction_type = 'Redeemed' THEN points ELSE 0 END),0)::int AS points_redeemed
      FROM rewardshistory
      WHERE DATE(created_at) BETWEEN $1 AND $2;
    `;

    // --- FLEET AVAILABILITY ---
    const fleetAvailabilityQuery = `
      SELECT
        COUNT(*)::int AS total_cars,
        SUM(CASE WHEN available THEN 1 ELSE 0 END)::int AS available_cars
      FROM cars;
    `;

    // --- VEHICLE UTILIZATION ---
    const utilizationQuery = `
      SELECT
        c.id,
        c.brand,
        c.model,
        COALESCE(SUM(
          GREATEST(0,
            LEAST(DATE(b.end_date), $2::date) - GREATEST(DATE(b.start_date), $1::date) + 1
          )
        ),0)::int AS booked_days
      FROM cars c
      LEFT JOIN bookings b
        ON b.car_id = c.id
        AND b.status = 'Completed'
        AND NOT (DATE(b.end_date) < $1::date OR DATE(b.start_date) > $2::date)
      GROUP BY c.id, c.brand, c.model
      ORDER BY booked_days DESC
      LIMIT 5;
    `;

    // --- CARBON EMISSIONS ANALYTICS ---
    const carbonEmissionsQuery = `
      SELECT 
        DATE_TRUNC('month', b.start_date) AS month,
        SUM(c.carbon_emissions * (EXTRACT(day FROM (b.end_date - b.start_date)) + 1)) AS total_carbon_emissions,
        COUNT(b.id) AS booking_count,
        AVG(c.carbon_emissions) AS avg_carbon_per_booking
      FROM bookings b
      JOIN cars c ON b.car_id = c.id
      WHERE b.status = 'Completed'
        AND b.start_date >= CURRENT_DATE - INTERVAL '12 months'
      GROUP BY DATE_TRUNC('month', b.start_date)
      ORDER BY month DESC
      LIMIT 12;
    `;

    // --- VEHICLE PERFORMANCE BY FUEL TYPE ---
    const fuelTypePerformanceQuery = `
      SELECT 
        c.fuel_type,
        COUNT(b.id) AS rental_count,
        SUM(b.total_price) AS total_revenue,
        AVG(c.carbon_emissions) AS avg_carbon_emissions,
        AVG(b.total_price) AS avg_booking_value
      FROM bookings b
      JOIN cars c ON b.car_id = c.id
      WHERE b.status = 'Completed'
        AND DATE(b.start_date) BETWEEN $1 AND $2
      GROUP BY c.fuel_type
      ORDER BY total_revenue DESC;
    `;

    // --- BOOKING STATUS DISTRIBUTION ---
    const bookingStatusQuery = `
      SELECT 
        status,
        COUNT(*) AS count,
        ROUND((COUNT(*) * 100.0 / (SELECT COUNT(*) FROM bookings WHERE DATE(created_at) BETWEEN $1 AND $2))::numeric, 2) AS percentage
      FROM bookings
      WHERE DATE(created_at) BETWEEN $1 AND $2
      GROUP BY status
      ORDER BY count DESC;
    `;

    // --- CARBON EMISSIONS BY VEHICLE TYPE ---
    const carbonByBodyTypeQuery = `
      SELECT 
        c.body_type,
        COUNT(b.id) AS rental_count,
        AVG(c.carbon_emissions) AS avg_carbon_emissions,
        SUM(c.carbon_emissions * (EXTRACT(day FROM (b.end_date - b.start_date)) + 1)) AS total_carbon_emitted
      FROM bookings b
      JOIN cars c ON b.car_id = c.id
      WHERE b.status = 'Completed'
        AND DATE(b.start_date) BETWEEN $1 AND $2
      GROUP BY c.body_type
      ORDER BY rental_count DESC;
    `;

    // --- REWARDS PROGRAM ANALYTICS ---
    const rewardsAnalyticsQuery = `
      SELECT 
        u.id,
        u.name,
        u.email,
        u.reward_points,
        COUNT(r.id) AS total_transactions,
        SUM(CASE WHEN r.transaction_type = 'Earned' THEN r.points ELSE 0 END) AS total_points_earned,
        SUM(CASE WHEN r.transaction_type = 'Redeemed' THEN r.points ELSE 0 END) AS total_points_redeemed
      FROM "user" u
      LEFT JOIN rewardshistory r ON u.id = r.user_id
      WHERE (r.created_at IS NULL OR DATE(r.created_at) BETWEEN $1 AND $2)
      GROUP BY u.id, u.name, u.email, u.reward_points
      ORDER BY u.reward_points DESC
      LIMIT 5;
    `;

    // Run all queries in parallel
    const [
      summaryRes,
      dailyTrendRes,
      vehiclesRes,
      branchesRes,
      usersRes,
      cancellationRes,
      rewardsRes,
      fleetRes,
      utilizationRes,
      carbonEmissionsRes,
      fuelTypeRes,
      bookingStatusRes,
      carbonByBodyTypeRes,
      rewardsAnalyticsRes,
    ] = await Promise.all([
      client.query(summaryQuery, [startDate, endDate]),
      client.query(dailyTrendQuery, [startDate, endDate]),
      client.query(topVehiclesQuery, [startDate, endDate]),
      client.query(topBranchesQuery, [startDate, endDate]),
      client.query(topUsersQuery, [startDate, endDate]),
      client.query(cancellationQuery, [startDate, endDate]),
      client.query(rewardsSummaryQuery, [startDate, endDate]),
      client.query(fleetAvailabilityQuery),
      client.query(utilizationQuery, [startDate, endDate]),
      client.query(carbonEmissionsQuery),
      client.query(fuelTypePerformanceQuery, [startDate, endDate]),
      client.query(bookingStatusQuery, [startDate, endDate]),
      client.query(carbonByBodyTypeQuery, [startDate, endDate]),
      client.query(rewardsAnalyticsQuery, [startDate, endDate]),
    ]);

    // Calculate utilization percentages
    const totalDays =
      (new Date(endDate).getTime() - new Date(startDate).getTime()) /
        (24 * 60 * 60 * 1000) +
      1;

    const utilization = utilizationRes.rows.map((r) => {
      const booked_days = Number(r.booked_days ?? 0);
      const pct = totalDays > 0 ? (booked_days / totalDays) * 100 : 0;
      return {
        id: r.id,
        brand: r.brand,
        model: r.model,
        booked_days,
        utilization_pct: Number(pct.toFixed(2)),
      };
    });

    // Extract data from results
    const summaryRow = summaryRes.rows[0] ?? {};
    const cancellationRow = cancellationRes.rows[0] ?? {};
    const rewardsRow = rewardsRes.rows[0] ?? {};
    const fleetRow = fleetRes.rows[0] ?? {};

    const payload = {
      range: { start: startDate, end: endDate },

      // Summary & Quick Stats
      summary: {
        total_completed_rentals: Number(
          summaryRow.total_completed_rentals ?? 0
        ),
        total_revenue: Number(summaryRow.total_revenue ?? 0),
        avg_days: Number(summaryRow.avg_days ?? 0),
        avg_revenue: Number(summaryRow.avg_revenue ?? 0),
        unique_customers: Number(summaryRow.unique_customers ?? 0),
        vehicles_rented: Number(summaryRow.vehicles_rented ?? 0),
      },

      // Daily Trends
      dailyTrend: dailyTrendRes.rows.map((r) => ({
        day: formatDate(new Date(r.day)),
        rentals: Number(r.rentals ?? 0),
        revenue: Number(r.revenue ?? 0),
      })),

      // Top Performers
      topVehicles: vehiclesRes.rows.map((r) => ({
        id: r.id,
        brand: r.brand,
        model: r.model,
        carbon_emissions: Number(r.carbon_emissions ?? 0),
        rental_count: Number(r.rental_count ?? 0),
        total_revenue: Number(r.total_revenue ?? 0),
      })),

      topBranches: branchesRes.rows.map((r) => ({
        id: r.id,
        name: r.name,
        city: r.city,
        total_revenue: Number(r.total_revenue ?? 0),
        total_bookings: Number(r.total_bookings ?? 0),
        total_carbon_emissions: Number(r.total_carbon_emissions ?? 0),
        revenue_per_carbon_unit: Number(r.revenue_per_carbon_unit ?? 0),
      })),

      topUsers: usersRes.rows.map((r) => ({
        id: r.id,
        name: r.name,
        email: r.email,
        reward_points: Number(r.reward_points ?? 0),
        total_rentals: Number(r.total_rentals ?? 0),
        total_spent: Number(r.total_spent ?? 0),
      })),

      // Business Metrics
      cancellation: {
        total_bookings: Number(cancellationRow.total_bookings ?? 0),
        cancelled_count: Number(cancellationRow.cancelled_count ?? 0),
        cancel_pct: Number(Number(cancellationRow.cancel_pct ?? 0).toFixed(2)),
      },

      rewards: {
        points_earned: Number(rewardsRow.points_earned ?? 0),
        points_redeemed: Number(rewardsRow.points_redeemed ?? 0),
      },

      fleet: {
        total_cars: Number(fleetRow.total_cars ?? 0),
        available_cars: Number(fleetRow.available_cars ?? 0),
        available_pct:
          Number(fleetRow.total_cars ?? 0) > 0
            ? Number(
                (
                  (Number(fleetRow.available_cars ?? 0) /
                    Number(fleetRow.total_cars ?? 0)) *
                  100
                ).toFixed(2)
              )
            : 0,
      },

      utilization,

      // Carbon Emissions Analytics
      carbonEmissions: carbonEmissionsRes.rows.map((r) => ({
        month: formatDate(new Date(r.month)),
        total_carbon_emissions: Number(r.total_carbon_emissions ?? 0),
        booking_count: Number(r.booking_count ?? 0),
        avg_carbon_per_booking: Number(r.avg_carbon_per_booking ?? 0).toFixed(
          2
        ),
      })),

      fuelTypePerformance: fuelTypeRes.rows.map((r) => ({
        fuel_type: r.fuel_type,
        rental_count: Number(r.rental_count ?? 0),
        total_revenue: Number(r.total_revenue ?? 0),
        avg_carbon_emissions: Number(r.avg_carbon_emissions ?? 0),
        avg_booking_value: Number(r.avg_booking_value ?? 0).toFixed(2),
      })),

      bookingStatus: bookingStatusRes.rows.map((r) => ({
        status: r.status,
        count: Number(r.count ?? 0),
        percentage: Number(r.percentage ?? 0).toFixed(2),
      })),

      carbonByBodyType: carbonByBodyTypeRes.rows.map((r) => ({
        body_type: r.body_type,
        rental_count: Number(r.rental_count ?? 0),
        avg_carbon_emissions: Number(r.avg_carbon_emissions ?? 0).toFixed(2),
        total_carbon_emitted: Number(r.total_carbon_emitted ?? 0),
      })),

      rewardsAnalytics: rewardsAnalyticsRes.rows.map((r) => ({
        id: r.id,
        name: r.name,
        email: r.email,
        reward_points: Number(r.reward_points ?? 0),
        total_transactions: Number(r.total_transactions ?? 0),
        total_points_earned: Number(r.total_points_earned ?? 0),
        total_points_redeemed: Number(r.total_points_redeemed ?? 0),
      })),
    };

    return NextResponse.json(payload);
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard stats" },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}
