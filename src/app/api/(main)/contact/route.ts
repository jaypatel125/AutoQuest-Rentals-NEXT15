import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/email";
import { renderEmail } from "@/lib/email-templates";
import { contactSchema } from "@/lib/zod";
import { clientIp, rateLimit } from "@/lib/rate-limit";

const SUPPORT_INBOX = process.env.SUPPORT_EMAIL || "autoquest.rental@gmail.com";

export async function POST(req: Request) {
  try {
    const limit = rateLimit(`contact:${clientIp(req)}`, 5, 10 * 60 * 1000);
    if (!limit.ok) {
      return NextResponse.json(
        { error: "Too many messages. Please try again later." },
        { status: 429, headers: { "Retry-After": String(limit.retryAfter) } }
      );
    }

    const body = await req.json().catch(() => null);
    const parsed = contactSchema.safeParse(body ?? {});
    if (!parsed.success) {
      const fields = parsed.error.flatten().fieldErrors;
      // Bots that fill the hidden field get a quiet success.
      if (fields.website) return NextResponse.json({ success: true });
      return NextResponse.json(
        { error: "All fields are required", fields },
        { status: 400 }
      );
    }
    const { name, email, message } = parsed.data;

    await sendEmail({
      to: SUPPORT_INBOX,
      replyTo: email,
      subject: `New contact message from ${name.slice(0, 80)}`,
      text: `New message from the contact form.\n\nName: ${name}\nEmail: ${email}\n\n${message}`,
      html: renderEmail({
        title: "New contact message",
        paragraphs: ["Someone reached out through the website contact form."],
        details: [
          ["Name", name],
          ["Email", email],
        ],
        callout: { title: "Message", body: message },
        footnote: "Reply to this email to answer the sender directly.",
      }),
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
