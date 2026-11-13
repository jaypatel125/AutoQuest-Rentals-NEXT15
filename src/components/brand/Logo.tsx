import Link from "next/link";
import { cn } from "@/lib/utils";

/** Brand mark: a road loop drawn as a "Q", with a small leaf. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 36 36"
      aria-hidden="true"
      className={cn("size-9 shrink-0", className)}
    >
      <rect width="36" height="36" rx="11" className="fill-primary" />
      <circle
        cx="17"
        cy="17"
        r="8.5"
        fill="none"
        stroke="white"
        strokeWidth="3.2"
      />
      <path
        d="M21.5 21.5 L27.5 27.5"
        stroke="white"
        strokeWidth="3.2"
        strokeLinecap="round"
      />
      <path
        d="M17 12.6c2.7 0 4.3 1.9 4.3 4.1-2.7 0-4.3-1.9-4.3-4.1Z"
        className="fill-amber"
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
          "font-display text-[1.25rem] font-extrabold tracking-tight",
          tone === "light" ? "text-white" : "text-foreground"
        )}
      >
        AutoQuest
      </span>
    </Link>
  );
}
