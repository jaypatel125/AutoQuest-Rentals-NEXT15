"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Check } from "lucide-react";
import { format } from "date-fns";
import type { DateRange } from "react-day-picker";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { toDate, useSearchStore } from "@/context/searchStore";
import { Branches } from "@/lib/database/table-types";
import { rentalDays, MAX_RENTAL_DAYS } from "@/lib/pricing";
import { nextRange } from "@/lib/date-range";
import { useIsMobile } from "@/hooks/useIsMobile";

async function fetchBranches(): Promise<Branches[]> {
  const response = await fetch("/api/branch");
  if (!response.ok) {
    throw new Error("Failed to fetch cities");
  }
  return response.json();
}

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

export function SearchBar({
  onSearch,
  className,
}: {
  onSearch?: () => void;
  className?: string;
}) {
  const router = useRouter();
  const isMobile = useIsMobile();
  const {
    branch,
    startDate: storeStartDate,
    endDate: storeEndDate,
    setBranch,
    setDates,
  } = useSearchStore();

  const [cityOpen, setCityOpen] = useState(false);
  const [datesOpen, setDatesOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [localBranch, setLocalBranch] = useState<Branches | null>(
    branch || null
  );
  const [range, setRange] = useState<DateRange | undefined>(() => {
    const from = toDate(storeStartDate);
    return from ? { from, to: toDate(storeEndDate) } : undefined;
  });

  // The store rehydrates from localStorage after the first render.
  useEffect(() => {
    if (branch) setLocalBranch(branch);
  }, [branch]);
  useEffect(() => {
    const from = toDate(storeStartDate);
    if (from) setRange({ from, to: toDate(storeEndDate) });
  }, [storeStartDate, storeEndDate]);

  const {
    data: branches = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["branches"],
    queryFn: fetchBranches,
  });

  // One entry per city; the first branch stands in for the city.
  const cities = useMemo(() => {
    const map = new Map<string, { branch: Branches; count: number }>();
    for (const b of branches) {
      if (!b.city) continue;
      const entry = map.get(b.city);
      if (entry) entry.count += 1;
      else map.set(b.city, { branch: b, count: 1 });
    }
    return [...map.entries()].map(([city, v]) => ({ city, ...v }));
  }, [branches]);

  const from = range?.from;
  const to = range?.to;
  const days = from && to ? rentalDays(from, to) : null;
  const tooLong = days !== null && days > MAX_RENTAL_DAYS;
  const ready = !!localBranch?.city && !!from && !!to && !tooLong;

  const handleSearch = async () => {
    if (!ready) return;
    setLoading(true);
    setDates(from, to);
    setBranch(localBranch!);
    try {
      if (onSearch) onSearch();
      else await router.push("/select-vehicle");
    } finally {
      setTimeout(() => setLoading(false), 300);
    }
  };

  const handleRangeSelect = (_next: DateRange | undefined, clicked: Date) => {
    const next = nextRange(range, clicked);
    setRange(next);
    if (next.to) setDatesOpen(false);
  };

  const field =
    "group flex w-full cursor-pointer flex-col items-start gap-0.5 px-4 py-3 text-left transition-colors hover:bg-muted/60 focus-visible:outline-none focus-visible:bg-muted/60";
  const label = "block text-xs text-muted-foreground";

  return (
    <section
      aria-label="Search vehicles"
      className={cn(
        "grid overflow-hidden rounded-lg border bg-background md:grid-cols-[1fr_1.6fr_auto] md:items-stretch",
        className
      )}
    >
      <Popover open={cityOpen} onOpenChange={setCityOpen}>
        <PopoverTrigger asChild>
          <button type="button" className={field}>
            <span className={label}>Location</span>
            <span
              className={cn(
                "block w-full truncate text-sm",
                !localBranch?.city && "text-muted-foreground"
              )}
            >
              {localBranch?.city || "Where are you going?"}
            </span>
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-72 p-0" align="start">
          <Command>
            <CommandInput placeholder="Search city..." />
            <CommandList>
              {isLoading && (
                <CommandItem disabled>Loading cities...</CommandItem>
              )}
              {error && (
                <CommandItem disabled>Failed to load cities</CommandItem>
              )}
              <CommandEmpty>No city found.</CommandEmpty>
              <CommandGroup>
                {cities.map(({ city, branch: b, count }) => (
                  <CommandItem
                    key={city}
                    value={city}
                    onSelect={() => {
                      setLocalBranch(b);
                      setCityOpen(false);
                      if (!from) setDatesOpen(true);
                    }}
                    className="py-2"
                  >
                    <span className="flex-1">
                      <span className="block">{city}</span>
                      <span className="block text-xs text-muted-foreground">
                        {count > 1 ? `${count} locations` : b.name}
                      </span>
                    </span>
                    <Check
                      className={cn(
                        "size-4",
                        localBranch?.city === city ? "opacity-100" : "opacity-0"
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      <Popover open={datesOpen} onOpenChange={setDatesOpen}>
        <PopoverTrigger asChild>
          <div
            className="grid grid-cols-2 border-t md:border-t-0 md:border-l"
            role="group"
            aria-label="Rental dates"
          >
            <button type="button" className={field}>
              <span className={label}>Pick-up date</span>
              <span
                className={cn(
                  "block truncate text-sm",
                  !from && "text-muted-foreground"
                )}
              >
                {from ? format(from, "EEE, MMM d") : "Add date"}
              </span>
            </button>
            <button type="button" className={cn(field, "border-l")}>
              <span className={label}>
                Return date
                {days !== null && (
                  <span
                    className={cn(
                      "ml-2",
                      tooLong ? "text-destructive" : "text-foreground"
                    )}
                  >
                    {days} day{days === 1 ? "" : "s"}
                  </span>
                )}
              </span>
              <span
                className={cn(
                  "block truncate text-sm",
                  !to && "text-muted-foreground"
                )}
              >
                {to ? format(to, "EEE, MMM d") : "Add date"}
              </span>
            </button>
          </div>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-2" align="center">
          <Calendar
            mode="range"
            numberOfMonths={isMobile ? 1 : 2}
            selected={range}
            onSelect={handleRangeSelect}
            defaultMonth={from}
            disabled={{ before: startOfToday() }}
            className="[--cell-size:--spacing(9)]"
          />
          <div className="flex items-center justify-between gap-3 border-t px-2 pt-2 text-sm">
            <span
              className={cn(
                "text-muted-foreground",
                tooLong && "text-destructive"
              )}
            >
              {tooLong
                ? `Rentals are limited to ${MAX_RENTAL_DAYS} days`
                : from && !to
                  ? "Now pick your return date"
                  : days
                    ? `${days} day rental`
                    : "Pick your pick-up date"}
            </span>
            {range?.from && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setRange(undefined)}
              >
                Clear
              </Button>
            )}
          </div>
        </PopoverContent>
      </Popover>

      <div className="border-t p-2 md:border-t-0 md:border-l">
        <Button
          className="h-full min-h-10 w-full px-6"
          onClick={handleSearch}
          disabled={!ready}
          loading={loading}
        >
          {loading ? "Searching..." : "Search Vehicles"}
        </Button>
      </div>
    </section>
  );
}
