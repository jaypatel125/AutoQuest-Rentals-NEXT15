"use client";

import { useState } from "react";
import { format } from "date-fns";
import { CalendarDays } from "lucide-react";
import type { DateRange } from "react-day-picker";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useIsMobile } from "@/hooks/useIsMobile";
import { cn } from "@/lib/utils";
import { nextRange } from "@/lib/date-range";

/** Compact pick-up/return field backed by a range calendar. */
export function DateRangeField({
  from,
  to,
  onChange,
  className,
}: {
  from?: Date;
  to?: Date;
  onChange: (from?: Date, to?: Date) => void;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const isMobile = useIsMobile();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const select = (_range: DateRange | undefined, clicked: Date) => {
    const next = nextRange({ from, to }, clicked);
    onChange(next.from, next.to);
    if (next.to) setOpen(false);
  };

  const cell = "flex-1 rounded-xl px-3 py-2 text-left";
  const label =
    "block text-[11px] font-semibold uppercase tracking-wide text-muted-foreground";

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "flex w-full cursor-pointer items-stretch divide-x rounded-xl border bg-card text-sm transition-colors hover:border-primary/40 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
            className
          )}
        >
          <span className={cell}>
            <span className={label}>Pick-up</span>
            <span
              className={cn(
                "flex items-center gap-1.5 font-medium",
                !from && "text-muted-foreground"
              )}
            >
              <CalendarDays className="size-4 text-primary" />
              {from ? format(from, "EEE, MMM d") : "Add date"}
            </span>
          </span>
          <span className={cell}>
            <span className={label}>Return</span>
            <span className={cn("font-medium", !to && "text-muted-foreground")}>
              {to ? format(to, "EEE, MMM d") : "Add date"}
            </span>
          </span>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-2" align="end">
        <Calendar
          mode="range"
          numberOfMonths={isMobile ? 1 : 2}
          selected={from ? { from, to } : undefined}
          onSelect={select}
          defaultMonth={from}
          disabled={{ before: today }}
          className="[--cell-size:--spacing(9)]"
        />
      </PopoverContent>
    </Popover>
  );
}
