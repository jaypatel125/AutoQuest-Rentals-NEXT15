"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { authClient } from "../../../../auth-client";
import { signUpSchema } from "@/lib/zod";
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
import { useToast } from "@/hooks/use-toast";
import { Divider, GoogleButton, PasswordInput, StrengthMeter } from "./shared";

export default function SignupForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof signUpSchema>>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });
  const password = form.watch("password");

  const onSubmit = async (values: z.infer<typeof signUpSchema>) => {
    const { name, email, password } = values;

    await authClient.signUp.email(
      { name, email, password },
      {
        onRequest: () => {
          setLoading(true);
        },
        onSuccess: () => {
          toast({
            title: "Account created successfully",
            description: "Please verify your email to continue.",
          });

          router.push(`/verification?email=${encodeURIComponent(email)}`);
        },
        onError: (error) => {
          toast({
            title: "Something went wrong",
            description: error.error.message ?? "Something went wrong.",
            variant: "destructive",
          });
        },
      }
    );
    setLoading(false);
  };

  async function handleSignInWithGoogle() {
    await authClient.signIn.social(
      {
        provider: "google",
        callbackURL: "/",
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
        <h1 className="text-3xl font-bold">Get Started Now</h1>
        <p className="text-muted-foreground">
          Create a free account and earn points on your first rental.
        </p>
      </div>

      <GoogleButton
        onClick={handleSignInWithGoogle}
        label="Sign up with Google"
      />
      <Divider />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter your name"
                    autoComplete="name"
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

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <PasswordInput
                      placeholder="Enter your password"
                      autoComplete="new-password"
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
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm Password</FormLabel>
                  <FormControl>
                    <PasswordInput
                      placeholder="Confirm your password"
                      autoComplete="new-password"
                      className="h-11"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <StrengthMeter password={password} />

          <Button
            type="submit"
            size="lg"
            className="h-11 w-full"
            disabled={loading}
            loading={loading}
            name="Sign Up"
          >
            {loading ? "Signing Up..." : "Sign Up"}
          </Button>
          <p className="text-center text-xs text-muted-foreground">
            By signing up you agree to our{" "}
            <Link href="/terms" className="underline hover:text-foreground">
              rental terms
            </Link>
            .
          </p>
        </form>
      </Form>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link
          href="/signin"
          className="font-semibold text-primary hover:underline"
        >
          Sign In
        </Link>
      </p>
    </div>
  );
}
