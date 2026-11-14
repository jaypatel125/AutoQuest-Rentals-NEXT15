"use client";

import { createContext, useContext } from "react";
import { Eye, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

const AdminAccessContext = createContext({ readOnly: false });

/** Tells admin screens whether the viewer may change data. */
export function AdminAccessProvider({
  readOnly,
  children,
}: {
  readOnly: boolean;
  children: React.ReactNode;
}) {
  return (
    <AdminAccessContext.Provider value={{ readOnly }}>
      {children}
    </AdminAccessContext.Provider>
  );
}

export function useAdminAccess() {
  return useContext(AdminAccessContext);
}

/** Banner at the top of the admin area for read-only reviewers. */
export function ReviewerBanner() {
  return (
    <div
      role="status"
      className="mb-6 flex items-start gap-3 rounded-2xl border border-amber/50 bg-amber-soft px-4 py-3 text-sm"
    >
      <span className="mt-0.5 inline-flex size-8 shrink-0 items-center justify-center rounded-xl bg-card text-amber-800 dark:text-amber-200">
        <Eye className="size-4" />
      </span>
      <p>
        <strong className="font-semibold">Reviewer mode.</strong> You can open
        every admin page, but saving, deleting and other changes are turned off.
        Customer names and emails are partly hidden.
      </p>
    </div>
  );
}

/** Small note next to a disabled save or delete button. */
export function ReadOnlyNote({
  className,
  children = "Read-only: reviewers can't save changes.",
}: {
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <p
      className={cn(
        "flex items-center gap-1.5 text-xs text-muted-foreground",
        className
      )}
    >
      <Lock className="size-3.5" /> {children}
    </p>
  );
}
