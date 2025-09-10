import { NextResponse } from "next/server";
import { Pool } from "pg";
import { hash } from "bcryptjs";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

export async function POST(req: Request) {
  try {
    const { token, password } = await req.json();

    if (!token || !password) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const client = await pool.connect();

    try {
      // Find reset token
      const tokenRes = await client.query(
        `SELECT user_id, expires_at FROM reset_tokens WHERE token = $1`,
        [token]
      );

      if (tokenRes.rows.length === 0) {
        return NextResponse.json(
          { error: "Invalid or expired token" },
          { status: 400 }
        );
      }

      const resetToken = tokenRes.rows[0];

      if (new Date(resetToken.expires_at) < new Date()) {
        return NextResponse.json(
          { error: "Token has expired" },
          { status: 400 }
        );
      }

      // Hash password
      const hashedPassword = await hash(password, 10);

      // Update user password
      await client.query(`UPDATE 'user' SET password = $1 WHERE id = $2`, [
        hashedPassword,
        resetToken.user_id,
      ]);

      // Delete token after use
      await client.query(`DELETE FROM reset_tokens WHERE user_id = $1`, [
        resetToken.user_id,
      ]);

      return NextResponse.json(
        { message: "Password reset successful" },
        { status: 200 }
      );
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
