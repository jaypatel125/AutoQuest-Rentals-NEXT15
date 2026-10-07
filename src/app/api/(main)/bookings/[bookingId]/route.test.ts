/* eslint-disable @typescript-eslint/no-explicit-any */
import { GET, PATCH } from "./route";
import pool from "@/lib/db";
import { getServerSideSession } from "@/hooks/SessionHandler";
import { BookingError, cancelBooking } from "@/lib/bookings";

// Mock NextResponse to avoid depending on Web API classes
jest.mock("next/server", () => ({
  NextResponse: {
    json: jest.fn((data, init) => ({
      json: async () => data,
      status: init?.status || 200,
    })),
  },
}));

jest.mock("@/lib/db", () => ({
  query: jest.fn(),
}));

jest.mock("@/hooks/SessionHandler", () => ({
  getServerSideSession: jest.fn(),
}));

jest.mock("@/lib/schema", () => ({
  ensureSchema: jest.fn().mockResolvedValue(undefined),
}));

jest.mock("@/lib/email", () => ({
  sendEmail: jest.fn().mockResolvedValue(undefined),
}));

jest.mock("@/lib/bookings", () => {
  const actual = jest.requireActual("@/lib/bookings");
  return { ...actual, cancelBooking: jest.fn() };
});

const params = (bookingId: string) => ({
  params: Promise.resolve({ bookingId }),
});
const req = {} as Request;

describe("/api/bookings/[bookingId] GET", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return 401 if session is missing", async () => {
    (getServerSideSession as jest.Mock).mockResolvedValueOnce(null);

    const response = await GET(req, params("1"));

    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({ error: "Unauthorized" });
    expect(pool.query).not.toHaveBeenCalled();
  });

  it("should return 400 if bookingId is missing", async () => {
    (getServerSideSession as jest.Mock).mockResolvedValueOnce({
      user: { id: "u1" },
    });

    const response = await GET(req, params(""));

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: "Booking ID is required" });
    expect(pool.query).not.toHaveBeenCalled();
  });

  it("should return 404 if no booking is found", async () => {
    (getServerSideSession as jest.Mock).mockResolvedValueOnce({
      user: { id: "u1" },
    });
    (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [] });

    const response = await GET(req, params("123"));

    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({ error: "Booking not found" });
  });

  it("should return the booking to its owner", async () => {
    (getServerSideSession as jest.Mock).mockResolvedValueOnce({
      user: { id: "u1" },
    });
    const mockBooking = { booking_id: "123", user_id: "u1", brand: "Tesla" };
    (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [mockBooking] });

    const response = await GET(req, params("123"));

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual(mockBooking);
    expect(pool.query).toHaveBeenCalledWith(expect.stringContaining("SELECT"), [
      "123",
    ]);
  });

  it("should hide another customer's booking", async () => {
    (getServerSideSession as jest.Mock).mockResolvedValueOnce({
      user: { id: "attacker", role: "user" },
    });
    (pool.query as jest.Mock).mockResolvedValueOnce({
      rows: [{ booking_id: "123", user_id: "victim" }],
    });

    const response = await GET(req, params("123"));

    expect(response.status).toBe(404);
  });

  it("should let admins read any booking", async () => {
    (getServerSideSession as jest.Mock).mockResolvedValueOnce({
      user: { id: "admin", role: "admin" },
    });
    (pool.query as jest.Mock).mockResolvedValueOnce({
      rows: [{ booking_id: "123", user_id: "someone" }],
    });

    const response = await GET(req, params("123"));

    expect(response.status).toBe(200);
  });

  it("should return 500 when database query throws an error", async () => {
    (getServerSideSession as jest.Mock).mockResolvedValueOnce({
      user: { id: "u1" },
    });
    (pool.query as jest.Mock).mockRejectedValueOnce(new Error("DB failure"));

    const response = await GET(req, params("123"));

    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({ error: "Failed to fetch booking" });
  });
});

describe("/api/bookings/[bookingId] PATCH (cancel)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("requires a signed-in user", async () => {
    (getServerSideSession as jest.Mock).mockResolvedValueOnce(null);

    const response = await PATCH(req, params("123"));

    expect(response.status).toBe(401);
    expect(cancelBooking).not.toHaveBeenCalled();
  });

  it("cancels as the signed-in user", async () => {
    (getServerSideSession as jest.Mock).mockResolvedValueOnce({
      user: { id: "u1" },
    });
    (cancelBooking as jest.Mock).mockResolvedValueOnce({
      bookingId: "123",
      refund: 100,
      fee: 0,
      refundedAutomatically: true,
      pointsReversed: 200,
      pointsReturned: 0,
      booking: {
        brand: "Tesla",
        model: "Model 3",
        start_date: "2026-11-01T00:00:00.000Z",
        end_date: "2026-11-03T00:00:00.000Z",
        email: "a@b.c",
        name: "A",
      },
    });

    const response = await PATCH(req, params("123"));
    const json: any = await response.json();

    expect(cancelBooking).toHaveBeenCalledWith("123", "u1");
    expect(response.status).toBe(200);
    expect(json).toMatchObject({ success: true, refund: 100 });
  });

  it("passes policy errors through with their status", async () => {
    (getServerSideSession as jest.Mock).mockResolvedValueOnce({
      user: { id: "u1" },
    });
    (cancelBooking as jest.Mock).mockRejectedValueOnce(
      new BookingError(409, "Only confirmed bookings can be cancelled.")
    );

    const response = await PATCH(req, params("123"));

    expect(response.status).toBe(409);
    expect(await response.json()).toEqual({
      error: "Only confirmed bookings can be cancelled.",
    });
  });
});
