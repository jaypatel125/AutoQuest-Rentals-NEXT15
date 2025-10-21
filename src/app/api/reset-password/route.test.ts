/* eslint-disable @typescript-eslint/no-explicit-any */
import { POST } from "./route";
import { authClient } from "../../../../auth-client";
import { NextResponse } from "next/server";

// Mock dependencies
jest.mock("../../../../auth-client", () => ({
  authClient: {
    resetPassword: jest.fn(),
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

const mockResetPassword = authClient.resetPassword as unknown as jest.Mock;

describe("Reset Password POST", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return 400 if newPassword or token is missing", async () => {
    const req = {
      json: async () => ({ newPassword: "password123" }), // missing token
    } as any;

    await POST(req);

    expect(NextResponse.json).toHaveBeenCalledWith(
      { error: "Missing password or token" },
      { status: 400 }
    );
  });

  it("should successfully reset password with valid credentials", async () => {
    mockResetPassword.mockResolvedValueOnce({ error: null });

    const req = {
      json: async () => ({
        newPassword: "newSecurePassword123",
        token: "valid-reset-token",
      }),
    } as any;

    await POST(req);

    expect(mockResetPassword).toHaveBeenCalledWith({
      newPassword: "newSecurePassword123",
      token: "valid-reset-token",
    });

    expect(NextResponse.json).toHaveBeenCalledWith(
      { message: "Password reset successful" },
      { status: 200 }
    );
  });

  it("should return 400 if auth client returns an error", async () => {
    mockResetPassword.mockResolvedValueOnce({
      error: { message: "Invalid or expired token" },
    });

    const req = {
      json: async () => ({
        newPassword: "newPassword123",
        token: "expired-token",
      }),
    } as any;

    await POST(req);

    expect(NextResponse.json).toHaveBeenCalledWith(
      { error: "Invalid or expired token" },
      { status: 400 }
    );
  });

  it("should return 500 for unexpected errors", async () => {
    const req = {
      json: async () => {
        throw new Error("Unexpected system error");
      },
    } as any;

    await POST(req);

    expect(NextResponse.json).toHaveBeenCalledWith(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  });
});
