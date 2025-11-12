/* eslint-disable @typescript-eslint/no-require-imports */

import { POST } from "./route";

// Mock everything
jest.mock("@/lib/db", () => ({
  query: jest.fn(),
}));

jest.mock("@/hooks/SessionHandler", () => ({
  getServerSideSession: jest.fn(),
}));

// Mock NextResponse
jest.mock("next/server", () => ({
  NextResponse: {
    json: jest.fn((data, options) => ({
      status: options?.status || 200,
      json: async () => data,
    })),
  },
}));

describe("POST /api/admin/add-branch", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should create branch successfully", async () => {
    // Mock admin session
    const { getServerSideSession } = require("@/hooks/SessionHandler");
    getServerSideSession.mockResolvedValue({
      user: { role: "admin" },
    });

    // Mock database
    const pool = require("@/lib/db");
    pool.query.mockResolvedValue({
      rows: [{ id: 1, name: "Test Branch" }],
    });

    // Mock request
    const mockRequest = {
      json: jest.fn().mockResolvedValue({
        name: "Test Branch",
        address: "123 Test St",
        city: "Test City",
        province: "Test Province",
        postal_code: "12345",
      }),
    };

    // @ts-expect-error - we're mocking the request
    const response = await POST(mockRequest);

    expect(response.status).toBe(201);
  });

  test("should reject unauthorized user", async () => {
    const { getServerSideSession } = require("@/hooks/SessionHandler");
    getServerSideSession.mockResolvedValue(null);

    const mockRequest = {
      json: jest.fn().mockResolvedValue({}),
    };

    // @ts-expect-error - we're mocking the request
    const response = await POST(mockRequest);

    expect(response.status).toBe(401);
  });
});
