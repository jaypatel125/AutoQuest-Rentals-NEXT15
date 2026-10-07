"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { MailWarning } from "lucide-react";
import { signInSchema } from "@/lib/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { authClient } from "../../../../auth-client";
import { useToast } from "@/hooks/use-toast";
import { Divider, GoogleButton, PasswordInput, safeNext } from "./shared";

export default function SigninForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = safeNext(searchParams?.get("next"));
  const { toast } = useToast();
  const [pending, setPending] = useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null);
  const [resending, setResending] = useState(false);

  const form = useForm<z.infer<typeof signInSchema>>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof signInSchema>) => {
    const { email, password } = values;
    setUnverifiedEmail(null);
    await authClient.signIn.email(
      { email, password },
      {
        onRequest: () => {
          setPending(true);
        },
        onSuccess: (ctx) => {
          toast({
            title: "Signed in successfully",
          });
          const role = ctx.data?.user?.role;
          router.push(role === "admin" ? "/admin" : next);
          router.refresh();
        },
        onError: (error) => {
          if (error.error.code === "EMAIL_NOT_VERIFIED") {
            setUnverifiedEmail(email);
            return;
          }
          toast({
            title: "Something went wrong",
            description: error.error.message ?? "Something went wrong.",
            variant: "destructive",
          });
        },
      }
    );
    setPending(false);
  };

  const resendVerification = async () => {
    if (!unverifiedEmail) return;
    setResending(true);
    const { error } = await authClient.sendVerificationEmail({
      email: unverifiedEmail,
      callbackURL: "/",
    });
    setResending(false);
    toast(
      error
        ? {
            title: "Could not send email",
            description: error.message,
            variant: "destructive",
          }
        : {
            title: "Verification email sent",
            description: `Check ${unverifiedEmail} for the link.`,
          }
    );
  };

  async function handleSignInWithGoogle() {
    await authClient.signIn.social(
      {
        provider: "google",
        callbackURL: next,
      },
      {
        onError: (error) => {
          toast({
            title: "Something went wrong",
            description: error.error.message ?? "Something went wrong.",
            variant: "destructive",
          });
        },
      }
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Welcome Back</h1>
        <p className="text-muted-foreground">
          Sign in to manage your trips and rewards.
        </p>
      </div>

      {unverifiedEmail && (
        <div className="flex gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm">
          <MailWarning className="mt-0.5 size-5 shrink-0 text-amber-600" />
          <div className="space-y-2">
            <p>
              Please verify your email before signing in. We sent a link to{" "}
              <strong>{unverifiedEmail}</strong>.
            </p>
            <Button
              size="sm"
              variant="outline"
              onClick={resendVerification}
              loading={resending}
            >
              Resend verification email
            </Button>
          </div>
        </div>
      )}

      <GoogleButton onClick={handleSignInWithGoogle} />
      <Divider />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email address</FormLabel>
                <FormControl>
                  <Input
                    placeholder="you@example.com"
                    type="email"
                    autoComplete="email"
                    className="h-11"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-between">
                  <FormLabel>Password</FormLabel>
                  <Link
                    href="/forgot-password"
                    className="text-sm font-medium text-primary hover:underline"
                  >
                    Forgot Password?
                  </Link>
                </div>
                <FormControl>
                  <PasswordInput
                    placeholder="••••••••"
                    autoComplete="current-password"
                    className="h-11"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            size="lg"
            iconType="sign-in"
            className="h-11 w-full"
            disabled={pending}
            loading={pending}
          >
            {pending ? "Signing In... " : "Sign In"}
          </Button>
        </form>
      </Form>

      <p className="text-center text-sm text-muted-foreground">
        Don’t have an account?{" "}
        <Link
          href="/signup"
          className="font-semibold text-primary hover:underline"
        >
          Sign Up
        </Link>
      </p>
    </div>
  );
}
