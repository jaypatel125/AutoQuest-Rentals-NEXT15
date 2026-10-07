import Link from "next/link";
import { cn } from "@/lib/utils";

/** Brand mark: a "Q" drawn as a road loop with a leaf for the green theme. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      aria-hidden="true"
      className={cn("size-8 shrink-0", className)}
    >
      <defs>
        <linearGradient id="aq-mark" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#34d399" />
          <stop offset="1" stopColor="#047857" />
        </linearGradient>
      </defs>
      <rect width="40" height="40" rx="11" fill="url(#aq-mark)" />
      <circle
        cx="19"
        cy="19"
        r="9.5"
        fill="none"
        stroke="#fff"
        strokeWidth="3.6"
      />
      <path
        d="M23.5 23.5 L30 30"
        stroke="#fff"
        strokeWidth="3.6"
        strokeLinecap="round"
      />
      <path
        d="M19 14.2c2.9 0 4.6 2 4.6 4.4-2.9 0-4.6-2-4.6-4.4Z"
        fill="#d1fae5"
      />
    </svg>
  );
}

export function Logo({
  className,
  href = "/",
  tone = "default",
}: {
  className?: string;
  href?: string;
  tone?: "default" | "light";
}) {
  return (
    <Link
      href={href}
      aria-label="AutoQuest home"
      className={cn("inline-flex items-center gap-2.5", className)}
    >
      <LogoMark />
      <span
        className={cn(
          "font-display text-[1.2rem] font-extrabold tracking-tight",
          tone === "light" ? "text-white" : "text-foreground"
        )}
      >
        Auto
        <span
          className={tone === "light" ? "text-emerald-300" : "text-primary"}
        >
          Quest
        </span>
      </span>
    </Link>
  );
}
