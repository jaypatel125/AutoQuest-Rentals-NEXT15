import nodemailer, { type Transporter } from "nodemailer";

let transporter: Transporter | null = null;

function getTransporter() {
  if (!transporter) {
    const port = Number(process.env.SMTP_PORT ?? 587);
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port,
      secure: port === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
  return transporter;
}

export async function sendEmail({
  to,
  subject,
  text,
  html,
  replyTo,
}: {
  to: string;
  subject: string;
  text?: string;
  html?: string;
  replyTo?: string;
}) {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER) {
    throw new Error("Email is not configured (SMTP_HOST / SMTP_USER missing)");
  }

  await getTransporter().sendMail({
    from: process.env.SMTP_FROM ?? `"AutoQuest" <${process.env.SMTP_USER}>`,
    to,
    subject: subject.replace(/[\r\n]+/g, " "),
    text,
    html,
    replyTo,
  });
}
