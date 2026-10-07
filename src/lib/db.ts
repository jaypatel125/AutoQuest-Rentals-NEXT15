import { Pool, type PoolClient, type PoolConfig } from "pg";

/**
 * TLS settings for the connection pool.
 * - An explicit `sslmode` in DATABASE_URL always wins (pg parses it itself).
 * - Local databases connect without TLS.
 * - Everything else verifies the server certificate. Set
 *   DATABASE_SSL_REJECT_UNAUTHORIZED=false only for providers with
 *   self-signed certificates.
 */
function sslConfig(url: string | undefined): PoolConfig["ssl"] {
  if (!url || /[?&]sslmode=/.test(url)) return undefined;
  if (/@(localhost|127\.0\.0\.1)(:\d+)?\//.test(url)) return false;
  return {
    rejectUnauthorized:
      process.env.DATABASE_SSL_REJECT_UNAUTHORIZED !== "false",
  };
}

// Reuse one pool across hot reloads in development and across modules
// (auth and the app share it).
const globalForPg = globalThis as unknown as { autoquestPool?: Pool };

const pool =
  globalForPg.autoquestPool ??
  new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: sslConfig(process.env.DATABASE_URL),
    max: Number(process.env.DATABASE_POOL_MAX ?? 5),
  });

globalForPg.autoquestPool = pool;

export async function withTransaction<T>(
  fn: (client: PoolClient) => Promise<T>
): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const result = await fn(client);
    await client.query("COMMIT");
    return result;
  } catch (err) {
    await client.query("ROLLBACK").catch(() => {});
    throw err;
  } finally {
    client.release();
  }
}

export default pool;
