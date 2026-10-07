/* eslint-disable @typescript-eslint/no-explicit-any */
import { POST } from "./route";
import db from "@/lib/db";
import { getServerSideSession } from "@/hooks/SessionHandler";
import { getStripe } from "@/lib/stripe";

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

jest.mock("@/hooks/SessionHandler", () => ({
  getServerSideSession: jest.fn(),
}));

const mockCreateSession = jest.fn();
jest.mock("@/lib/stripe", () => ({
  getStripe: jest.fn(),
}));

const day = 24 * 60 * 60 * 1000;
const start = new Date(Date.now() + 10 * day);
const end = new Date(start.getTime() + 2 * day);

const car = {
  id: "car123",
  brand: "Tesla",
  model: "Model 3",
  price_per_day: "100.00",
  fuel_type: "Electric",
  image: null,
  available: true,
  branch_id: "b1",
  branch_name: "Downtown",
};

const request = (body: Record<string, unknown>) =>
  ({ json: async () => body }) as any;

const validBody = {
  carId: "car123",
  startDate: start.toISOString(),
  endDate: end.toISOString(),
};

/** Queue the three queries the route makes: car, conflicts, points. */
function mockDb({
  carRow = car as any,
  conflict = false,
  points = 0,
}: { carRow?: any; conflict?: boolean; points?: number } = {}) {
  (db.query as jest.Mock)
    .mockResolvedValueOnce({ rows: carRow ? [carRow] : [] })
    .mockResolvedValueOnce({ rows: conflict ? [{ "?column?": 1 }] : [] })
    .mockResolvedValueOnce({ rows: [{ reward_points: points }] });
}

describe("/api/checkout POST", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Drop queued mockResolvedValueOnce results left by earlier tests.
    (db.query as jest.Mock).mockReset();
    mockCreateSession.mockReset();
    process.env.NEXT_PUBLIC_APP_URL = "https://autoquest.example";
    (getStripe as jest.Mock).mockReturnValue({
      checkout: { sessions: { create: mockCreateSession } },
    });
    (getServerSideSession as jest.Mock).mockResolvedValue({
      user: { id: "user_1", email: "jordan@example.com", role: "user" },
    });
  });

  it("returns 503 when Stripe is not configured", async () => {
    (getStripe as jest.Mock).mockReturnValue(null);
    const res: any = await POST(request(validBody));
    expect(res.status).toBe(503);
  });

  it("requires a signed-in user", async () => {
    (getServerSideSession as jest.Mock).mockResolvedValue({ user: undefined });
    const res: any = await POST(request(validBody));
    expect(res.status).toBe(401);
    expect(db.query).not.toHaveBeenCalled();
  });

  it("does not let admins book", async () => {
    (getServerSideSession as jest.Mock).mockResolvedValue({
      user: { id: "admin_1", role: "admin" },
    });
    const res: any = await POST(request(validBody));
    expect(res.status).toBe(403);
  });

  it("rejects pick-up dates in the past", async () => {
    const res: any = await POST(
      request({ ...validBody, startDate: "2020-01-01", endDate: "2020-01-03" })
    );
    expect(res.status).toBe(400);
    expect(db.query).not.toHaveBeenCalled();
  });

  it("returns 404 for an unknown vehicle", async () => {
    mockDb({ carRow: null });
    const res: any = await POST(request(validBody));
    expect(res.status).toBe(404);
  });

  it("returns 409 when the car is already booked for those dates", async () => {
    mockDb({ conflict: true });
    const res: any = await POST(request(validBody));
    expect(res.status).toBe(409);
    expect(mockCreateSession).not.toHaveBeenCalled();
  });

  it("prices the booking from the database, ignoring client-sent prices and users", async () => {
    mockDb({ points: 100 });
    mockCreateSession.mockResolvedValueOnce({ url: "https://stripe.test/pay" });

    const res: any = await POST(
      request({
        ...validBody,
        // Fields an attacker might add; the server must ignore them.
        selectedCar: { id: "car123", price_per_day: 0.01 },
        currentUser: { id: "someone_else", email: "x@y.z" },
      })
    );

    expect(res.json).toEqual({ url: "https://stripe.test/pay" });
    const args = mockCreateSession.mock.calls[0][0];
    // 2 days x $100 + $15 fee + 13% HST on $200 - 100 points ($10) = $231.00
    expect(args.line_items[0].price_data.unit_amount).toBe(23100);
    expect(args.customer_email).toBe("jordan@example.com");
    expect(args.metadata).toMatchObject({
      userId: "user_1",
      carId: "car123",
      branch: "b1",
      redeemedPoints: "100",
      subtotal: "200.00",
      total: "231.00",
    });
  });

  it("skips the points discount when the customer opts out", async () => {
    mockDb({ points: 100 });
    mockCreateSession.mockResolvedValueOnce({ url: "https://stripe.test/pay" });

    await POST(request({ ...validBody, redeemPoints: false }));

    const args = mockCreateSession.mock.calls[0][0];
    expect(args.line_items[0].price_data.unit_amount).toBe(24100);
    expect(args.metadata.redeemedPoints).toBe("0");
  });

  it("returns 500 when Stripe throws an error", async () => {
    mockDb();
    mockCreateSession.mockRejectedValueOnce(new Error("Stripe error"));

    const res: any = await POST(request(validBody));

    expect(res.status).toBe(500);
    expect(res.json).toEqual({
      error: "We couldn't start the payment. Please try again in a moment.",
    });
  });
});
