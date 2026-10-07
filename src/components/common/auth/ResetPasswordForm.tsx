"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { authClient } from "../../../../auth-client";
import { ErrorContext } from "better-auth/react";
import { PASSWORD_MIN } from "@/lib/zod";
import { PasswordInput, StrengthMeter } from "./shared";

export default function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const { toast } = useToast();

  const [pending, setPending] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordsMatch, setPasswordsMatch] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPending(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const newPassword = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (newPassword !== confirmPassword) {
      setPasswordsMatch(false);
      setPending(false);
      return;
    }
    setPasswordsMatch(true);

    if (newPassword.length < PASSWORD_MIN) {
      setError(`Password must be at least ${PASSWORD_MIN} characters.`);
      setPending(false);
      return;
    }

    if (!token) {
      setError("Invalid or missing reset token.");
      setPending(false);
      toast({
        title: "Error",
        description: "Invalid or missing reset token.",
        variant: "destructive",
      });
      return;
    }

    await authClient.resetPassword(
      {
        token,
        newPassword,
      },
      {
        onRequest: () => {
          setPending(true);
        },
        onSuccess: async () => {
          toast({
            title: "Password Reset Successful",
            description: "Your password has been reset successfully.",
          });
          setSuccess(true);
          router.push("/signin");
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
        <h1 className="text-3xl font-bold">Reset Password</h1>
        <p className="text-muted-foreground">
          Choose a new password with at least {PASSWORD_MIN} characters.
        </p>
      </div>
      {success ? (
        <p className="rounded-2xl bg-accent p-4 text-sm text-accent-foreground">
          Your password has been reset. Redirecting to sign in...
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="password">New Password</Label>
            <PasswordInput
              id="password"
              name="password"
              autoComplete="new-password"
              className="h-11"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <StrengthMeter password={password} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <PasswordInput
              id="confirmPassword"
              name="confirmPassword"
              autoComplete="new-password"
              className="h-11"
              required
            />
          </div>
          {!passwordsMatch && (
            <p className="text-sm text-destructive">Passwords do not match.</p>
          )}
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button
            iconType="submit"
            type="submit"
            size="lg"
            className="h-11 w-full"
            disabled={pending}
            loading={pending}
          >
            {pending ? "Resetting Password..." : "Reset Password"}
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            <Link
              href="/signin"
              className="font-semibold text-primary hover:underline"
            >
              Back to sign in
            </Link>
          </p>
        </form>
      )}
    </div>
  );
}
