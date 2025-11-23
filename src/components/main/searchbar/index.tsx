"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
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
import {
  Popover as CommandPopover,
  PopoverContent as CommandPopoverContent,
  PopoverTrigger as CommandPopoverTrigger,
} from "@/components/ui/popover";
import { ChevronsUpDown, Check } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useSearchStore } from "@/context/searchStore";
import { Label } from "@/components/ui/label";
import { Branches } from "@/lib/database/table-types";

async function fetchBranches(): Promise<Branches[]> {
  const response = await fetch("/api/branch");
  if (!response.ok) {
    throw new Error("Failed to fetch cities");
  }
  return response.json();
}

export function SearchBar() {
  const router = useRouter();
  const {
    branch: branch,
    startDate: storeStartDate,
    endDate: storeEndDate,
    setBranch,
    setDates,
  } = useSearchStore();

  const [open, setOpen] = useState(false);
  const [localLoading, setLocalLoading] = useState(false);
  const [localCity, setLocalCity] = useState(branch?.city || "");
  const [localStartDate, setLocalStartDate] = useState<Date | null>(
    storeStartDate || null
  );
  const [localEndDate, setLocalEndDate] = useState<Date | null>(
    storeEndDate || null
  );
  const [localBranch, setLocalBranch] = useState<Branches | null>(
    branch || null
  );

  useEffect(() => {
    setLocalStartDate(storeStartDate || null);
  }, [storeStartDate]);

  useEffect(() => {
    setLocalEndDate(storeEndDate || null);
  }, [storeEndDate]);

  useEffect(() => {
    setLocalCity(branch?.city || "");
  }, [branch]);

  useEffect(() => {
    setLocalBranch(branch || null);
  }, [branch]);

  const {
    data: branches = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["branches"],
    queryFn: fetchBranches,
  });

  const handleSearch = async () => {
    if (!localBranch || !localStartDate || !localEndDate) return;

    setLocalLoading(true);
    setDates(localStartDate, localEndDate);
    setBranch(localBranch);

    try {
      await router.push("/select-vehicle");
    } finally {
      // optional small delay to make loader visible briefly
      setTimeout(() => setLocalLoading(false), 300);
    }
  };

  const handleStartDateSelect = (date: Date | undefined) => {
    setLocalStartDate(date || null);
    if (date && localEndDate && localEndDate < date) {
      setLocalEndDate(null);
    }
  };

  const handleEndDateSelect = (date: Date | undefined) => {
    setLocalEndDate(date || null);
  };

  return (
    <section className="bg-muted rounded-xl p-6 my-6 shadow-sm grid md:grid-cols-4 gap-4 items-end">
      <div className="space-y-2">
        <Label>Location</Label>
        <CommandPopover open={open} onOpenChange={setOpen}>
          <CommandPopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-full justify-between bg-white"
            >
              {localCity || "Select a city..."}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </CommandPopoverTrigger>
          <CommandPopoverContent className="w-full p-0">
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
                  {branches.map((branch) => (
                    <CommandItem
                      key={branch.id}
                      value={branch.city ?? undefined}
                      onSelect={() => {
                        setLocalCity(branch.city || "");
                        setLocalBranch(branch);
                        setOpen(false);
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          localCity === branch.city
                            ? "opacity-100"
                            : "opacity-0"
                        )}
                      />
                      {branch.city}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </CommandPopoverContent>
        </CommandPopover>
      </div>

      {/* Pickup Date */}
      <div className="space-y-2">
        <Label>Pickup Date</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              iconType="calendar"
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !localStartDate && "text-muted-foreground"
              )}
            >
              {localStartDate ? (
                format(localStartDate, "PPP")
              ) : (
                <span>Pick-up date</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={localStartDate || undefined}
              onSelect={handleStartDateSelect}
              disabled={(date) =>
                date < new Date(new Date().setHours(0, 0, 0, 0))
              }
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Return Date */}
      <div className="space-y-2">
        <Label>Return Date</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              iconType="calendar"
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !localEndDate && "text-muted-foreground"
              )}
            >
              {localEndDate ? (
                format(localEndDate, "PPP")
              ) : (
                <span>Return date</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={localEndDate || undefined}
              onSelect={handleEndDateSelect}
              disabled={(date) =>
                date < new Date(new Date().setHours(0, 0, 0, 0)) ||
                (localStartDate ? date < localStartDate : false)
              }
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Search Button */}
      <Button
        className="w-full"
        iconType="search"
        onClick={handleSearch}
        disabled={
          !localStartDate || !localEndDate || !localCity || !localBranch
        }
        loading={localLoading}
      >
        {localLoading ? "Searching..." : "Search Vehicles"}
      </Button>
    </section>
  );
}
