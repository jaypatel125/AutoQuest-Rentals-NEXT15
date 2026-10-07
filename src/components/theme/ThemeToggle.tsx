"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

export function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <button
      type="button"
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Light mode" : "Dark mode"}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={cn(
        "relative inline-flex size-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:text-foreground cursor-pointer",
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
