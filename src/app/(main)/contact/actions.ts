/** Sends the contact form from the browser (so rate limiting sees the real client). */
export async function sendContactMessage(form: {
  name: string;
  email: string;
  message: string;
  website?: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const fieldError = data?.fields
        ? (Object.values(data.fields).flat()[0] as string | undefined)
        : undefined;
      return {
        success: false,
        error: fieldError || data?.error || "Failed to send message",
      };
    }
    return { success: true };
  } catch (err) {
    console.error("Error sending contact message:", err);
    return { success: false, error: "Network error. Please try again." };
  }
}
