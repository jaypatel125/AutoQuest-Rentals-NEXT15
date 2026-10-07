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
        "space-y-10 py-12 md:py-16",
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
              className="no-print mb-4 inline-flex cursor-pointer items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="size-4" strokeWidth={1.5} /> Back
            </button>
          )}
          {eyebrow && (
            <div className="text-sm text-muted-foreground">{eyebrow}</div>
          )}
          <h1 className="text-3xl font-semibold md:text-4xl">{title}</h1>
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
