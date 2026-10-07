import Link from "next/link";
import { cn } from "@/lib/utils";

/** Brand mark: a solid square with a single road line. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={cn("size-5 shrink-0", className)}
    >
      <rect width="24" height="24" rx="5" fill="currentColor" />
      <path
        d="M7 17 L12 7 L17 17"
        fill="none"
        stroke="var(--background)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Logo({
  className,
  href = "/",
}: {
  className?: string;
  href?: string;
}) {
  return (
    <Link
      href={href}
      aria-label="AutoQuest home"
      className={cn(
        "inline-flex items-center gap-2 text-foreground",
        className
      )}
    >
      <LogoMark />
      <span className="text-[15px] font-semibold tracking-tight">
        AutoQuest
      </span>
    </Link>
  );
}
