"use client";

import Link from "next/link";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { authClient } from "../../../../auth-client";
import { useToast } from "@/hooks/use-toast";

export default function VerificationPage() {
  const searchParams = useSearchParams();
  const email = searchParams?.get("email");
  const { toast } = useToast();
  const [sending, setSending] = useState(false);

  const resend = async () => {
    if (!email) return;
    setSending(true);
    const { error } = await authClient.sendVerificationEmail({
      email,
      callbackURL: "/",
    });
    setSending(false);
    toast(
      error
        ? {
            title: "Could not send email",
            description: error.message,
            variant: "destructive",
          }
        : {
            title: "Email sent",
            description: "Check your inbox for a new link.",
          }
    );
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold">Verify your email</h1>
        <p className="text-muted-foreground">
          We’ve sent a verification link to{" "}
          {email ? (
            <span className="text-foreground">{email}</span>
          ) : (
            "this email"
          )}
          . Please check your inbox.
        </p>
      </div>
      <div className="space-y-3">
        <Button asChild className="w-full">
          <Link href="/signin">Go to Sign In</Link>
        </Button>
        {email && (
          <Button
            variant="ghost"
            className="w-full"
            onClick={resend}
            loading={sending}
          >
            Didn&apos;t get it? Resend email
          </Button>
        )}
      </div>
    </div>
  );
}
