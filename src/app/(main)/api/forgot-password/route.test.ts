/* eslint-disable @typescript-eslint/no-explicit-any */
import { POST } from "./route";
import { authClient } from "../../../../../auth-client";
import { NextResponse } from "next/server";

// Mock dependencies
jest.mock("../../../../auth-client", () => ({
  authClient: {
    requestPasswordReset: jest.fn(),
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

const mockRequestPasswordReset = authClient.requestPasswordReset as jest.Mock;

describe("Forgot Password POST", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.NEXT_PUBLIC_APP_URL = "http://localhost:3000";
  });

  it("should return 400 if email is missing", async () => {
    const req = {
      json: async () => ({}),
    } as any;

    await POST(req);

    expect(NextResponse.json).toHaveBeenCalledWith(
      { error: "Email is required" },
      { status: 400 }
    );
  });

  it("should successfully send password reset email", async () => {
    mockRequestPasswordReset.mockResolvedValueOnce({ error: null });

    const req = {
      json: async () => ({ email: "test@example.com" }),
    } as any;

    await POST(req);

    expect(mockRequestPasswordReset).toHaveBeenCalledWith({
      email: "test@example.com",
      redirectTo: "http://localhost:3000/reset-password",
    });

    expect(NextResponse.json).toHaveBeenCalledWith(
      { message: "If an account exists, a reset link has been sent." },
      { status: 200 }
    );
  });

  it("should return 400 if auth client returns an error", async () => {
    mockRequestPasswordReset.mockResolvedValueOnce({
      error: { message: "User not found" },
    });

    const req = {
      json: async () => ({ email: "nonexistent@example.com" }),
    } as any;

    await POST(req);

    expect(NextResponse.json).toHaveBeenCalledWith(
      { error: "User not found" },
      { status: 400 }
    );
  });

  it("should return 500 for unexpected errors", async () => {
    const req = {
      json: async () => {
        throw new Error("Database connection failed");
      },
    } as any;

    await POST(req);

    expect(NextResponse.json).toHaveBeenCalledWith(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  });
});
