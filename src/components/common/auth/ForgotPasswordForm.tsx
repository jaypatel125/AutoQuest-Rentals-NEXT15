"use client";

import { useState } from "react";
import Link from "next/link";
import { MailCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { authClient } from "../../../../auth-client";
import { ErrorContext } from "better-auth/react";

export default function ForgotPasswordForm() {
  const [pending, setPending] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    await authClient.requestPasswordReset(
      {
        email: email,
        redirectTo: `${window.location.origin}/reset-password`,
      },
      {
        onRequest: () => {
          setPending(true);
        },
        onSuccess: async () => {
          toast({
            title: "Reset Email Sent",
            description: "Please check your email for the reset link.",
          });
          setEmailSent(true);
        },
        onError: (ctx: ErrorContext) => {
          toast({
            title: "Something went wrong",
            description: ctx.error.message ?? "Something went wrong.",
            variant: "destructive",
          });
        },
      }
    );
    setPending(false);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Forgot Password</h1>
        <p className="text-muted-foreground">
          Enter your email and we&apos;ll send you a link to choose a new
          password.
        </p>
      </div>
      {emailSent ? (
        <div className="space-y-5 rounded-2xl border bg-card p-6 text-center">
          <span className="mx-auto inline-flex size-12 items-center justify-center rounded-full bg-accent text-accent-foreground">
            <MailCheck className="size-6" />
          </span>
          <p>
            If an account exists for that email, a reset link has been sent.
          </p>
          <Button asChild className="w-full">
            <Link href="/signin">Go to Sign In</Link>
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="email">Email address</Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              className="h-11"
              required
            />
          </div>
          <Button
            iconType="send"
            type="submit"
            size="lg"
            className="h-11 w-full"
            disabled={pending}
            loading={pending}
          >
            {pending ? "Sending reset link..." : "Send Reset Link"}
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            Remembered it?{" "}
            <Link
              href="/signin"
              className="font-semibold text-primary hover:underline"
            >
              Sign in
            </Link>
          </p>
        </form>
      )}
    </div>
  );
}
