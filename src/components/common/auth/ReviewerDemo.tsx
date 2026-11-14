"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Check, Copy, Eye, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface ReviewerDemoCredentials {
  email: string;
  password: string;
}

function CopyRow({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard can be blocked; the value is visible to copy by hand.
    }
  };
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg bg-card/80 px-3 py-2">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="flex min-w-0 items-center gap-1.5">
        <code className="truncate font-mono text-[13px] font-semibold">
          {value}
        </code>
        <button
          type="button"
          onClick={copy}
          aria-label={`Copy reviewer ${label.toLowerCase()}`}
          className="inline-flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground"
        >
          {copied ? (
            <Check className="size-3.5 text-eco" />
          ) : (
            <Copy className="size-3.5" />
          )}
        </button>
      </dd>
    </div>
  );
}

/**
 * The shared, read-only reviewer login. On the sign-in page it signs in
 * directly; elsewhere it links to the sign-in page.
 */
export function ReviewerDemoCard({
  credentials,
  onSignIn,
  pending,
  highlight,
  className,
}: {
  credentials: ReviewerDemoCredentials;
  onSignIn?: () => void;
  pending?: boolean;
  highlight?: boolean;
  className?: string;
}) {
  return (
    <section
      id="reviewer-demo"
      aria-labelledby="reviewer-demo-title"
      className={cn(
        "scroll-mt-24 rounded-2xl border border-amber/50 bg-amber-soft/70 p-4 text-sm dark:bg-amber-soft/40",
        highlight && "ring-2 ring-amber/60",
        className
      )}
    >
      <div className="flex items-start gap-3">
        <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-xl bg-card text-amber-800 dark:text-amber-200">
          <Eye className="size-4" />
        </span>
        <div className="space-y-1">
          <h2 id="reviewer-demo-title" className="font-display font-bold">
            Explore the admin dashboard
          </h2>
          <p className="text-muted-foreground">
            Sign in with the shared reviewer account to open every admin page.
            It&apos;s read-only: nothing can be changed and customer details are
            partly hidden.
          </p>
        </div>
      </div>
      <dl className="mt-3 grid gap-1.5">
        <CopyRow label="Email" value={credentials.email} />
        <CopyRow label="Password" value={credentials.password} />
      </dl>
      {onSignIn ? (
        <Button
          type="button"
          variant="outline"
          className="mt-3 w-full bg-card"
          onClick={onSignIn}
          loading={pending}
        >
          {!pending && <Lock className="size-4" />}
          Sign in as reviewer
        </Button>
      ) : (
        <Button asChild variant="outline" className="mt-3 w-full bg-card">
          <Link href="/signin?demo=reviewer">
            Open the admin demo <ArrowRight />
          </Link>
        </Button>
      )}
    </section>
  );
}
