import React from "react";
import { cn } from "@/lib/utils";

interface LoaderProps {
  title?: string;
  className?: string;
}

/** Centered spinner for whole-section loading states. */
const Loader: React.FC<LoaderProps> = ({ title, className }) => {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "flex min-h-[50vh] w-full items-center justify-center",
        className
      )}
    >
      <div className="flex flex-col items-center gap-4 text-center">
        <span
          data-testid="loader-spinner"
          className="inline-block size-9 animate-spin rounded-full border-[3px] border-primary/15 border-t-primary"
        />
        {title ? (
          <p className="text-sm font-medium text-muted-foreground">
            {title}...
          </p>
        ) : (
          <span className="sr-only">Loading</span>
        )}
      </div>
    </div>
  );
};

export default Loader;
