"use client";

import { useState } from "react";
import { format } from "date-fns";
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

  const cell = "flex-1 px-3 py-2.5 text-left";
  const label = "block text-xs text-muted-foreground";

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "flex w-full cursor-pointer items-stretch divide-x rounded-md border text-sm transition-colors hover:border-foreground/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
            className
          )}
        >
          <span className={cell}>
            <span className={label}>Pick-up</span>
            <span className={cn(!from && "text-muted-foreground")}>
              {from ? format(from, "EEE, MMM d") : "Add date"}
            </span>
          </span>
          <span className={cell}>
            <span className={label}>Return</span>
            <span className={cn(!to && "text-muted-foreground")}>
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
