"use client";

import Link from "next/link";
import { Check, Cog, MapPin, Plus, Users } from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import { Cars } from "@/lib/database/table-types";
import { buildQuote } from "@/lib/pricing";
import { bodyTypeLabel } from "@/lib/vehicles";
import { useCompareStore } from "@/context/compareStore";
import { useToast } from "@/hooks/use-toast";
import { VehicleImage } from "./VehicleImage";
import { FuelBadge, GreenScoreBadge } from "./badges";

export type CarListing = Cars & {
  branch_city?: string | null;
  branch_name?: string | null;
};

export function CompareToggle({
  car,
  className,
}: {
  car: CarListing;
  className?: string;
}) {
  const { items, toggle } = useCompareStore();
  const { toast } = useToast();
  const selected = items.some((i) => i.id === car.id);

  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        const result = toggle({
          id: car.id,
          brand: car.brand,
          model: car.model,
          body_type: car.body_type,
          image: car.image,
        });
        if (result === "full") {
          toast({
            title: "Compare up to 3 vehicles",
            description: "Remove one from the compare bar to add another.",
          });
        }
      }}
      className={cn(
        "inline-flex cursor-pointer items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold shadow-sm ring-1 ring-inset backdrop-blur transition-colors",
        selected
          ? "bg-primary text-primary-foreground ring-primary"
          : "bg-card/90 text-foreground ring-border hover:bg-card",
        className
      )}
    >
      {selected ? (
        <Check className="size-3.5" />
      ) : (
        <Plus className="size-3.5" />
      )}
      {selected ? "Comparing" : "Compare"}
    </button>
  );
}

export function VehicleCard({
  car,
  start,
  end,
  onRent,
  priority,
}: {
  car: CarListing;
  start?: Date;
  end?: Date;
  onRent?: (car: CarListing) => void;
  priority?: boolean;
}) {
  const quote =
    start && end
      ? buildQuote({
          pricePerDay: car.price_per_day,
          start,
          end,
          redeemPoints: false,
        })
      : null;

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border bg-card shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-emerald-950/5">
      <Link
        href={`/select-vehicle/${car.id}`}
        className="absolute inset-0 z-10 rounded-2xl focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
        aria-label={`View ${car.brand} ${car.model}`}
      />
      <div className="relative">
        <VehicleImage
          src={car.image}
          brand={car.brand}
          model={car.model}
          bodyType={car.body_type}
          priority={priority}
          className="transition-transform duration-500 group-hover:scale-[1.03]"
        />
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          <FuelBadge fuelType={car.fuel_type} />
        </div>
        <div className="absolute top-3 right-3 z-20">
          <CompareToggle car={car} />
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-4 p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate text-lg font-bold">
              {car.brand} {car.model}
            </h3>
            <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
              {bodyTypeLabel(car.body_type)}
              {car.branch_city && (
                <>
                  <span aria-hidden>·</span>
                  <MapPin className="size-3.5" /> {car.branch_city}
                </>
              )}
            </p>
          </div>
          <div className="relative z-20 shrink-0">
            <GreenScoreBadge emissions={car.carbon_emissions} />
          </div>
        </div>

        <ul className="flex flex-wrap gap-x-4 gap-y-1.5 text-sm text-muted-foreground">
          <li className="inline-flex items-center gap-1.5">
            <Users className="size-4" /> {car.passenger_capacity} seats
          </li>
          <li className="inline-flex items-center gap-1.5">
            <Cog className="size-4" /> {car.transmission}
          </li>
        </ul>

        <div className="mt-auto flex items-end justify-between gap-3 border-t pt-4">
          <div>
            <p className="text-xl font-bold tracking-tight">
              {formatPrice(Number(car.price_per_day))}
              <span className="text-sm font-medium text-muted-foreground">
                {" "}
                /day
              </span>
            </p>
            {quote && (
              <p className="text-xs text-muted-foreground">
                {formatPrice(quote.total)} total · {quote.days} day
                {quote.days === 1 ? "" : "s"}
              </p>
            )}
          </div>
          {onRent && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                onRent(car);
              }}
              className="relative z-20 inline-flex h-9 shrink-0 cursor-pointer items-center whitespace-nowrap rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
            >
              Rent Now
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

export function VehicleCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border bg-card">
      <div className="aspect-[16/10] animate-pulse bg-muted" />
      <div className="space-y-3 p-5">
        <div className="h-5 w-2/3 animate-pulse rounded-lg bg-muted" />
        <div className="h-4 w-1/3 animate-pulse rounded-lg bg-muted" />
        <div className="h-4 w-1/2 animate-pulse rounded-lg bg-muted" />
        <div className="h-8 w-full animate-pulse rounded-lg bg-muted" />
      </div>
    </div>
  );
}
