"use server";

export async function sendContactMessage(form: {
  name: string;
  email: string;
  message: string;
}) {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || ""}/api/contact`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      }
    );

    if (!res.ok) throw new Error("Failed to send message");

    return await res.json();
  } catch (err) {
    console.error("Error sending contact message:", err);
    return { success: false };
  }
}
