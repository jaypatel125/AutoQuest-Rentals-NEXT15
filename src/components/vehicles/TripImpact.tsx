"use client";

import { useState } from "react";
import {
  DEFAULT_KM_PER_DAY,
  KG_CO2_PER_TREE_YEAR,
  TYPICAL_CAR_G_PER_KM,
  tripEmissionsKg,
} from "@/lib/green";
import { cn } from "@/lib/utils";

/**
 * Estimates the trip's tailpipe CO2 against a typical gas car. The driver
 * can adjust the expected daily distance.
 */
export function TripImpact({
  emissions,
  days,
  className,
}: {
  emissions: number | string;
  days: number;
  className?: string;
}) {
  const [kmPerDay, setKmPerDay] = useState(DEFAULT_KM_PER_DAY);
  const g = Number(emissions ?? 0);
  const thisCar = tripEmissionsKg(g, days, kmPerDay);
  const typical = tripEmissionsKg(TYPICAL_CAR_G_PER_KM, days, kmPerDay);
  const diff = typical - thisCar;
  const max = Math.max(thisCar, typical, 1);
  const trees = Math.abs(diff) / KG_CO2_PER_TREE_YEAR;

  return (
    <section className={cn("space-y-6", className)}>
      <div>
        <h2 className="font-medium">Trip impact</h2>
        <p className="text-sm text-muted-foreground">
          Estimated tailpipe CO₂ for {days} day{days === 1 ? "" : "s"} of
          driving.
        </p>
      </div>

      <div>
        <label className="mb-2 flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Daily distance</span>
          <span className="tabular-nums">{kmPerDay} km/day</span>
        </label>
        <input
          type="range"
          min={10}
          max={400}
          step={10}
          value={kmPerDay}
          onChange={(e) => setKmPerDay(Number(e.target.value))}
          className="w-full"
          aria-label="Daily distance in kilometres"
        />
      </div>

      <div className="space-y-4">
        <Bar label="This car" value={thisCar} max={max} tone="primary" />
        <Bar
          label={`Typical gas car (${TYPICAL_CAR_G_PER_KM} g/km)`}
          value={typical}
          max={max}
          tone="muted"
        />
      </div>

      <div className="border-t pt-4 text-sm text-muted-foreground">
        {diff >= 1 ? (
          <p>
            You avoid about{" "}
            <span className="text-eco">{Math.round(diff)} kg of CO₂</span>,
            roughly what{" "}
            {trees >= 1 ? `${trees.toFixed(1)} trees absorb` : "a tree absorbs"}{" "}
            in a year.
          </p>
        ) : diff > -1 ? (
          <p>About the same footprint as a typical car for this trip.</p>
        ) : (
          <p>
            About{" "}
            <span className="text-foreground">
              {Math.round(-diff)} kg more CO₂
            </span>{" "}
            than a typical car. Consider an EV to earn 2x points instead.
          </p>
        )}
      </div>
    </section>
  );
}

function Bar({
  label,
  value,
  max,
  tone,
}: {
  label: string;
  value: number;
  max: number;
  tone: "primary" | "muted";
}) {
  return (
    <div>
      <div className="mb-1.5 flex justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="tabular-nums">{value.toFixed(1)} kg</span>
      </div>
      <div className="h-1 overflow-hidden rounded-full bg-muted">
        <div
          className={cn(
            "h-full rounded-full transition-[width] duration-500",
            tone === "primary" ? "bg-foreground" : "bg-muted-foreground/40"
          )}
          style={{
            width: `${Math.max(value > 0 ? 2 : 0, (value / max) * 100)}%`,
          }}
        />
      </div>
    </div>
  );
}
