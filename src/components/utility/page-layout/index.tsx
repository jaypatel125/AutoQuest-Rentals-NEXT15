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
        "animate-fade-up space-y-8 py-10 md:py-12",
        !contained && "py-2 md:py-2",
        className
      )}
    >
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div className="space-y-2">
          {goBack && (
            <button
              type="button"
              onClick={() => router.back()}
              className="no-print mb-3 -ml-1 inline-flex cursor-pointer items-center gap-1.5 rounded-full px-2 py-1 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              <ArrowLeft className="size-4" strokeWidth={1.5} /> Back
            </button>
          )}
          {eyebrow && (
            <div className="text-sm font-semibold tracking-wider text-primary uppercase">
              {eyebrow}
            </div>
          )}
          <h1 className="font-display text-3xl font-bold md:text-4xl">
            {title}
          </h1>
          {description && (
            <p className="max-w-2xl text-muted-foreground">{description}</p>
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
