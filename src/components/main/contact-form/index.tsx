"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { sendContactMessage } from "@/app/(main)/contact/actions";

const QUICK_HELP = [
  {
    title: "Cancel or change a booking",
    body: "Cancel from My Bookings for a refund up to 24 hours before pick-up.",
    href: "/bookings",
  },
  {
    title: "Rewards questions",
    body: "See your balance, status, and points history.",
    href: "/rewards",
  },
];

export default function ContactForm() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    message: "",
    website: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setIsSuccess(false);
    setError(null);

    try {
      const res = await sendContactMessage(form);
      if (res?.success) {
        setIsSuccess(true);
        setForm({ name: "", email: "", message: "", website: "" });
      } else {
        setError(res?.error || "Failed to send message");
      }
    } catch (err) {
      console.error("Failed to send message:", err);
      setError("Failed to send message");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grid gap-16 lg:grid-cols-[1.4fr_1fr]">
      <div>
        <h2 className="font-medium">Send us a message</h2>
        <p className="mt-1 mb-8 text-sm text-muted-foreground">
          We usually reply within one business day.
        </p>
        {isSuccess ? (
          <div className="space-y-3 border-y py-10">
            <p className="font-medium">
              Your message has been sent successfully!
            </p>
            <p className="text-sm text-muted-foreground">
              Thanks for reaching out. We&apos;ll be in touch soon.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={() => setIsSuccess(false)}
            >
              Send another message
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="contact-name">Name</Label>
                <Input
                  id="contact-name"
                  name="name"
                  placeholder="Your Name"
                  autoComplete="name"
                  value={form.name}
                  onChange={handleChange}
                  maxLength={100}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact-email">Email</Label>
                <Input
                  id="contact-email"
                  type="email"
                  name="email"
                  placeholder="Your Email"
                  autoComplete="email"
                  value={form.email}
                  onChange={handleChange}
                  maxLength={200}
                  required
                />
              </div>
            </div>
            {/* Honeypot: hidden from people, tempting for bots. */}
            <div
              aria-hidden
              className="absolute -left-[9999px] h-0 w-0 overflow-hidden"
            >
              <label htmlFor="contact-website">Website</label>
              <input
                id="contact-website"
                name="website"
                tabIndex={-1}
                autoComplete="off"
                value={form.website}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact-message">Message</Label>
              <Textarea
                id="contact-message"
                name="message"
                placeholder="Your Message"
                value={form.message}
                onChange={handleChange}
                minLength={10}
                maxLength={5000}
                className="min-h-36"
                required
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto"
              loading={isSubmitting}
            >
              {isSubmitting ? "Sending..." : "Send Message"}
            </Button>
          </form>
        )}
      </div>

      <div className="space-y-12">
        <div className="space-y-4">
          <h2 className="font-medium">Contact Information</h2>
          <ul className="space-y-1.5 text-sm text-muted-foreground">
            <li>
              <a
                href="mailto:autoquest.rental@gmail.com"
                className="hover:text-foreground"
              >
                autoquest.rental@gmail.com
              </a>
            </li>
            <li>
              <a href="tel:+11234567890" className="hover:text-foreground">
                +1 (123) 456-7890
              </a>
            </li>
            <li>123 Main Street, Toronto, ON</li>
            <li>Mon to Fri: 9:00 AM to 6:00 PM</li>
          </ul>
        </div>

        <div className="space-y-4">
          <h2 className="font-medium">Quick help</h2>
          <div className="divide-y border-y">
            {QUICK_HELP.map(({ title, body, href }) => (
              <Link key={title} href={href} className="group block py-4">
                <span className="block text-sm group-hover:underline group-hover:underline-offset-4">
                  {title}
                </span>
                <span className="text-sm text-muted-foreground">{body}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
