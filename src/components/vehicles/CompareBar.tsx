"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { MAX_COMPARE, useCompareStore } from "@/context/compareStore";

const HIDDEN_ON = ["/compare", "/checkout", "/confirmation", "/account"];

/** Floating tray that collects vehicles to compare side by side. */
export function CompareBar() {
  const pathname = usePathname();
  const { items, remove, clear } = useCompareStore();
  // The list lives in localStorage; render only after hydration.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (
    !mounted ||
    items.length === 0 ||
    HIDDEN_ON.some((p) => pathname.startsWith(p))
  ) {
    return null;
  }

  return (
    <div className="no-print fixed inset-x-0 bottom-4 z-40 flex justify-center px-4 animate-fade-in">
      <div className="flex max-w-full items-center gap-3 rounded-lg border bg-background p-2 pl-4 shadow-sm">
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-none">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex shrink-0 items-center gap-1 rounded-md py-1 pr-1 pl-2 text-sm"
            >
              <span className="max-w-[9rem] truncate">
                {item.brand} {item.model}
              </span>
              <button
                type="button"
                aria-label={`Remove ${item.brand} ${item.model}`}
                onClick={() => remove(item.id)}
                className="inline-flex size-6 cursor-pointer items-center justify-center rounded text-muted-foreground hover:text-foreground"
              >
                <X className="size-3.5" />
              </button>
            </div>
          ))}
          {items.length < MAX_COMPARE && (
            <span className="hidden shrink-0 px-2 text-xs text-muted-foreground md:inline">
              Add up to {MAX_COMPARE - items.length} more
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={clear}
          className="hidden shrink-0 cursor-pointer text-sm text-muted-foreground hover:text-foreground sm:inline"
        >
          Clear
        </button>
        <Link
          href="/compare"
          className="inline-flex h-9 shrink-0 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/85"
        >
          Compare ({items.length})
        </Link>
      </div>
    </div>
  );
}
