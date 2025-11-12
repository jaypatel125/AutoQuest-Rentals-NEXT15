/* eslint-disable @typescript-eslint/no-explicit-any */
import { sendEmail } from "@/lib/email";
import { POST } from "./route";
jest.mock("@/lib/email", () => ({
  sendEmail: jest.fn(),
}));

// Mock NextResponse since it's part of the Next.js server environment
jest.mock("next/server", () => ({
  NextResponse: {
    json: jest.fn((data, init) => ({ data, status: init?.status || 200 })),
  },
}));

describe("POST /api/contact", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns 400 if fields are missing", async () => {
    // Simulate a Request with missing fields
    const req = {
      json: async () => ({ name: "Jay" }),
    } as any;

    const response = await POST(req);
    expect(response.status).toBe(400);
    // @ts-expect-error - response is a mocked object, not a real NextResponse
    expect(response.data.error).toBe("All fields are required");
  });

  it("sends an email successfully when all fields are provided", async () => {
    (sendEmail as jest.Mock).mockResolvedValueOnce(true);

    const req = {
      json: async () => ({
        name: "Jay",
        email: "jay@example.com",
        message: "Hello!",
      }),
    } as any;

    const response = await POST(req);

    expect(sendEmail).toHaveBeenCalledTimes(1);
    expect(response.status).toBe(200);
    // @ts-expect-error - response is a mocked object, not a real NextResponse
    expect(response.data.success).toBe(true);
  });

  it("returns 500 if sendEmail throws an error", async () => {
    (sendEmail as jest.Mock).mockRejectedValueOnce(new Error("SMTP failed"));

    const req = {
      json: async () => ({
        name: "Jay",
        email: "jay@example.com",
        message: "This will fail",
      }),
    } as any;

    const response = await POST(req);

    expect(sendEmail).toHaveBeenCalledTimes(1);
    expect(response.status).toBe(500);
    // @ts-expect-error - response is a mocked object, not a real NextResponse
    expect(response.data.error).toBe("Failed to send message");
  });
});
