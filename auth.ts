import { sendEmail } from "@/lib/email";
import { betterAuth, BetterAuthOptions } from "better-auth";
import { openAPI } from "better-auth/plugins";
import { admin } from "better-auth/plugins";
import { Pool } from "pg";

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
  trustedOrigins: [
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    "https://autoquest.vercel.app",
  ],
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, token }) => {
      const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/verify-email?token=${token}&callbackURL=${process.env.EMAIL_VERIFICATION_CALLBACK_URL}`;

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
  emailAndPassword: {
    enabled: true,

    sendResetPassword: async ({ user, url }) => {
      await sendEmail({
        to: user.email,
        subject: "Reset your AutoQuest password",
        text: `Hello ${user.name || ""},

We received a request to reset your password.  
Please click the link below to create a new password:

${url}

For security, this link will expire shortly.  
If you didn’t request this reset, you can safely ignore this email.

Best regards,  
The AutoQuest Team`,
      });
    },

    onPasswordReset: async ({ user }) => {
      console.log(`Password for ${user.email} was reset`);
    },
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
} satisfies BetterAuthOptions);

export type Session = typeof auth.$Infer.Session;
