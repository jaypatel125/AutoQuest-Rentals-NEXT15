import { sendEmail } from "@/lib/email";
import { renderEmail } from "@/lib/email-templates";
import pool from "@/lib/db";
import { betterAuth, BetterAuthOptions } from "better-auth";
import { APIError } from "better-auth/api";
import { lastLoginMethod, openAPI } from "better-auth/plugins";
import { admin } from "better-auth/plugins";

const appUrl =
  process.env.NEXT_PUBLIC_APP_URL || "https://jay-capstone.vercel.app";

const googleConfigured = Boolean(
  process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
);

export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET,
  database: pool,
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // 5 minutes
    },
  },
  user: {
    changeEmail: {
      enabled: true,
      // Verified accounts must approve the change from their current inbox
      // before the new address is verified.
      sendChangeEmailConfirmation: async ({ user, newEmail, url }) => {
        await sendEmail({
          to: user.email,
          subject: "Approve your email change - AutoQuest",
          html: renderEmail({
            title: "Approve email change",
            greeting: `Hi ${user.name || "there"},`,
            paragraphs: [
              `We received a request to change your AutoQuest email to ${newEmail}. Approve it with the button below; we'll then ask you to verify the new address.`,
            ],
            button: { label: "Approve change", href: url },
            callout: {
              title: "Didn't request this?",
              body: "Ignore this email and change your password. Your email will stay the same.",
            },
          }),
        });
      },
    },
    deleteUser: {
      enabled: true,
      // Stop customers from deleting their account while a paid rental is
      // still ahead of them; they should cancel (and get refunded) first.
      beforeDelete: async (user) => {
        const { rows } = await pool.query(
          `SELECT 1 FROM bookings
           WHERE user_id = $1 AND status = 'Confirmed' AND end_date >= now()
           LIMIT 1`,
          [user.id]
        );
        if (rows.length) {
          throw new APIError("BAD_REQUEST", {
            message:
              "You have an upcoming booking. Cancel it before deleting your account.",
          });
        }
      },
    },
    additionalFields: {
      reward_points: {
        type: "number",
        defaultValue: 0,
        input: false,
      },
    },
  },
  plugins: [
    // The OpenAPI reference page is useful locally but should not be public.
    openAPI({ disableDefaultReference: process.env.NODE_ENV === "production" }),
    admin({ impersonationSessionDuration: 60 * 60 }),
    lastLoginMethod(),
  ],
  trustedOrigins: [appUrl],
  rateLimit: {
    enabled: process.env.NODE_ENV === "production",
    window: 60,
    max: 100,
    customRules: {
      // Session reads happen on every page view, often from the middleware
      // (one server IP for all visitors), so they are not rate limited.
      "/get-session": false,
      "/sign-in/email": { window: 60, max: 5 },
      "/sign-up/email": { window: 60, max: 3 },
      "/request-password-reset": { window: 300, max: 3 },
      "/forget-password": { window: 300, max: 3 },
      "/reset-password": { window: 300, max: 5 },
      "/send-verification-email": { window: 300, max: 3 },
      "/change-password": { window: 60, max: 5 },
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, token }) => {
      const callback = process.env.EMAIL_VERIFICATION_CALLBACK_URL || appUrl;
      const verificationUrl = `${appUrl}/api/auth/verify-email?token=${encodeURIComponent(
        token
      )}&callbackURL=${encodeURIComponent(callback)}`;

      await sendEmail({
        to: user.email,
        subject: "Verify your email address - AutoQuest",
        html: renderEmail({
          title: "Verify your email",
          greeting: `Hi ${user.name || "there"},`,
          paragraphs: [
            "Confirm this email address for your AutoQuest account to start booking.",
          ],
          button: { label: "Verify email address", href: verificationUrl },
          callout: {
            title: "Didn't sign up?",
            body: "If you did not create an AutoQuest account, you can safely ignore this email.",
          },
          footnote: "This link expires in 24 hours.",
        }),
      });
    },
  },
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    maxPasswordLength: 128,
    requireEmailVerification: true,
    revokeSessionsOnPasswordReset: true,

    sendResetPassword: async ({ user, url }) => {
      await sendEmail({
        to: user.email,
        subject: "Reset your AutoQuest password",
        html: renderEmail({
          title: "Reset your password",
          greeting: `Hi ${user.name || "there"},`,
          paragraphs: [
            "We received a request to reset the password for your AutoQuest account. Choose a new password using the button below.",
          ],
          button: { label: "Reset password", href: url },
          callout: {
            title: "Didn't request this?",
            body: "Ignore this email and your password will stay the same.",
          },
          footnote: "For your security, this link expires shortly.",
        }),
      });
    },
  },
  socialProviders: googleConfigured
    ? {
        google: {
          clientId: process.env.GOOGLE_CLIENT_ID as string,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
        },
      }
    : {},
} satisfies BetterAuthOptions);

export type Session = typeof auth.$Infer.Session;
