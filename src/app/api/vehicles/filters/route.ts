import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET() {
  try {
    const queries = {
      brands: `SELECT DISTINCT brand FROM car ORDER BY brand ASC`,
      fuelTypes: `SELECT DISTINCT "fuelType" FROM car ORDER BY "fuelType" ASC`,
      transmissions: `SELECT DISTINCT transmission FROM car ORDER BY transmission ASC`,
      bodyTypes: `SELECT DISTINCT "bodyType" FROM car ORDER BY "bodyType" ASC`,
      passengerCapacities: `SELECT DISTINCT "passengerCapacity" FROM car ORDER BY "passengerCapacity" ASC`,
    };

    const [brandsRes, fuelRes, transmissionRes, bodyTypeRes, capacityRes] =
      await Promise.all([
        pool.query(queries.brands),
        pool.query(queries.fuelTypes),
        pool.query(queries.transmissions),
        pool.query(queries.bodyTypes),
        pool.query(queries.passengerCapacities),
      ]);

    const filters = {
      brands: brandsRes.rows.map((r) => r.brand),
      fuelTypes: fuelRes.rows.map((r) => r.fuelType),
      transmissions: transmissionRes.rows.map((r) => r.transmission),
      bodyTypes: bodyTypeRes.rows.map((r) => r.bodyType),
      passengerCapacities: capacityRes.rows.map((r) => r.passengerCapacity),
    };

    return NextResponse.json(filters);
  } catch (error) {
    console.error("Error fetching filters:", error);
    return NextResponse.json(
      { error: "Failed to fetch filters" },
      { status: 500 }
    );
  }
}
