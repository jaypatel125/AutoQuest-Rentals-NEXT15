/* eslint-disable @typescript-eslint/no-explicit-any */
import { getReviewerDemo, provisionReviewer } from "./reviewer-demo";
import { hashPassword, verifyPassword } from "better-auth/crypto";

jest.mock("better-auth/crypto", () => ({
  hashPassword: jest.fn(async (p: string) => `hash:${p}`),
  verifyPassword: jest.fn(),
}));

// A fake transaction client: answers the two lookups and records writes.
const client = { query: jest.fn() };
jest.mock("@/lib/db", () => ({
  __esModule: true,
  default: { query: jest.fn() },
  withTransaction: jest.fn((fn: any) => fn(client)),
}));

const demo = { email: "reviewer@example.com", password: "Reviewer123!" };

function answer(user: any, account: any) {
  client.query.mockImplementation(async (sql: string) => {
    if (/FROM "user"/.test(sql)) return { rows: user ? [user] : [] };
    if (/FROM account/.test(sql)) return { rows: account ? [account] : [] };
    return { rows: [] };
  });
}
const writes = () =>
  client.query.mock.calls
    .map(([sql]) => sql as string)
    .filter((sql) => /^\s*(INSERT|UPDATE)/.test(sql));

describe("reviewer demo settings", () => {
  const env = process.env;
  afterEach(() => {
    process.env = env;
  });

  it("is on by default with example.com credentials", () => {
    process.env = { ...env };
    delete process.env.REVIEWER_DEMO;
    delete process.env.REVIEWER_DEMO_EMAIL;
    delete process.env.REVIEWER_DEMO_PASSWORD;
    expect(getReviewerDemo()).toEqual(demo);
  });

  it("can be turned off or customised", () => {
    process.env = { ...env, REVIEWER_DEMO: "off" };
    expect(getReviewerDemo()).toBeNull();
    process.env = {
      ...env,
      REVIEWER_DEMO: "on",
      REVIEWER_DEMO_EMAIL: " Demo@Example.org ",
      REVIEWER_DEMO_PASSWORD: "LongEnough1",
    };
    expect(getReviewerDemo()).toEqual({
      email: "demo@example.org",
      password: "LongEnough1",
    });
  });

  it("ignores a password too short to sign in with", () => {
    process.env = { ...env, REVIEWER_DEMO_PASSWORD: "short" };
    expect(getReviewerDemo()).toBeNull();
  });
});

describe("provisionReviewer", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    client.query.mockReset();
  });

  it("creates a verified reviewer with a credential account", async () => {
    answer(null, null);
    expect(await provisionReviewer(demo)).toBe("created");
    const sql = writes();
    expect(sql[0]).toMatch(/INSERT INTO "user"/);
    expect(sql[0]).toMatch(/'reviewer'/);
    expect(sql[1]).toMatch(/INSERT INTO account/);
    expect(hashPassword).toHaveBeenCalledWith("Reviewer123!");
  });

  it("does nothing when the account is already correct", async () => {
    answer(
      { id: "r1", role: "reviewer", verified: true },
      { id: "a1", password: "hash" }
    );
    (verifyPassword as jest.Mock).mockResolvedValue(true);
    expect(await provisionReviewer(demo)).toBe("ok");
    expect(writes()).toHaveLength(0);
  });

  it("restores the role and a changed password", async () => {
    answer(
      { id: "r1", role: "user", verified: false },
      { id: "a1", password: "other" }
    );
    (verifyPassword as jest.Mock).mockResolvedValue(false);
    expect(await provisionReviewer(demo)).toBe("repaired");
    const sql = writes();
    expect(sql[0]).toMatch(/UPDATE "user" SET role = 'reviewer'/);
    expect(sql[1]).toMatch(/UPDATE account SET password/);
  });

  it("replaces a password hash it can't read", async () => {
    answer(
      { id: "r1", role: "reviewer", verified: true },
      { id: "a1", password: "garbage" }
    );
    (verifyPassword as jest.Mock).mockRejectedValue(
      new Error("Invalid password hash")
    );
    expect(await provisionReviewer(demo)).toBe("repaired");
    expect(writes()[0]).toMatch(/UPDATE account SET password/);
  });

  it("never touches an admin account that shares the demo email", async () => {
    answer({ id: "a1", role: "admin", verified: true }, null);
    jest.spyOn(console, "warn").mockImplementation(() => {});
    expect(await provisionReviewer(demo)).toBe("skipped");
    expect(writes()).toHaveLength(0);
  });
});
