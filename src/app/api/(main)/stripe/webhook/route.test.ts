/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { POST } from "./route";
import db from "@/lib/db";
import { stripe } from "@/lib/stripe";
import { NextResponse } from "next/server";

// Mock dependencies
jest.mock("@/lib/db", () => ({
  query: jest.fn(),
}));

jest.mock("@/lib/stripe", () => ({
  stripe: {
    webhooks: {
      constructEvent: jest.fn(),
    },
  },
}));

jest.mock("next/server", () => ({
  NextResponse: {
    json: jest.fn((data, init) => ({
      json: data,
      status: init?.status || 200,
    })),
  },
}));

const mockConstructEvent = stripe.webhooks.constructEvent as jest.Mock;
const mockDbQuery = db.query as jest.Mock;

describe("Stripe Webhook POST", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.STRIPE_WEBHOOK_SECRET = "whsec_test";
  });

  it("should return 400 if webhook signature verification fails", async () => {
    mockConstructEvent.mockImplementation(() => {
      throw new Error("Invalid signature");
    });

    const req = {
      headers: {
        get: jest.fn().mockReturnValue("invalid_signature"),
      },
      text: jest.fn().mockResolvedValue("webhook_body"),
    } as any;

    const response = await POST(req);

    expect(NextResponse.json).toHaveBeenCalledWith(
      { error: "Webhook handler failed" },
      { status: 400 }
    );
  });

  it("should process checkout.session.completed event for vehicle", async () => {
    const mockSession = {
      metadata: {
        userId: "user123",
        carId: "car456",
        startDate: "2025-01-01",
        endDate: "2025-01-05",
        total: "300.00",
        redeemedPoints: "0",
      },
    };

    mockConstructEvent.mockReturnValue({
      type: "checkout.session.completed",
      data: { object: mockSession },
    });

    mockDbQuery
      .mockResolvedValueOnce({
        rows: [{ id: "booking123" }],
      })
      // Car fuel type query (Gasoline)
      .mockResolvedValueOnce({
        rows: [{ fuel_type: "Gasoline" }],
      })
      // Points update (no redemption for 0 points)
      .mockResolvedValueOnce({})
      // Rewards history insertion
      .mockResolvedValueOnce({});

    const req = {
      headers: {
        get: jest.fn().mockReturnValue("valid_signature"),
      },
      text: jest.fn().mockResolvedValue("webhook_body"),
    } as any;

    await POST(req);

    // Verify standard points (300 * 1 = 300 points)
    expect(mockDbQuery).toHaveBeenCalledWith(
      expect.stringContaining(
        'UPDATE "user" SET reward_points = reward_points + $1'
      ),
      [300, "user123"]
    );

    // Should not call points redemption for 0 points
    expect(mockDbQuery).not.toHaveBeenCalledWith(
      expect.stringContaining("reward_points -"),
      [0, "user123"]
    );
  });
});
