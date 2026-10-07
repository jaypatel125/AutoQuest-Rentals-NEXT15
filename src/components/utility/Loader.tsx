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
          className="relative inline-flex size-12 items-center justify-center"
        >
          <span className="absolute inset-0 rounded-full border-4 border-primary/15" />
          <span className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-t-primary" />
        </span>
        {title ? (
          <p className="font-medium text-muted-foreground">{title}...</p>
        ) : (
          <span className="sr-only">Loading</span>
        )}
      </div>
    </div>
  );
};

export default Loader;
