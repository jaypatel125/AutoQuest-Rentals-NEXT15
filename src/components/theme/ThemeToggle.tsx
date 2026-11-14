"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

export function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  // The theme is only known on the client, so the label is neutral until
  // mounted to keep server and client markup identical.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const isDark = resolvedTheme === "dark";
  const label = !mounted
    ? "Toggle theme"
    : isDark
      ? "Switch to light mode"
      : "Switch to dark mode";

  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={cn(
        "relative inline-flex size-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground cursor-pointer",
        className
      )}
    >
      <Sun
        strokeWidth={1.5}
        className="size-[18px] scale-100 transition-transform dark:scale-0"
      />
      <Moon
        strokeWidth={1.5}
        className="absolute size-[18px] scale-0 transition-transform dark:scale-100"
      />
    </button>
  );
}
