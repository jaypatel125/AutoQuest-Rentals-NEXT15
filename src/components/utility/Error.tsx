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
        <TriangleAlert
          className="size-6 text-muted-foreground"
          strokeWidth={1.5}
        />
        <div className="space-y-1">
          <h2 className="font-medium">Something went wrong</h2>
          <p className="text-sm text-muted-foreground">
            {error ? error : "Something went wrong. Please try again."}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => (onRetry ? onRetry() : router.refresh())}
        >
          Retry
        </Button>
      </div>
    </div>
  );
};

export default Error;
