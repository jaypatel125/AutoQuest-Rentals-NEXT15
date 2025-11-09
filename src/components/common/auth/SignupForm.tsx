"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { authClient } from "../../../../auth-client";
import { signUpSchema } from "@/lib/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { IoEyeOutline, IoEyeOffOutline } from "react-icons/io5";

import Image from "next/image";

import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";

export default function SignupForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
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

          router.push("/verification");
        },
        onError: (error) => {
          toast({
            title: "Something went wrong",
            description: error.error.message ?? "Something went wrong.",
          });
        },
      }
    );
    setLoading(false);
  };

  async function handleSiginInWithGoogle() {
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
          });
        },
      }
    );
  }

  return (
    <div>
      <h2 className="mb-6 text-2xl font-bold">Get Started Now</h2>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter your name" {...field} />
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
                  <div className="relative">
                    <Input
                      placeholder="Enter your password"
                      type={showPassword ? "text" : "password"}
                      {...field}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-3 flex items-center text-gray-500"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <IoEyeOffOutline size={20} />
                      ) : (
                        <IoEyeOutline size={20} />
                      )}
                    </button>
                  </div>
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
                  <div className="relative">
                    <Input
                      placeholder="Confirm your password"
                      type={showPassword ? "text" : "password"}
                      {...field}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className="w-full"
            disabled={loading}
            iconType="sign-in"
            loading={loading}
          >
            {loading ? "Signing Up..." : "Sign Up"}
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
              onClick={handleSiginInWithGoogle}
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
        Already have an account?{" "}
        <a href="/signin" className="font-medium text-blue-600 hover:underline">
          Sign In
        </a>
      </p>
    </div>
  );
}
