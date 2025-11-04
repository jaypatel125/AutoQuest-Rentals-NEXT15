"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
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
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/reset-password`,
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
    <div>
      <h2 className="mb-6 text-2xl font-bold">Forgot Password</h2>
      {emailSent ? (
        <div className="space-y-4">
          <p>
            If an account exists for that email, a reset link has been sent.
          </p>
          <Link href="/signin">
            <Button>Go to Sign In</Button>
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="email">Email address</Label>
            <Input id="email" name="email" type="email" required />
          </div>
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Send Reset Link"
            )}
          </Button>
        </form>
      )}
    </div>
  );
}
