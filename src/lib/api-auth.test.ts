/* eslint-disable @typescript-eslint/no-explicit-any */
import { requireAdmin, requireAdminViewer } from "./api-auth";
import { getServerSideSession } from "@/hooks/SessionHandler";
import { READ_ONLY_MESSAGE } from "./roles";

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

const as = (role: string | null) =>
  (getServerSideSession as jest.Mock).mockResolvedValue(
    role === null ? { user: undefined } : { user: { id: "u1", role } }
  );

describe("admin API guards", () => {
  it("requireAdmin lets admins through", async () => {
    as("admin");
    const result = await requireAdmin();
    expect(result.error).toBeUndefined();
    expect(result.user?.id).toBe("u1");
  });

  it("requireAdmin refuses reviewers with a read-only message", async () => {
    as("reviewer");
    const result: any = await requireAdmin();
    expect(result.error.status).toBe(403);
    expect(await result.error.json()).toEqual({ error: READ_ONLY_MESSAGE });
  });

  it("requireAdmin refuses customers and signed-out visitors", async () => {
    as("user");
    expect(((await requireAdmin()) as any).error.status).toBe(403);
    as(null);
    expect(((await requireAdmin()) as any).error.status).toBe(401);
  });

  it("requireAdminViewer lets admins and reviewers read", async () => {
    as("admin");
    expect(await requireAdminViewer()).toMatchObject({ readOnly: false });
    as("reviewer");
    expect(await requireAdminViewer()).toMatchObject({ readOnly: true });
  });

  it("requireAdminViewer refuses customers", async () => {
    as("user");
    expect(((await requireAdminViewer()) as any).error.status).toBe(403);
  });
});
