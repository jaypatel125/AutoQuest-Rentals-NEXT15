"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { createContext, useContext } from "react";
import { cn } from "@/lib/utils";
import MaxWidthWrapper from "../MaxWidthWrapper";

const ContainedContext = createContext(true);

/** Pages rendered inside a shell that already sets the width (admin). */
export function UncontainedPages({ children }: { children: React.ReactNode }) {
  return (
    <ContainedContext.Provider value={false}>
      {children}
    </ContainedContext.Provider>
  );
}

interface PageLayoutProps {
  title: string;
  description?: React.ReactNode;
  eyebrow?: React.ReactNode;
  actions?: React.ReactNode;
  goBack?: boolean;
  className?: string;
  children: React.ReactNode;
}

const PageLayout: React.FC<PageLayoutProps> = ({
  title,
  description,
  eyebrow,
  actions,
  goBack = true,
  className,
  children,
}) => {
  const router = useRouter();
  const contained = useContext(ContainedContext);
  const content = (
    <div
      className={cn(
        "animate-fade-up space-y-8 py-8 md:py-10",
        !contained && "py-2 md:py-2",
        className
      )}
    >
      <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div className="space-y-3">
          {goBack && (
            <button
              type="button"
              onClick={() => router.back()}
              className="no-print -ml-1 inline-flex cursor-pointer items-center gap-1.5 rounded-full px-2 py-1 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              <ArrowLeft className="size-4" /> Back
            </button>
          )}
          {eyebrow && (
            <div className="text-sm font-semibold uppercase tracking-wider text-primary">
              {eyebrow}
            </div>
          )}
          <h1 className="text-3xl font-bold md:text-4xl">{title}</h1>
          {description && (
            <p className="max-w-2xl text-base text-muted-foreground">
              {description}
            </p>
          )}
        </div>
        {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
      </div>
      <div>{children}</div>
    </div>
  );
  return contained ? <MaxWidthWrapper>{content}</MaxWidthWrapper> : content;
};

export default PageLayout;
