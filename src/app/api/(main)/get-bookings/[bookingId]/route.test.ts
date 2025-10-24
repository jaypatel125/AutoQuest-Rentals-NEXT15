/* eslint-disable @typescript-eslint/no-explicit-any */
import { GET } from "./route";
import pool from "@/lib/db";
import { getServerSideSession } from "@/hooks/SessionHandler";

// Mock NextResponse to avoid depending on Web API classes
jest.mock("next/server", () => ({
  NextResponse: {
    json: jest.fn((data, init) => ({
      json: async () => data,
      status: init?.status || 200,
    })),
  },
}));

// Polyfill global Request for Node test environment
if (typeof Request === "undefined") {
  global.Request = class {
    constructor(public url: string) {}
  } as any;
}

// Mock dependencies
jest.mock("@/lib/db", () => ({
  query: jest.fn(),
}));

jest.mock("@/hooks/SessionHandler", () => ({
  getServerSideSession: jest.fn(),
}));

describe("/api/get-bookings/[bookingId] GET", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return 401 if session is missing", async () => {
    (getServerSideSession as jest.Mock).mockResolvedValueOnce(null);

    const response = await GET(new Request("http://localhost"), {
      params: Promise.resolve({ bookingId: "1" }),
    });

    const json = await response.json();
    expect(response.status).toBe(401);
    expect(json).toEqual({ error: "Unauthorized" });
    expect(pool.query).not.toHaveBeenCalled();
  });

  it("should return 400 if bookingId is missing", async () => {
    (getServerSideSession as jest.Mock).mockResolvedValueOnce({
      user: { id: 1 },
    });

    const response = await GET(new Request("http://localhost"), {
      params: Promise.resolve({ bookingId: "" }),
    });

    const json = await response.json();
    expect(response.status).toBe(400);
    expect(json).toEqual({ error: "Booking ID is required" });
    expect(pool.query).not.toHaveBeenCalled();
  });

  it("should return 404 if no booking is found", async () => {
    (getServerSideSession as jest.Mock).mockResolvedValueOnce({
      user: { id: 1 },
    });
    (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [] });

    const response = await GET(new Request("http://localhost"), {
      params: Promise.resolve({ bookingId: "123" }),
    });

    const json = await response.json();
    expect(response.status).toBe(404);
    expect(json).toEqual({ error: "Booking not found" });
  });

  it("should return 200 and booking details when found", async () => {
    (getServerSideSession as jest.Mock).mockResolvedValueOnce({
      user: { id: 1 },
    });
    const mockBooking = {
      booking_id: 123,
      brand: "Tesla",
      model: "Model Y",
      city: "Toronto",
    };
    (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [mockBooking] });

    const response = await GET(new Request("http://localhost"), {
      params: Promise.resolve({ bookingId: "123" }),
    });

    const json = await response.json();
    expect(response.status).toBe(200);
    expect(json).toEqual(mockBooking);
    expect(pool.query).toHaveBeenCalledWith(expect.stringContaining("SELECT"), [
      "123",
    ]);
  });

  it("should return 500 when database query throws an error", async () => {
    (getServerSideSession as jest.Mock).mockResolvedValueOnce({
      user: { id: 1 },
    });
    (pool.query as jest.Mock).mockRejectedValueOnce(new Error("DB failure"));

    const response = await GET(new Request("http://localhost"), {
      params: Promise.resolve({ bookingId: "123" }),
    });

    const json = await response.json();
    expect(response.status).toBe(500);
    expect(json).toEqual({ error: "Failed to fetch booking" });
  });
});
