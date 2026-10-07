/* eslint-disable @typescript-eslint/no-explicit-any */
import { POST } from "./route";
import { getStripe } from "@/lib/stripe";
import { sendEmail } from "@/lib/email";

jest.mock("next/server", () => ({
  NextResponse: {
    json: jest.fn((data, init) => ({
      json: data,
      status: init?.status || 200,
    })),
  },
}));

// Each test scripts the queries run inside the booking transaction.
const txQuery = jest.fn();
jest.mock("@/lib/db", () => ({
  __esModule: true,
  default: { query: jest.fn() },
  withTransaction: jest.fn((fn: any) => fn({ query: txQuery })),
}));

jest.mock("@/lib/schema", () => ({
  ensureSchema: jest.fn().mockResolvedValue(undefined),
}));

jest.mock("@/lib/email", () => ({
  sendEmail: jest.fn().mockResolvedValue(undefined),
}));

jest.mock("@/lib/stripe", () => ({ getStripe: jest.fn() }));

const constructEvent = jest.fn();
const createRefund = jest.fn();

const session = {
  id: "cs_test_1",
  payment_status: "paid",
  amount_total: 23100,
  payment_intent: "pi_1",
  customer_details: { email: "jordan@example.com" },
  metadata: {
    userId: "user_1",
    carId: "car_1",
    startDate: "2030-01-10T05:00:00.000Z",
    endDate: "2030-01-12T05:00:00.000Z",
    subtotal: "200.00",
    total: "231.00",
    redeemedPoints: "100",
  },
};

const request = () =>
  ({
    headers: new Headers({ "stripe-signature": "t=1,v1=abc" }),
    text: async () => "{}",
  }) as any;

/** Routes SQL to canned responses by matching a fragment of each query. */
function scriptQueries(responses: [string, any[]][]) {
  txQuery.mockImplementation(async (sql: string) => {
    const hit = responses.find(([fragment]) => sql.includes(fragment));
    return { rows: hit ? hit[1] : [] };
  });
}

describe("/api/stripe/webhook POST", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    txQuery.mockReset();
    process.env.STRIPE_WEBHOOK_SECRET = "whsec_test";
    (getStripe as jest.Mock).mockReturnValue({
      webhooks: { constructEvent },
      refunds: { create: createRefund },
    });
    constructEvent.mockReturnValue({
      type: "checkout.session.completed",
      data: { object: session },
    });
  });

  it("rejects requests with an invalid signature", async () => {
    constructEvent.mockImplementationOnce(() => {
      throw new Error("bad signature");
    });

    const res: any = await POST(request());

    expect(res.status).toBe(400);
    expect(txQuery).not.toHaveBeenCalled();
  });

  it("creates the booking, moves points, and emails the customer", async () => {
    scriptQueries([
      [
        "FROM cars WHERE id = $1 FOR UPDATE",
        [
          {
            id: "car_1",
            brand: "Tesla",
            model: "Model 3",
            fuel_type: "Electric",
            branch_id: "b1",
          },
        ],
      ],
      ["INSERT INTO bookings", [{ id: "booking_1" }]],
      [
        'SELECT email, name FROM "user"',
        [{ email: "jordan@example.com", name: "Jordan" }],
      ],
      [
        "FROM branches",
        [
          {
            name: "Downtown",
            address: "1 King St",
            city: "Toronto",
            province: "ON",
          },
        ],
      ],
    ]);

    const res: any = await POST(request());

    expect(res.status).toBe(200);
    const sql = txQuery.mock.calls.map(([q, p]) => [q.replace(/\s+/g, " "), p]);
    const insert = sql.find(([q]) => q.includes("INSERT INTO bookings"));
    expect(insert?.[1]).toEqual([
      "user_1",
      "car_1",
      new Date(session.metadata.startDate),
      new Date(session.metadata.endDate),
      200,
      231,
      "cs_test_1",
      "pi_1",
    ]);
    // Redeemed points are deducted (never below zero) and EV points are doubled.
    expect(
      sql.find(([q]) => q.includes("GREATEST(0, reward_points - $1)"))?.[1]
    ).toEqual([100, "user_1"]);
    expect(
      sql.find(([q]) => q.includes("reward_points = reward_points + $1"))?.[1]
    ).toEqual([462, "user_1"]);
    expect(sendEmail).toHaveBeenCalledWith(
      expect.objectContaining({ to: "jordan@example.com" })
    );
    expect(createRefund).not.toHaveBeenCalled();
  });

  it("ignores a retried event for a session that already has a booking", async () => {
    scriptQueries([
      ["FROM cars WHERE id = $1 FOR UPDATE", [{ id: "car_1" }]],
      ["WHERE stripe_session_id = $1", [{ id: "booking_1" }]],
    ]);

    const res: any = await POST(request());

    expect(res.status).toBe(200);
    expect(
      txQuery.mock.calls.some(([q]) => q.includes("INSERT INTO bookings"))
    ).toBe(false);
    expect(sendEmail).not.toHaveBeenCalled();
  });

  it("refunds the payment when the car was booked by someone else first", async () => {
    scriptQueries([
      ["FROM cars WHERE id = $1 FOR UPDATE", [{ id: "car_1" }]],
      ["status <> 'Cancelled'", [{ "?column?": 1 }]],
    ]);

    const res: any = await POST(request());

    expect(res.status).toBe(200);
    expect(
      txQuery.mock.calls.some(([q]) => q.includes("INSERT INTO bookings"))
    ).toBe(false);
    expect(createRefund).toHaveBeenCalledWith(
      expect.objectContaining({ payment_intent: "pi_1" }),
      { idempotencyKey: "conflict-cs_test_1" }
    );
  });

  it("asks Stripe to retry when processing fails", async () => {
    txQuery.mockRejectedValue(new Error("database down"));

    const res: any = await POST(request());

    expect(res.status).toBe(500);
  });
});
