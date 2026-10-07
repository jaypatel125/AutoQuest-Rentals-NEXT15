"use client";

import { useEffect } from "react";
import Link from "next/link";
import { RefreshCw, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-6 px-4 text-center">
      <span className="inline-flex size-16 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
        <TriangleAlert className="size-8" />
      </span>
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Something went wrong</h1>
        <p className="mx-auto max-w-md text-muted-foreground">
          An unexpected error occurred. Please try again; if it keeps happening,
          contact support.
        </p>
        {error.digest && (
          <p className="font-mono text-xs text-muted-foreground">
            Reference: {error.digest}
          </p>
        )}
      </div>
      <div className="flex gap-3">
        <Button onClick={reset}>
          <RefreshCw /> Try again
        </Button>
        <Button asChild variant="outline">
          <Link href="/">Go home</Link>
        </Button>
      </div>
    </div>
  );
}
