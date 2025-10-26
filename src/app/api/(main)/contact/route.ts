import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/email";

export async function POST(req: Request) {
  try {
    const { name, email, message } = await req.json();

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    // Send email to AutoQuest admin
    await sendEmail({
      to: "autoquest.rental@gmail.com",
      subject: `New Contact Message from ${name}`,
      text: `
    You have received a new message from the contact form.

    Name: ${name}
    Email: ${email}
    Message: ${message}
  `,
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
                  <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 600;">New Contact Message</h1>
                </td>
              </tr>

              <!-- Content -->
              <tr>
                <td style="padding: 30px 20px; color: #374151; font-size: 16px;">
                  <p style="margin: 0 0 15px 0;">You have received a new contact message from your website.</p>

                  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 20px 0; border-collapse: collapse;">
                    <tr>
                      <td style="padding: 10px; background-color: #f9fafb; border-radius: 6px;">
                        <p style="margin: 0 0 10px 0;"><strong style="color: #059669;">Name:</strong> ${name}</p>
                        <p style="margin: 0 0 10px 0;"><strong style="color: #059669;">Email:</strong> ${email}</p>
                        <p style="margin: 0;"><strong style="color: #059669;">Message:</strong></p>
                        <p style="margin: 10px 0 0 0; white-space: pre-wrap;">${message}</p>
                      </td>
                    </tr>
                  </table>

                  <p style="margin: 25px 0 0 0;">Please follow up with the sender at <a href="mailto:${email}" style="color: #059669; text-decoration: none;">${email}</a>.</p>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="background-color: #f1f5f9; padding: 20px; text-align: center; color: #6b7280; font-size: 12px;">
                  <p style="margin: 0 0 10px 0;">&copy; ${new Date().getFullYear()} AutoQuest. All rights reserved.</p>
                  <p style="margin: 0; font-size: 11px;">This is an automated message from your website contact form.</p>
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

    return NextResponse.json({
      success: true,
      message: "Email sent successfully",
    });
  } catch (err) {
    console.error("Contact form error:", err);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
}
