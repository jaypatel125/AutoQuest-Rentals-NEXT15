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

// Polyfill global Request since Jest runs in Node
if (typeof Request === "undefined") {
  global.Request = class {
    constructor(public url: string, public options?: any) {}
    async json() {
      return this.options?.body ? JSON.parse(this.options.body) : {};
    }
  } as any;
}

describe("/api/get-available-cars POST", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns available cars for a given city and dates", async () => {
    const mockCars = [{ id: 1, model: "Tesla Model 3" }];
    (pool.query as jest.Mock).mockResolvedValueOnce({ rows: mockCars });

    const request = new Request("http://localhost", {
      method: "POST",
      body: JSON.stringify({
        city: "Toronto",
        startDate: "2025-10-21",
        endDate: "2025-10-25",
      }),
    });

    const res = await POST(request);

    expect(pool.query).toHaveBeenCalledTimes(1);
    expect(NextResponse.json).toHaveBeenCalledWith(mockCars);
    expect(res.json).toEqual(mockCars);
  });

  it("returns available cars when no filters are provided", async () => {
    const mockCars = [{ id: 2, model: "BMW i4" }];
    (pool.query as jest.Mock).mockResolvedValueOnce({ rows: mockCars });

    const request = new Request("http://localhost", {
      method: "POST",
      body: JSON.stringify({}),
    });

    const res = await POST(request);

    expect(pool.query).toHaveBeenCalledTimes(1);
    expect(NextResponse.json).toHaveBeenCalledWith(mockCars);
    expect(res.json).toEqual(mockCars);
  });
});
