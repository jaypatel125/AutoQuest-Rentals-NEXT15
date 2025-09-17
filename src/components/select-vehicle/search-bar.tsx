"use client";

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
import { useState } from "react";
import { useRouter } from "next/navigation";

export function SearchBar({
  initialCity,
  initialStartDate,
  initialEndDate,
}: {
  initialCity?: string;
  initialStartDate?: Date;
  initialEndDate?: Date;
}) {
  const router = useRouter();
  const [city, setCity] = useState(initialCity || "");
  const [startDate, setStartDate] = useState<Date | undefined>(
    initialStartDate
  );
  const [endDate, setEndDate] = useState<Date | undefined>(initialEndDate);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (city) params.set("city", city);
    if (startDate) params.set("startDate", startDate.toISOString());
    if (endDate) params.set("endDate", endDate.toISOString());

    router.push(`/select-vehicle?${params.toString()}`);
  };

  return (
    <section className="bg-muted rounded-xl p-6 my-6 shadow-sm grid md:grid-cols-5 gap-4 items-end">
      {/* Location */}
      <div className="space-y-2">
        <Label>Location</Label>
        <Input
          placeholder="Hamilton, Ontario"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="bg-white"
        />
      </div>

      {/* Pickup Date */}
      <div className="space-y-2">
        <Label>Pickup Date</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
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
              onSelect={setStartDate}
              required
              disabled={
                (date) => date < new Date(new Date().setHours(0, 0, 0, 0)) // disable past
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
              variant={"outline"}
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
              onSelect={setEndDate}
              required
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
        <Input placeholder="50 kms" className="bg-white" />
      </div>

      {/* Search Button */}
      <Button
        className="w-full"
        onClick={handleSearch}
        disabled={!startDate || !endDate} // disable if dates not selected
      >
        Find
      </Button>
    </section>
  );
}
