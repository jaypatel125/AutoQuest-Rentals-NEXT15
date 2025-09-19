"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { useSearchStore } from "@/lib/store/searchStore";

export function SearchBar() {
  const router = useRouter();
  const {
    city: storeCity,
    startDate,
    endDate,
    distance,
    setCity,
    setDates,
    setDistance,
  } = useSearchStore();

  const [localCity, setLocalCity] = useState(storeCity || "");

  const handleSearch = () => {
    // Only update the store city on search
    setCity(localCity);

    const params = new URLSearchParams();
    if (localCity) params.set("city", localCity);

    if (startDate) {
      const start = new Date(startDate);
      params.set("startDate", start.toISOString());
    }

    if (endDate) {
      const end = new Date(endDate);
      params.set("endDate", end.toISOString());
    }

    if (distance) params.set("distance", distance);

    router.push(`/select-vehicle`);
  };

  return (
    <section className="bg-muted rounded-xl p-6 my-6 shadow-sm grid md:grid-cols-5 gap-4 items-end">
      {/* Location */}
      <div className="space-y-2">
        <Label>Location</Label>
        <Input
          placeholder="Hamilton, Ontario"
          value={localCity}
          onChange={(e) => setLocalCity(e.target.value)}
          className="bg-white"
        />
      </div>

      {/* Pickup Date */}
      <div className="space-y-2">
        <Label>Pickup Date</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !startDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {startDate ? format(startDate, "PPP") : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={startDate}
              onSelect={(date) => setDates(date, endDate)}
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
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !endDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {endDate ? format(endDate, "PPP") : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={endDate}
              onSelect={(date) => setDates(startDate, date)}
              disabled={(date) =>
                date < new Date(new Date().setHours(0, 0, 0, 0)) ||
                (startDate ? date < startDate : false)
              }
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Travel Distance */}
      <div className="space-y-2">
        <Label>Approx travel distance</Label>
        <Input
          placeholder="50 kms"
          value={distance}
          onChange={(e) => setDistance(e.target.value)}
          className="bg-white"
        />
      </div>

      {/* Search Button */}
      <Button
        className="w-full"
        onClick={handleSearch}
        disabled={!startDate || !endDate}
      >
        Find
      </Button>
    </section>
  );
}
