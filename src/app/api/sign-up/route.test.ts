/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { POST } from "./route";
import { authClient } from "../../../../auth-client";
import { signUpSchema } from "@/lib/zod";
import { NextResponse } from "next/server";

// Mock dependencies
jest.mock("../../../../auth-client", () => ({
  authClient: {
    signUp: {
      email: jest.fn(),
    },
  },
}));

jest.mock("@/lib/zod", () => ({
  signUpSchema: {
    safeParse: jest.fn(),
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

const mockSignUpEmail = authClient.signUp.email as jest.Mock;
const mockSafeParse = signUpSchema.safeParse as jest.Mock;

describe("Sign-up POST", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return 400 for invalid request body", async () => {
    const mockError = {
      success: false,
      error: {
        format: () => ({
          name: "Name is required",
          email: "Invalid email format",
        }),
      },
    };
    mockSafeParse.mockReturnValueOnce(mockError);

    const req = {
      json: async () => ({
        name: "",
        email: "invalid-email",
        password: "short",
      }),
    } as any;

    const response = await POST(req);

    expect(NextResponse.json).toHaveBeenCalledWith(
      { error: { name: "Name is required", email: "Invalid email format" } },
      { status: 400 }
    );
  });

  it("should successfully create user with valid data", async () => {
    mockSafeParse.mockReturnValueOnce({
      success: true,
      data: {
        name: "John Doe",
        email: "john@example.com",
        password: "securePassword123",
      },
    });
    mockSignUpEmail.mockResolvedValueOnce({ error: null });

    const req = {
      json: async () => ({
        name: "John Doe",
        email: "john@example.com",
        password: "securePassword123",
      }),
    } as any;

    await POST(req);

    expect(mockSignUpEmail).toHaveBeenCalledWith({
      name: "John Doe",
      email: "john@example.com",
      password: "securePassword123",
    });

    expect(NextResponse.json).toHaveBeenCalledWith(
      { success: true },
      { status: 200 }
    );
  });

  it("should return 400 when auth client returns an error", async () => {
    mockSafeParse.mockReturnValueOnce({
      success: true,
      data: {
        name: "Jane Doe",
        email: "jane@example.com",
        password: "password123",
      },
    });
    mockSignUpEmail.mockResolvedValueOnce({
      error: { message: "Email already exists" },
    });

    const req = {
      json: async () => ({
        name: "Jane Doe",
        email: "jane@example.com",
        password: "password123",
      }),
    } as any;

    await POST(req);

    expect(NextResponse.json).toHaveBeenCalledWith(
      { error: "Email already exists" },
      { status: 400 }
    );
  });

  it("should return 500 for unexpected errors", async () => {
    mockSafeParse.mockReturnValueOnce({
      success: true,
      data: {
        name: "Test User",
        email: "test@example.com",
        password: "password123",
      },
    });
    mockSignUpEmail.mockRejectedValueOnce(
      new Error("Database connection failed")
    );

    const req = {
      json: async () => ({
        name: "Test User",
        email: "test@example.com",
        password: "password123",
      }),
    } as any;

    await POST(req);

    expect(NextResponse.json).toHaveBeenCalledWith(
      { success: false },
      { status: 500 }
    );
  });
});
