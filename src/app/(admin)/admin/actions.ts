// Types based on your API response
interface DashboardData {
  range: {
    start: string;
    end: string;
  };
  summary: {
    total_completed_rentals: number;
    total_revenue: number;
    avg_days: number;
    avg_revenue: number;
    unique_customers: number;
    vehicles_rented: number;
  };
  dailyTrend: Array<{
    day: string;
    rentals: number;
    revenue: number;
  }>;
  topVehicles: Array<{
    id: string;
    brand: string;
    model: string;
    carbon_emissions: number;
    rental_count: number;
    total_revenue: number;
  }>;
  topBranches: Array<{
    id: string;
    name: string;
    city: string;
    total_revenue: number;
    total_bookings: number;
    total_carbon_emissions: number;
    revenue_per_carbon_unit: number;
  }>;
  topUsers: Array<{
    id: string;
    name: string;
    email: string;
    reward_points: number;
    total_rentals: number;
    total_spent: number;
  }>;
  cancellation: {
    total_bookings: number;
    cancelled_count: number;
    cancel_pct: number;
  };
  rewards: {
    points_earned: number;
    points_redeemed: number;
  };
  fleet: {
    total_cars: number;
    available_cars: number;
    available_pct: number;
  };
  utilization: Array<{
    id: string;
    brand: string;
    model: string;
    booked_days: number;
    utilization_pct: number;
  }>;
  carbonEmissions: Array<{
    month: string;
    total_carbon_emissions: number;
    booking_count: number;
    avg_carbon_per_booking: number;
  }>;
  fuelTypePerformance: Array<{
    fuel_type: string;
    rental_count: number;
    total_revenue: number;
    avg_carbon_emissions: number;
    avg_booking_value: number;
  }>;
  bookingStatus: Array<{
    status: string;
    count: number;
    percentage: number;
  }>;
  carbonByBodyType: Array<{
    body_type: string;
    rental_count: number;
    avg_carbon_emissions: number;
    total_carbon_emitted: number;
  }>;
  rewardsAnalytics: Array<{
    id: string;
    name: string;
    email: string;
    reward_points: number;
    total_transactions: number;
    total_points_earned: number;
    total_points_redeemed: number;
  }>;
}

export const fetchDashboardData = async (
  timeRange: string
): Promise<DashboardData> => {
  const endDate = new Date().toISOString().split("T")[0];
  const startDate = new Date();

  if (timeRange === "7d") {
    startDate.setDate(startDate.getDate() - 7);
  } else if (timeRange === "30d") {
    startDate.setDate(startDate.getDate() - 30);
  } else {
    startDate.setDate(startDate.getDate() - 90);
  }

  const startDateStr = startDate.toISOString().split("T")[0];

  const response = await fetch(
    `/api/admin/dashboard-stats?start=${startDateStr}&end=${endDate}`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch dashboard data");
  }

  return response.json();
};
