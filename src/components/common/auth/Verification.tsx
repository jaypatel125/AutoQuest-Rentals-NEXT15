"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function VerificationPage() {
  return (
    <div className="text-center space-y-4">
      <h1 className="text-2xl font-semibold">Verify your email</h1>
      <p className="text-muted-foreground">
        We’ve sent a verification link to this email. Please check your inbox.
      </p>
      <Link href="/signin">
        <Button className="w-full" iconType="right-arrow">
          Go to Sign In
        </Button>
      </Link>
    </div>
  );
}
