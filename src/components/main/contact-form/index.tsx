"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  CalendarX2,
  CheckCircle2,
  Clock,
  Gift,
  Mail,
  MapPin,
  Phone,
} from "lucide-react";
import { sendContactMessage } from "@/app/(main)/contact/actions";

const QUICK_HELP = [
  {
    icon: CalendarX2,
    title: "Cancel or change a booking",
    body: "Cancel from My Bookings for a refund up to 24 hours before pick-up.",
    href: "/bookings",
  },
  {
    icon: Gift,
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
    <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
      <div className="rounded-3xl border bg-card p-6 md:p-8">
        <h2 className="mb-1 text-xl font-bold">Send us a message</h2>
        <p className="mb-6 text-sm text-muted-foreground">
          We usually reply within one business day.
        </p>
        {isSuccess ? (
          <div className="flex flex-col items-center justify-center gap-3 py-10 text-center">
            <span className="inline-flex size-14 items-center justify-center rounded-full bg-accent text-accent-foreground">
              <CheckCircle2 className="size-7" />
            </span>
            <p className="font-semibold">
              Your message has been sent successfully!
            </p>
            <p className="text-sm text-muted-foreground">
              Thanks for reaching out. We&apos;ll be in touch soon.
            </p>
            <Button
              iconType="right-arrow"
              variant="outline"
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
              size="lg"
              disabled={isSubmitting}
              iconType="send"
              className="w-full"
              loading={isSubmitting}
            >
              {isSubmitting ? "Sending..." : "Send Message"}
            </Button>
          </form>
        )}
      </div>

      <div className="space-y-6">
        <div className="space-y-4 rounded-3xl border bg-card p-6">
          <h2 className="font-bold">Contact Information</h2>
          {[
            {
              icon: Mail,
              text: "autoquest.rental@gmail.com",
              href: "mailto:autoquest.rental@gmail.com",
            },
            {
              icon: Phone,
              text: "+1 (123) 456-7890",
              href: "tel:+11234567890",
            },
            { icon: MapPin, text: "123 Main Street, Toronto, ON" },
            { icon: Clock, text: "Mon to Fri: 9:00 AM to 6:00 PM" },
          ].map(({ icon: Icon, text, href }) => (
            <div key={text} className="flex items-center gap-3 text-sm">
              <span className="inline-flex size-9 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                <Icon className="size-4" />
              </span>
              {href ? (
                <a href={href} className="font-medium hover:text-primary">
                  {text}
                </a>
              ) : (
                <span className="font-medium">{text}</span>
              )}
            </div>
          ))}
        </div>

        <div className="space-y-3">
          <h2 className="px-1 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Quick help
          </h2>
          {QUICK_HELP.map(({ icon: Icon, title, body, href }) => (
            <Link
              key={title}
              href={href}
              className="flex gap-3 rounded-2xl border bg-card p-4 transition-colors hover:border-primary/40"
            >
              <Icon className="mt-0.5 size-5 shrink-0 text-primary" />
              <span>
                <span className="block font-semibold">{title}</span>
                <span className="text-sm text-muted-foreground">{body}</span>
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
