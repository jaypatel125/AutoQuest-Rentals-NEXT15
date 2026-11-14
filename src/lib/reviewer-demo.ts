// Shared, read-only demo login so anyone can look around the admin area.
// Server only: it reads settings from the environment and writes to the
// database.
import { randomUUID } from "node:crypto";
import { hashPassword, verifyPassword } from "better-auth/crypto";
import pool, { withTransaction } from "@/lib/db";
import { canEditAdmin } from "@/lib/roles";

export interface ReviewerDemo {
  email: string;
  password: string;
}

const DEFAULT_EMAIL = "reviewer@example.com";
const DEFAULT_PASSWORD = "Reviewer123!";

/**
 * The public demo credentials, or null when the demo is turned off with
 * REVIEWER_DEMO=off. The email defaults to example.com, which can never
 * receive mail, so nobody can take the account over by email.
 */
export function getReviewerDemo(): ReviewerDemo | null {
  if ((process.env.REVIEWER_DEMO ?? "").toLowerCase() === "off") return null;
  const email = (process.env.REVIEWER_DEMO_EMAIL || DEFAULT_EMAIL)
    .trim()
    .toLowerCase();
  const password = process.env.REVIEWER_DEMO_PASSWORD || DEFAULT_PASSWORD;
  if (!email.includes("@") || password.length < 8) return null;
  return { email, password };
}

type Outcome = "created" | "repaired" | "ok" | "skipped";

/**
 * Makes sure the demo account exists, has the reviewer role, is verified
 * and still uses the published password. Never touches an admin account,
 * and leaves a ban in place so admins can switch the demo off.
 */
export async function provisionReviewer(demo: ReviewerDemo): Promise<Outcome> {
  return withTransaction(async (client) => {
    const { rows } = await client.query(
      `SELECT id, role, "emailVerified" AS verified
       FROM "user" WHERE lower(email) = $1
       FOR UPDATE`,
      [demo.email]
    );
    let userId: string;
    let outcome: Outcome = "ok";

    if (rows[0]) {
      if (canEditAdmin(rows[0].role)) {
        console.warn(
          "Reviewer demo email belongs to an admin account; demo account left unchanged."
        );
        return "skipped";
      }
      userId = rows[0].id;
      if (rows[0].role !== "reviewer" || !rows[0].verified) {
        await client.query(
          `UPDATE "user" SET role = 'reviewer', "emailVerified" = true,
             "updatedAt" = now()
           WHERE id = $1`,
          [userId]
        );
        outcome = "repaired";
      }
    } else {
      userId = randomUUID();
      await client.query(
        `INSERT INTO "user"
           (id, name, email, "emailVerified", role, reward_points,
            "createdAt", "updatedAt")
         VALUES ($1, 'Demo Reviewer', $2, true, 'reviewer', 0, now(), now())`,
        [userId, demo.email]
      );
      outcome = "created";
    }

    const { rows: accounts } = await client.query(
      `SELECT id, password FROM account
       WHERE "userId" = $1 AND "providerId" = 'credential'`,
      [userId]
    );
    const current = accounts[0];
    // An unreadable hash (edited by hand, or from another scheme) counts as
    // a mismatch so it gets replaced instead of blocking the repair.
    const matches =
      !!current?.password &&
      (await verifyPassword({
        hash: current.password,
        password: demo.password,
      }).catch(() => false));
    if (!matches) {
      const hash = await hashPassword(demo.password);
      if (current) {
        await client.query(
          `UPDATE account SET password = $1, "updatedAt" = now() WHERE id = $2`,
          [hash, current.id]
        );
      } else {
        await client.query(
          `INSERT INTO account
             (id, "accountId", "providerId", "userId", password,
              "createdAt", "updatedAt")
           VALUES ($1, $2, 'credential', $2, $3, now(), now())`,
          [randomUUID(), userId, hash]
        );
      }
      if (outcome === "ok") outcome = "repaired";
    }
    return outcome;
  });
}

/** True when the email belongs to the public demo reviewer account. */
export function isDemoReviewerEmail(email: string | null | undefined) {
  const demo = getReviewerDemo();
  return !!demo && !!email && email.toLowerCase() === demo.email;
}

/** True when the user id belongs to the public demo reviewer account. */
export async function isDemoReviewerId(userId: unknown) {
  const demo = getReviewerDemo();
  if (!demo || typeof userId !== "string" || !userId) return false;
  const { rows } = await pool.query(
    `SELECT 1 FROM "user" WHERE id = $1 AND lower(email) = $2`,
    [userId, demo.email]
  );
  return rows.length > 0;
}

let ready: Promise<ReviewerDemo | null> | null = null;

/**
 * Returns the demo credentials once the account is ready, or null when the
 * demo is off or the database can't be reached. Runs at most once per
 * server instance; a failure is retried on the next call.
 */
export function ensureReviewerDemo(): Promise<ReviewerDemo | null> {
  const demo = getReviewerDemo();
  if (!demo) return Promise.resolve(null);
  if (!ready) {
    ready = provisionReviewer(demo)
      .then((outcome) => (outcome === "skipped" ? null : demo))
      .catch((err) => {
        console.error("Could not prepare the reviewer demo account:", err);
        ready = null;
        return null;
      });
  }
  return ready;
}
