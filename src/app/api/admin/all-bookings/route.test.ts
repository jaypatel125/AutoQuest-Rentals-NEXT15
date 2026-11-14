/* eslint-disable @typescript-eslint/no-explicit-any */
import { GET } from "./route";
import { getServerSideSession } from "@/hooks/SessionHandler";

const rows = [
  {
    id: "b1",
    status: "Confirmed",
    name: "Jordan Rivers",
    email: "jordan@autoquest.test",
    vehicle_brand: "Tesla",
  },
];

jest.mock("@/lib/db", () => ({
  __esModule: true,
  default: {
    connect: jest.fn(async () => ({
      query: jest.fn(async () => ({ rows })),
      release: jest.fn(),
    })),
  },
}));

jest.mock("@/lib/schema", () => ({ ensureSchema: jest.fn() }));

jest.mock("@/hooks/SessionHandler", () => ({
  getServerSideSession: jest.fn(),
}));

jest.mock("next/server", () => ({
  NextResponse: {
    json: jest.fn((data, options) => ({
      status: options?.status || 200,
      json: async () => data,
    })),
  },
}));

const as = (role: string) =>
  (getServerSideSession as jest.Mock).mockResolvedValue({
    user: { id: "u1", role },
  });

describe("GET /api/admin/all-bookings", () => {
  it("returns full customer details to admins", async () => {
    as("admin");
    const res: any = await GET();
    expect(res.status).toBe(200);
    expect((await res.json())[0]).toMatchObject({
      name: "Jordan Rivers",
      email: "jordan@autoquest.test",
    });
  });

  it("lets reviewers read bookings with customer details masked", async () => {
    as("reviewer");
    const res: any = await GET();
    expect(res.status).toBe(200);
    expect((await res.json())[0]).toMatchObject({
      name: "Jordan R.",
      email: "j•••@a•••.test",
      vehicle_brand: "Tesla",
    });
  });

  it("refuses customers", async () => {
    as("user");
    const res: any = await GET();
    expect(res.status).toBe(403);
  });
});
