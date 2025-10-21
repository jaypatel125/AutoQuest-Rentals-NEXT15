import { GET } from "./route";
import pool from "@/lib/db";
import { NextResponse } from "next/server";

// Mock dependencies
jest.mock("@/lib/db", () => ({
  query: jest.fn(),
}));

jest.mock("next/server", () => ({
  NextResponse: {
    json: jest.fn((data, init) => ({
      json: data,
      status: init?.status || 200,
    })),
  },
}));

describe("/api/vehicles/get-brands GET", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return a list of car brands", async () => {
    const mockRows = [{ brand: "Tesla" }, { brand: "BMW" }, { brand: "Audi" }];
    (pool.query as jest.Mock).mockResolvedValueOnce({ rows: mockRows });

    const response = await GET();

    expect(pool.query).toHaveBeenCalledWith(
      expect.stringContaining("SELECT DISTINCT brand")
    );
    expect(NextResponse.json).toHaveBeenCalledWith(["Tesla", "BMW", "Audi"]);
    expect(response.json).toEqual(["Tesla", "BMW", "Audi"]);
  });

  it("should return 500 if database query fails", async () => {
    (pool.query as jest.Mock).mockRejectedValueOnce(new Error("DB error"));

    const response = await GET();

    expect(pool.query).toHaveBeenCalledTimes(1);
    expect(NextResponse.json).toHaveBeenCalledWith(
      { success: false, message: "Failed to fetch car brands" },
      { status: 500 }
    );
    expect(response.status).toBe(500);
  });
});
