/* eslint-disable @typescript-eslint/no-explicit-any */
import { POST } from "./route";
import { NextResponse } from "next/server";
import pool from "@/lib/db";

// Mock db and NextResponse
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

const day = 24 * 60 * 60 * 1000;
const request = (body: unknown) =>
  ({ json: async () => body }) as unknown as Request;

describe("/api/vehicles POST", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns available cars for a given city and dates", async () => {
    const mockCars = [{ id: 1, model: "Tesla Model 3" }];
    (pool.query as jest.Mock).mockResolvedValueOnce({ rows: mockCars });

    const res: any = await POST(
      request({
        city: "Toronto",
        startDate: new Date(Date.now() + 5 * day).toISOString(),
        endDate: new Date(Date.now() + 8 * day).toISOString(),
      })
    );

    expect(pool.query).toHaveBeenCalledTimes(1);
    const [sql, params] = (pool.query as jest.Mock).mock.calls[0];
    expect(sql).toContain("NOT EXISTS");
    expect(params[0]).toBe("Toronto");
    expect(res.json).toEqual(mockCars);
  });

  it("returns available cars when no filters are provided", async () => {
    const mockCars = [{ id: 2, model: "BMW i4" }];
    (pool.query as jest.Mock).mockResolvedValueOnce({ rows: mockCars });

    const res: any = await POST(request({}));

    expect(pool.query).toHaveBeenCalledTimes(1);
    expect(NextResponse.json).toHaveBeenCalledWith(mockCars);
    expect(res.json).toEqual(mockCars);
  });

  it("rejects searches that start in the past", async () => {
    const res: any = await POST(
      request({ startDate: "2020-01-01", endDate: "2020-01-05" })
    );

    expect(res.status).toBe(400);
    expect(pool.query).not.toHaveBeenCalled();
  });

  it("rejects a return date before the pick-up date", async () => {
    const res: any = await POST(
      request({
        startDate: new Date(Date.now() + 9 * day).toISOString(),
        endDate: new Date(Date.now() + 2 * day).toISOString(),
      })
    );

    expect(res.status).toBe(400);
    expect(pool.query).not.toHaveBeenCalled();
  });
});
