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

let ip = 0;
const request = (body: unknown) =>
  ({
    json: async () => body,
    // A fresh client address per request keeps the rate limiter out of the way.
    headers: new Headers({ "x-forwarded-for": `10.0.0.${++ip}` }),
  }) as any;

const valid = {
  name: "Jay",
  email: "jay@example.com",
  message: "Hello! I have a question about EVs.",
};

describe("POST /api/contact", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns 400 if fields are missing", async () => {
    const response: any = await POST(request({ name: "Jay" }));
    expect(response.status).toBe(400);
    expect(response.data.error).toBe("All fields are required");
    expect(sendEmail).not.toHaveBeenCalled();
  });

  it("sends an email successfully when all fields are provided", async () => {
    (sendEmail as jest.Mock).mockResolvedValueOnce(true);

    const response: any = await POST(request(valid));

    expect(sendEmail).toHaveBeenCalledTimes(1);
    expect(response.status).toBe(200);
    expect(response.data.success).toBe(true);
  });

  it("escapes HTML in the message before emailing it", async () => {
    (sendEmail as jest.Mock).mockResolvedValueOnce(true);

    await POST(
      request({
        ...valid,
        name: '<img src=x onerror="alert(1)">',
        message: "<script>alert('pwned')</script> please help",
      })
    );

    const { html, replyTo } = (sendEmail as jest.Mock).mock.calls[0][0];
    expect(html).not.toContain("<script>");
    expect(html).not.toContain("<img src=x");
    expect(html).toContain("&lt;script&gt;");
    expect(replyTo).toBe(valid.email);
  });

  it("silently drops submissions that fill the honeypot", async () => {
    const response: any = await POST(
      request({ ...valid, website: "http://spam.example" })
    );

    expect(response.status).toBe(200);
    expect(sendEmail).not.toHaveBeenCalled();
  });

  it("rate limits repeated messages from one address", async () => {
    (sendEmail as jest.Mock).mockResolvedValue(true);
    const req = () =>
      ({
        json: async () => valid,
        headers: new Headers({ "x-forwarded-for": "192.168.1.1" }),
      }) as any;

    const statuses = [];
    for (let i = 0; i < 6; i++)
      statuses.push(((await POST(req())) as any).status);

    expect(statuses.slice(0, 5)).toEqual([200, 200, 200, 200, 200]);
    expect(statuses[5]).toBe(429);
  });

  it("returns 500 if sendEmail throws an error", async () => {
    (sendEmail as jest.Mock).mockRejectedValueOnce(new Error("SMTP failed"));

    const response: any = await POST(request(valid));

    expect(sendEmail).toHaveBeenCalledTimes(1);
    expect(response.status).toBe(500);
    expect(response.data.error).toBe("Failed to send message");
  });
});
