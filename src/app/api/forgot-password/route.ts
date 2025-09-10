import { NextResponse } from "next/server";
import { Pool } from "pg";
import { sendEmail } from "@/lib/email";
import crypto from "crypto";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const client = await pool.connect();

    try {
      const userRes = await client.query(
        `SELECT id, email FROM "user" WHERE email = $1`,
        [email]
      );

      if (userRes.rows.length === 0) {
        return NextResponse.json(
          { message: "If an account exists, a reset link was sent." },
          { status: 200 }
        );
      }

      const user = userRes.rows[0];

      const token = crypto.randomBytes(32).toString("hex");
      const expiresAt = new Date(Date.now() + 1000 * 60 * 15);

      await client.query(
        `INSERT INTO reset_tokens (user_id, token, expires_at) 
         VALUES ($1, $2, $3) 
         ON CONFLICT (user_id) DO UPDATE 
         SET token = EXCLUDED.token, expires_at = EXCLUDED.expires_at`,
        [user.id, token, expiresAt]
      );

      const resetUrl = `${process.env.BASE_URL}/reset-password?token=${token}`;

      await sendEmail({
        to: user.email,
        subject: "Reset your AutoQuest password",
        text: `Hello,

We received a request to reset the password for your AutoQuest account.  
Please click the link below to create a new password:

${resetUrl}

For your security, this link will expire in 15 minutes.  
If you did not request a password reset, you can safely ignore this email.

Best regards,  
The AutoQuest Team
`,
      });

      return NextResponse.json(
        { message: "If an account exists, a reset link was sent." },
        { status: 200 }
      );
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
