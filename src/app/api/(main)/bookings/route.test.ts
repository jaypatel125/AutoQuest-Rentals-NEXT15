import { GET } from "./route";
import pool from "@/lib/db";
import { getServerSideSession } from "@/hooks/SessionHandler";

// Mock NextResponse to avoid using the Web API environment
jest.mock("next/server", () => ({
  NextResponse: {
    json: jest.fn((data, init) => ({
      json: async () => data,
      status: init?.status || 200,
    })),
  },
}));

// Mock the DB and session handler
jest.mock("@/lib/db", () => ({
  query: jest.fn(),
}));

jest.mock("@/hooks/SessionHandler", () => ({
  getServerSideSession: jest.fn(),
}));

jest.mock("@/lib/schema", () => ({
  ensureSchema: jest.fn().mockResolvedValue(undefined),
}));

describe("/api/get-bookings GET", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return 401 if the visitor is not signed in", async () => {
    (getServerSideSession as jest.Mock).mockResolvedValueOnce({ user: null });

    const response = await GET();
    const json = await response.json();

    expect(response.status).toBe(401);
    expect(json).toEqual({ error: "Unauthorized" });
    expect(pool.query).not.toHaveBeenCalled();
  });

  it("should return 200 and bookings list when query succeeds", async () => {
    (getServerSideSession as jest.Mock).mockResolvedValueOnce({
      user: { id: 123 },
    });

    const mockRows = [
      {
        booking_id: 1,
        brand: "Tesla",
        model: "Model 3",
        price_per_day: 120,
        city: "Toronto",
      },
    ];

    (pool.query as jest.Mock).mockResolvedValueOnce({ rows: mockRows });

    const response = await GET();
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json).toEqual(mockRows);
    expect(pool.query).toHaveBeenCalledWith(
      expect.stringContaining("SELECT"),
      [123]
    );
  });

  it("should return 500 if database query fails", async () => {
    (getServerSideSession as jest.Mock).mockResolvedValueOnce({
      user: { id: 123 },
    });
    (pool.query as jest.Mock).mockRejectedValueOnce(new Error("DB error"));

    const response = await GET();
    const json = await response.json();

    expect(response.status).toBe(500);
    expect(json).toEqual({ error: "Failed to fetch bookings" });
  });
});
