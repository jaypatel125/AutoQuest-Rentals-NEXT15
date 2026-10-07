"use client";

import React from "react";
import { TriangleAlert } from "lucide-react";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";

interface ErrorProps {
  error?: string;
  onRetry?: () => void;
}

const Error: React.FC<ErrorProps> = ({ error, onRetry }) => {
  const router = useRouter();
  return (
    <div className="flex min-h-80 items-center justify-center py-10">
      <div className="flex max-w-sm flex-col items-center gap-4 text-center">
        <span className="inline-flex size-14 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
          <TriangleAlert className="size-7" />
        </span>
        <div className="space-y-1">
          <h2 className="text-lg font-semibold">Something went wrong</h2>
          <p className="text-sm text-muted-foreground">
            {error ? error : "Something went wrong. Please try again."}
          </p>
        </div>
        <Button
          iconType="reload"
          variant="outline"
          onClick={() => (onRetry ? onRetry() : router.refresh())}
        >
          Retry
        </Button>
      </div>
    </div>
  );
};

export default Error;
