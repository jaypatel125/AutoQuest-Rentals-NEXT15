"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { authClient } from "../../../../auth-client";
import { ErrorContext } from "better-auth/react";

export default function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const { toast } = useToast();

  const [pending, setPending] = useState(false);
  const [passwordsMatch, setPasswordsMatch] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPending(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (password !== confirmPassword) {
      setPasswordsMatch(false);
      setPending(false);
      return;
    }
    setPasswordsMatch(true);

    if (!token) {
      setError("Invalid or missing reset token.");
      setPending(false);
      toast({
        title: "Error",
        description: "Invalid or missing reset token.",
      });
      return;
    }

    await authClient.resetPassword(
      {
        token,
        newPassword: password,
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
    <div>
      <h2 className="mb-6 text-2xl font-bold">Reset Password</h2>
      {success ? (
        <p className="text-sm text-green-600">
          Your password has been reset. Redirecting to sign in...
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="password">New Password</Label>
            <Input id="password" name="password" type="password" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
            />
          </div>
          {!passwordsMatch && (
            <p className="text-sm text-red-600">Passwords do not match.</p>
          )}
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button
            type="submit"
            className="w-full"
            disabled={pending}
            loading={pending}
          >
            {pending ? "Resetting Password..." : " Reset Password"}
          </Button>
        </form>
      )}
    </div>
  );
}
