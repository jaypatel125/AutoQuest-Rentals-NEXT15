"use client";

import { Button } from "@/components/ui/button";
import { buildRentalIcs, downloadFile } from "@/lib/ics";

export function AddToCalendarButton({
  id,
  vehicle,
  start,
  end,
  location,
  variant = "outline",
  className,
}: {
  id: string;
  vehicle: string;
  start: Date | string;
  end: Date | string;
  location: string;
  variant?: "outline" | "default" | "ghost";
  className?: string;
}) {
  return (
    <Button
      variant={variant}
      className={className}
      onClick={() =>
        downloadFile(
          `autoquest-${vehicle.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.ics`,
          buildRentalIcs({
            uid: id,
            title: `AutoQuest rental: ${vehicle}`,
            description: `Pick up your ${vehicle}. Bring your driver's licence and photo ID.`,
            location,
            start: new Date(start),
            end: new Date(end),
          })
        )
      }
    >
      Add to calendar
    </Button>
  );
}
