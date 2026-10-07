"use client";

import Link from "next/link";
import { Check, Plus } from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import { Cars } from "@/lib/database/table-types";
import { buildQuote } from "@/lib/pricing";
import { bodyTypeLabel } from "@/lib/vehicles";
import { useCompareStore } from "@/context/compareStore";
import { useToast } from "@/hooks/use-toast";
import { VehicleImage } from "./VehicleImage";
import { greenScore } from "@/lib/green";

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
        "inline-flex cursor-pointer items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors",
        selected
          ? "border-foreground bg-foreground text-background"
          : "bg-background/90 text-muted-foreground hover:text-foreground",
        className
      )}
    >
      {selected ? <Check className="size-3" /> : <Plus className="size-3" />}
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
  const score = greenScore(car.carbon_emissions);
  const electric = car.fuel_type === "Electric";

  return (
    <article className="group relative flex flex-col">
      <Link
        href={`/select-vehicle/${car.id}`}
        className="absolute inset-0 z-10 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-4"
        aria-label={`View ${car.brand} ${car.model}`}
      />
      <div className="relative overflow-hidden rounded-lg">
        <VehicleImage
          src={car.image}
          brand={car.brand}
          model={car.model}
          bodyType={car.body_type}
          priority={priority}
          className="transition-opacity group-hover:opacity-90"
        />
        <div className="absolute top-3 right-3 z-20">
          <CompareToggle car={car} />
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 pt-4">
        <div className="min-w-0">
          <h3 className="truncate font-medium">
            {car.brand} {car.model}
          </h3>
          <p className="mt-0.5 truncate text-sm text-muted-foreground">
            <span className={cn(electric && "text-eco")}>{car.fuel_type}</span>
            {" · "}
            {bodyTypeLabel(car.body_type)}
            {car.branch_city && <> · {car.branch_city}</>}
          </p>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {car.passenger_capacity} seats · {car.transmission} · Green{" "}
            {score.grade}
          </p>
        </div>

        <div className="mt-auto flex items-end justify-between gap-3">
          <div>
            <p className="text-sm">
              <span className="font-medium">
                {formatPrice(Number(car.price_per_day))}
              </span>
              <span className="text-muted-foreground"> / day</span>
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
              className="relative z-20 inline-flex h-8 shrink-0 cursor-pointer items-center whitespace-nowrap rounded-md border px-3 text-[13px] font-medium transition-colors hover:border-foreground hover:bg-foreground hover:text-background"
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
    <div>
      <div className="aspect-[16/10] animate-pulse rounded-lg bg-muted" />
      <div className="space-y-2 pt-4">
        <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
        <div className="h-3.5 w-1/2 animate-pulse rounded bg-muted" />
        <div className="h-3.5 w-1/3 animate-pulse rounded bg-muted" />
      </div>
    </div>
  );
}
