/* eslint-disable @typescript-eslint/no-explicit-any */
import { POST } from "./route";
import { auth } from "../../../../auth";
import { NextResponse } from "next/server";

// Mock NextResponse
jest.mock("next/server", () => ({
  NextResponse: {
    json: jest.fn((data, init) => ({
      json: data,
      status: init?.status || 200,
    })),
  },
}));

// Mock auth API
jest.mock("../../../../auth", () => ({
  auth: {
    api: {
      signInEmail: jest.fn(),
    },
  },
}));

describe("/api/auth/sign-in POST", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return 400 if body validation fails", async () => {
    const req = {
      json: async () => ({ email: "invalid-email", password: "" }),
    } as any;

    const response = await POST(req);

    expect(NextResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: expect.any(Object) }),
      { status: 400 }
    );
    expect(response.status).toBe(400);
  });

  it("should return 200 if sign-in is successful", async () => {
    (auth.api.signInEmail as unknown as jest.Mock).mockResolvedValueOnce({
      user: { id: "1" },
    });

    const req = {
      json: async () => ({
        email: "test@example.com",
        password: "password123",
      }),
    } as any;

    const response = await POST(req);

    expect(auth.api.signInEmail).toHaveBeenCalledWith({
      body: { email: "test@example.com", password: "password123" },
    });

    expect(NextResponse.json).toHaveBeenCalledWith(
      { message: "Signed in was successful" },
      { status: 200 }
    );
    expect(response.status).toBe(200);
  });

  it("should return 400 if sign-in fails", async () => {
    (auth.api.signInEmail as unknown as jest.Mock).mockResolvedValueOnce({
      user: null,
    });

    const req = {
      json: async () => ({ email: "test@example.com", password: "wrongpass" }),
    } as any;

    const response = await POST(req);

    expect(NextResponse.json).toHaveBeenCalledWith(
      { error: "Sign-in failed" },
      { status: 400 }
    );
    expect(response.status).toBe(400);
  });

  it("should return 500 on unexpected errors", async () => {
    (auth.api.signInEmail as unknown as jest.Mock).mockRejectedValueOnce(
      new Error("Server error")
    );

    const req = {
      json: async () => ({
        email: "test@example.com",
        password: "password123",
      }),
    } as any;

    const response = await POST(req);

    expect(NextResponse.json).toHaveBeenCalledWith(
      { error: "Internal server error" },
      { status: 500 }
    );
    expect(response.status).toBe(500);
  });
});
