import { escapeHtml } from "./html";

interface EmailOptions {
  title: string;
  /** Header color. Defaults to the brand emerald. */
  accent?: string;
  greeting?: string;
  paragraphs?: string[];
  details?: [label: string, value: string | number][];
  callout?: { title: string; body: string };
  button?: { label: string; href: string };
  footnote?: string;
}

const BRAND = "#059669";

function safeHref(href: string) {
  return /^https?:\/\//i.test(href) ? escapeHtml(href) : "#";
}

/**
 * Renders a transactional email. Every dynamic value is HTML-escaped here,
 * so callers can pass user-controlled text (names, messages) directly.
 */
export function renderEmail({
  title,
  accent = BRAND,
  greeting,
  paragraphs = [],
  details,
  callout,
  button,
  footnote,
}: EmailOptions) {
  const p = (text: string) =>
    `<p style="margin:0 0 16px 0;white-space:pre-wrap;">${escapeHtml(text)}</p>`;

  const detailRows = details?.length
    ? `<table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:8px 0 24px 0;border:1px solid #e5e7eb;border-radius:10px;border-collapse:separate;">
        ${details
          .map(
            ([label, value], i) => `<tr>
            <td style="padding:10px 14px;color:#6b7280;font-size:14px;${i ? "border-top:1px solid #f1f5f9;" : ""}">${escapeHtml(label)}</td>
            <td style="padding:10px 14px;color:#111827;font-size:14px;font-weight:600;text-align:right;${i ? "border-top:1px solid #f1f5f9;" : ""}">${escapeHtml(value)}</td>
          </tr>`
          )
          .join("")}
      </table>`
    : "";

  // Links that aren't plain http(s) are dropped rather than rendered.
  const cta =
    button && /^https?:\/\//i.test(button.href)
      ? `<table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:8px 0 24px 0;"><tr><td align="center">
        <a href="${safeHref(button.href)}" style="display:inline-block;padding:13px 28px;background:${accent};color:#ffffff;text-decoration:none;border-radius:999px;font-weight:600;font-size:15px;">${escapeHtml(button.label)}</a>
      </td></tr></table>
      <p style="margin:0 0 16px 0;color:#6b7280;font-size:13px;">If the button doesn't work, copy this link into your browser:<br><a href="${safeHref(button.href)}" style="color:${accent};word-break:break-all;">${escapeHtml(button.href)}</a></p>`
      : "";

  const box = callout
    ? `<div style="margin:8px 0 24px 0;padding:14px 16px;background:#ecfdf5;border-left:4px solid ${accent};border-radius:8px;">
        <p style="margin:0;font-weight:600;color:#065f46;font-size:14px;">${escapeHtml(callout.title)}</p>
        <p style="margin:6px 0 0 0;color:#065f46;font-size:14px;white-space:pre-wrap;">${escapeHtml(callout.body)}</p>
      </div>`
    : "";

  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>${escapeHtml(title)}</title></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:Arial,Helvetica,sans-serif;line-height:1.6;color:#1f2937;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f1f5f9;"><tr><td align="center" style="padding:32px 16px;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;background:#ffffff;border-radius:16px;overflow:hidden;">
      <tr><td style="background:${accent};padding:28px 24px;">
        <p style="margin:0 0 6px 0;color:#d1fae5;font-size:13px;letter-spacing:.08em;text-transform:uppercase;font-weight:700;">AutoQuest</p>
        <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:700;">${escapeHtml(title)}</h1>
      </td></tr>
      <tr><td style="padding:28px 24px;font-size:15px;">
        ${greeting ? p(greeting) : ""}
        ${paragraphs.map(p).join("")}
        ${detailRows}
        ${box}
        ${cta}
        <p style="margin:0;">Drive safe,<br><strong>The AutoQuest Team</strong></p>
      </td></tr>
      <tr><td style="background:#f8fafc;padding:18px 24px;text-align:center;color:#94a3b8;font-size:12px;">
        ${footnote ? `<p style="margin:0 0 6px 0;">${escapeHtml(footnote)}</p>` : ""}
        <p style="margin:0;">&copy; ${new Date().getFullYear()} AutoQuest. This is an automated message.</p>
      </td></tr>
    </table>
  </td></tr></table>
</body></html>`;
}
