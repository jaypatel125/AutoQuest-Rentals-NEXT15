"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { signInSchema } from "@/lib/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import Image from "next/image";
import { authClient } from "../../../auth-client";
import { useToast } from "@/hooks/use-toast";

export default function SigninForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof signInSchema>>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof signInSchema>) => {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/sign-in/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
        credentials: "include",
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Sign-in failed");

      router.push("/");
      router.refresh();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("Sign-in error:", error);
      toast({
        title: "Something went wrong",
        description: error.message ?? "Something went wrong.",
      });
    }
    setLoading(false);
  };

  return (
    <div>
      <h2 className="mb-6 text-2xl font-bold">Welcome Back</h2>

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
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input placeholder="••••••••" type="password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="text-right">
            <a
              href="/forgot-password"
              className="text-sm text-blue-600 hover:underline"
            >
              Forgot Password?
            </a>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sign In"}
          </Button>

          <div className="flex items-center">
            <div className="h-px flex-1 bg-gray-300" />
            <span className="px-2 text-sm text-gray-500">Or</span>
            <div className="h-px flex-1 bg-gray-300" />
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              className="w-full justify-center gap-2"
              type="button"
              onClick={async () => {
                try {
                  const res = await authClient.signIn.social({
                    provider: "google",
                    callbackURL: "/",
                  });

                  if (res.error) {
                    console.error("Google sign-in failed:", res.error);
                    return;
                  }

                  router.push("/");
                  router.refresh();
                } catch (err) {
                  console.error("Google login error:", err);
                }
              }}
            >
              <Image
                src="https://www.svgrepo.com/show/475656/google-color.svg"
                alt="Google"
                width={18}
                height={18}
              />
              Sign up with Google
            </Button>
          </div>
        </form>
      </Form>

      <p className="mt-6 text-center text-sm text-gray-500">
        Don’t have an account?{" "}
        <a href="/signup" className="font-medium text-blue-600 hover:underline">
          Sign Up
        </a>
      </p>
    </div>
  );
}
