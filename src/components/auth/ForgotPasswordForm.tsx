"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";

export default function ForgotPasswordForm() {
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;

    try {
      const res = await fetch("/api/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        setEmailSent(true);
        toast({
          title: "Success",
          description:
            "If an account exists, a reset link has been sent to the email provided.",
        });
      } else {
        const data = await res.json();
        console.error("Request reset error:", data.error);
        toast({
          title: "Error",
          description: data.error || "Failed to send reset link.",
        });
      }
    } catch (error: any) {
      console.error("Request reset error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to send reset link.",
      });
    } finally {
      setLoading(false);
    }
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
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
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
