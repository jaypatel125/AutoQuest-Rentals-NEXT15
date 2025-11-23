import { sendEmail } from "@/lib/email";
import { betterAuth, BetterAuthOptions } from "better-auth";
import { lastLoginMethod, openAPI } from "better-auth/plugins";
import { admin } from "better-auth/plugins";
import { Pool } from "pg";

export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET,
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
    additionalFields: {
      reward_points: {
        type: "number",
        defaultValue: 0,
      },
    },
  },
  plugins: [
    openAPI(),
    admin({ impersonationSessionDuration: 60 * 60 * 24 * 7 }),
    lastLoginMethod(),
  ],
  trustedOrigins: [
    process.env.NEXT_PUBLIC_APP_URL || "https://jay-capstone.vercel.app",
  ],
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, token }) => {
      const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/verify-email?token=${token}&callbackURL=${process.env.EMAIL_VERIFICATION_CALLBACK_URL}`;

      await sendEmail({
        to: user.email,
        subject: "Verify Your Email Address - AutoQuest",
        html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: Arial, Helvetica, sans-serif; background-color: #f8fafc; line-height: 1.6;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f8fafc;">
        <tr>
            <td align="center" style="padding: 40px 20px;">
                <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                    <tr>
                        <td style="background: linear-gradient(135deg, #4f46e5, #4338ca); padding: 30px 20px; text-align: center;">
                            <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 600;">Verify Your Email Address</h1>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 30px 20px; color: #374151; font-size: 16px;">
                            <p style="margin: 0 0 20px 0;">Hello ${
                              user.name || "there"
                            },</p>
                            <p style="margin: 0 0 20px 0;">Thank you for signing up with <strong style="color: #4f46e5;">AutoQuest</strong>! To complete your registration, please verify your email address by clicking the button below:</p>
                            
                            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 30px 0;">
                                <tr>
                                    <td align="center">
                                        <a href="${verificationUrl}" 
                                           style="display: inline-block; padding: 14px 32px; background-color: #4f46e5; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px; border: 1px solid #4f46e5;">
                                            Verify Email Address
                                        </a>
                                    </td>
                                </tr>
                            </table>
                            
                            <p style="margin: 0 0 20px 0; color: #6b7280; font-size: 14px;">
                                This verification link will expire in 24 hours for security reasons.
                            </p>
                            
                            <p style="margin: 0 0 20px 0;">If the button above doesn't work, copy and paste this link into your browser:</p>
                            
                            <table width="100%" cellpadding="0" cellspacing="0" border="0">
                                <tr>
                                    <td style="background-color: #f3f4f6; padding: 12px 16px; border-radius: 4px; word-break: break-all;">
                                        <a href="${verificationUrl}" style="color: #4f46e5; text-decoration: none; font-size: 14px;">${verificationUrl}</a>
                                    </td>
                                </tr>
                            </table>
                            
                            <!-- Security Notice -->
                            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 30px 0; background-color: #eff6ff; border: 1px solid #bfdbfe; border-radius: 6px;">
                                <tr>
                                    <td style="padding: 15px;">
                                        <p style="margin: 0; color: #3730a3; font-size: 14px; font-weight: 600;">📧 Email Verification</p>
                                        <p style="margin: 5px 0 0 0; color: #3730a3; font-size: 13px;">
                                            If you did not create an account with AutoQuest, please ignore this email.
                                        </p>
                                    </td>
                                </tr>
                            </table>
                            
                            <p style="margin: 0;">Best regards,<br><strong>The AutoQuest Team</strong></p>
                        </td>
                    </tr>
                    <tr>
                        <td style="background-color: #f1f5f9; padding: 20px; text-align: center; color: #6b7280; font-size: 12px;">
                            <p style="margin: 0 0 10px 0;">&copy; ${new Date().getFullYear()} AutoQuest. All rights reserved.</p>
                            <p style="margin: 0; font-size: 11px;">This is an automated message, please do not reply to this email.</p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
  `,
      });
    },
  },
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 4,
    requireEmailVerification: true,

    sendResetPassword: async ({ user, url }) => {
      await sendEmail({
        to: user.email,
        subject: "Reset your AutoQuest password",
        html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: Arial, Helvetica, sans-serif; background-color: #f8fafc; line-height: 1.6;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f8fafc;">
        <tr>
            <td align="center" style="padding: 40px 20px;">
                <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #059669, #047857); padding: 30px 20px; text-align: center;">
                            <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 600;">Reset Your Password</h1>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style="padding: 30px 20px; color: #374151; font-size: 16px;">
                            <p style="margin: 0 0 20px 0;">Hello ${
                              user.name || "there"
                            },</p>
                            <p style="margin: 0 0 20px 0;">We received a request to reset your password for your <strong style="color: #059669;">AutoQuest</strong> account. Please click the button below to create a new password:</p>
                            
                            <!-- Reset Button -->
                            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 30px 0;">
                                <tr>
                                    <td align="center">
                                        <a href="${url}" 
                                           style="display: inline-block; padding: 14px 32px; background-color: #059669; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px; border: 1px solid #059669;">
                                            Reset Password
                                        </a>
                                    </td>
                                </tr>
                            </table>
                            
                            <p style="margin: 0 0 20px 0; color: #6b7280; font-size: 14px;">
                                For security reasons, this link will expire shortly.
                            </p>
                            
                            <p style="margin: 0 0 20px 0;">If the button above doesn't work, copy and paste this link into your browser:</p>
                            
                            <!-- Backup URL -->
                            <table width="100%" cellpadding="0" cellspacing="0" border="0">
                                <tr>
                                    <td style="background-color: #f3f4f6; padding: 12px 16px; border-radius: 4px; word-break: break-all;">
                                        <a href="${url}" style="color: #059669; text-decoration: none; font-size: 14px;">${url}</a>
                                    </td>
                                </tr>
                            </table>
                            
                            <!-- Security Notice -->
                            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 30px 0; background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 6px;">
                                <tr>
                                    <td style="padding: 15px;">
                                        <p style="margin: 0; color: #065f46; font-size: 14px; font-weight: 600;">🔒 Security Notice</p>
                                        <p style="margin: 5px 0 0 0; color: #065f46; font-size: 13px;">
                                            If you didn't request this password reset, please ignore this email. Your account remains secure.
                                        </p>
                                    </td>
                                </tr>
                            </table>
                            
                            <p style="margin: 0;">Best regards,<br><strong>The AutoQuest Team</strong></p>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #f1f5f9; padding: 20px; text-align: center; color: #6b7280; font-size: 12px;">
                            <p style="margin: 0 0 10px 0;">&copy; ${new Date().getFullYear()} AutoQuest. All rights reserved.</p>
                            <p style="margin: 0; font-size: 11px;">This is an automated message, please do not reply to this email.</p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
  `,
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
