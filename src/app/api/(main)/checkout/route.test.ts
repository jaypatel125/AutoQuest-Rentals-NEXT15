/* eslint-disable @typescript-eslint/no-explicit-any */
import { POST } from "./route";
import db from "@/lib/db";
import { NextResponse } from "next/server";

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

// Mock Stripe with proper hoisting
jest.mock("stripe", () => {
  const mockCreateSession = jest.fn();
  const MockStripe = jest.fn().mockImplementation(() => ({
    checkout: {
      sessions: {
        create: mockCreateSession,
      },
    },
  }));

  // Attach the mock function to the mock for external access
  (MockStripe as any).mockCreateSession = mockCreateSession;
  return MockStripe;
});

// Import the mocked Stripe to get access to mockCreateSession
import Stripe from "stripe";
const mockCreateSession = (Stripe as any).mockCreateSession as jest.Mock;

describe("/api/checkout POST", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.STRIPE_SECRET_KEY = "sk_test_123";
    process.env.NEXT_PUBLIC_APP_URL = "http://localhost:3000";
  });

  it("should return 400 if user is missing", async () => {
    const req = {
      json: async () => ({ currentUser: null }),
    } as any;

    await POST(req);

    expect(NextResponse.json).toHaveBeenCalledWith(
      { error: "User not found" },
      { status: 400 }
    );
  });

  it("should return 400 if total amount is invalid", async () => {
    (db.query as jest.Mock).mockResolvedValueOnce({
      rows: [{ reward_points: 99999 }],
    });

    const req = {
      json: async () => ({
        currentUser: { id: "1", email: "test@example.com" },
        selectedCar: {
          id: "c1",
          brand: "Tesla",
          model: "Model S",
          price_per_day: 10,
          image: "",
        },
        startDate: "2025-10-20",
        endDate: "2025-10-21",
        branch: { id: "b1" },
      }),
    } as any;

    await POST(req);

    expect(NextResponse.json).toHaveBeenCalledWith(
      { error: "Invalid total amount" },
      { status: 400 }
    );
  });

  it("should create a Stripe checkout session successfully", async () => {
    (db.query as jest.Mock).mockResolvedValueOnce({
      rows: [{ reward_points: 100 }],
    });

    mockCreateSession.mockResolvedValueOnce({
      url: "https://stripe.com/success",
    });

    const req = {
      json: async () => ({
        currentUser: { id: "1", email: "test@example.com" },
        selectedCar: {
          id: "car123",
          brand: "Tesla",
          model: "Model 3",
          price_per_day: 100,
          image: "img.png",
        },
        startDate: "2025-10-20",
        endDate: "2025-10-22",
        branch: { id: "branch123" },
      }),
    } as any;

    await POST(req);

    expect(db.query).toHaveBeenCalledWith(
      expect.stringContaining(`SELECT reward_points FROM "user" WHERE id = $1`),
      ["1"]
    );

    expect(mockCreateSession).toHaveBeenCalledWith(
      expect.objectContaining({
        mode: "payment",
        customer_email: "test@example.com",
        metadata: expect.objectContaining({
          userId: "1",
          carId: "car123",
        }),
      })
    );

    expect(NextResponse.json).toHaveBeenCalledWith({
      url: "https://stripe.com/success",
    });
  });

  it("should return 500 when Stripe throws an error", async () => {
    (db.query as jest.Mock).mockResolvedValueOnce({
      rows: [{ reward_points: 0 }],
    });
    mockCreateSession.mockRejectedValueOnce(new Error("Stripe error"));

    const req = {
      json: async () => ({
        currentUser: { id: "1", email: "test@example.com" },
        selectedCar: {
          id: "car123",
          brand: "Tesla",
          model: "Model 3",
          price_per_day: 100,
          image: "img.png",
        },
        startDate: "2025-10-20",
        endDate: "2025-10-22",
        branch: { id: "branch123" },
      }),
    } as any;

    await POST(req);

    expect(NextResponse.json).toHaveBeenCalledWith(
      { error: "Failed to create session" },
      { status: 500 }
    );
  });
});
