/* eslint-disable @typescript-eslint/no-explicit-any */
import { GET } from "./route";
import pool from "@/lib/db";
import { NextResponse } from "next/server";

// Mock NextResponse
jest.mock("next/server", () => ({
  NextResponse: {
    json: jest.fn((data, init) => ({
      json: data,
      status: init?.status || 200,
    })),
  },
}));

// Mock DB
jest.mock("@/lib/db", () => ({
  query: jest.fn(),
}));

describe("/api/vehicles/[vehicleId] GET", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return 400 if vehicleId is missing", async () => {
    const response = await GET({} as any, {
      params: Promise.resolve({ vehicleId: "" }),
    });

    expect(NextResponse.json).toHaveBeenCalledWith(
      { error: "Vehicle ID is required" },
      { status: 400 }
    );
    expect(response.status).toBe(400);
  });

  it("should return 404 if no vehicle is found", async () => {
    (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [] });

    const response = await GET({} as any, {
      params: Promise.resolve({ vehicleId: "123" }),
    });

    expect(pool.query).toHaveBeenCalledWith(
      expect.stringContaining("SELECT * FROM cars WHERE id = $1"),
      ["123"]
    );
    expect(NextResponse.json).toHaveBeenCalledWith(
      { error: "Vehicle not found" },
      { status: 404 }
    );
    expect(response.status).toBe(404);
  });

  it("should return vehicle details when found", async () => {
    const mockVehicle = { id: "1", brand: "Tesla", model: "Model 3" };
    (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [mockVehicle] });

    const response = await GET({} as any, {
      params: Promise.resolve({ vehicleId: "1" }),
    });

    expect(pool.query).toHaveBeenCalledWith(
      expect.stringContaining("SELECT * FROM cars WHERE id = $1"),
      ["1"]
    );
    expect(NextResponse.json).toHaveBeenCalledWith(mockVehicle);
    expect(response.json).toEqual(mockVehicle);
  });

  it("should return 500 when database query fails", async () => {
    (pool.query as jest.Mock).mockRejectedValueOnce(new Error("DB failure"));

    const response = await GET({} as any, {
      params: Promise.resolve({ vehicleId: "1" }),
    });

    expect(NextResponse.json).toHaveBeenCalledWith(
      { error: "Failed to fetch vehicle" },
      { status: 500 }
    );
    expect(response.status).toBe(500);
  });
});
