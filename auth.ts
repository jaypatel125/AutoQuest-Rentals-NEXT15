import { sendEmail } from "@/lib/email";
import { betterAuth, BetterAuthOptions } from "better-auth";
import { openAPI } from "better-auth/plugins";
import { admin } from "better-auth/plugins";
import { Pool } from "pg";
// import { sendEmail } from "./src/lib/email";

export const auth = betterAuth({
  database: new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  }),
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // 5 minutes
    },
  },
  user: {
    changeEmail: { enabled: true },
    deleteUser: { enabled: true },
  },
  plugins: [
    openAPI(),
    admin({ impersonationSessionDuration: 60 * 60 * 24 * 7 }),
  ],
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, token }) => {
      const verificationUrl = `${process.env.BASE_URL}/api/auth/verify-email?token=${token}&callbackURL=${process.env.EMAIL_VERIFICATION_CALLBACK_URL}`;

      await sendEmail({
        to: user.email,
        subject: "Verify your email",
        text: `Hello,

Thank you for signing up with AutoQuest.  
Please verify your email address by clicking the link below:

${verificationUrl}

If you did not create an account, please ignore this message.

Best regards,  
The AutoQuest Team`,
      });
    },
  },
} satisfies BetterAuthOptions);

export type Session = typeof auth.$Infer.Session;
