"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  CalendarX2,
  CarFront,
  ChevronRight,
  CircleCheck,
  CircleAlert,
  Cog,
  Fuel,
  Gift,
  IdCard,
  Leaf,
  Loader2,
  MapPin,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { VehicleImage } from "@/components/vehicles/VehicleImage";
import { FuelBadge, GreenScoreBadge } from "@/components/vehicles/badges";
import {
  CompareToggle,
  type CarListing,
} from "@/components/vehicles/VehicleCard";
import { TripImpact } from "@/components/vehicles/TripImpact";
import { DateRangeField } from "@/components/main/DateRangeField";
import { toDate, useSearchStore } from "@/context/searchStore";
import {
  buildQuote,
  isElectric,
  MAX_RENTAL_DAYS,
  TAX_RATE,
} from "@/lib/pricing";
import { greenScore } from "@/lib/green";
import { bodyTypeLabel } from "@/lib/vehicles";
import { formatPrice } from "@/lib/utils";

export type VehicleDetail = CarListing & {
  branch_address?: string | null;
  branch_province?: string | null;
  branch_postal_code?: string | null;
};

type Props = {
  car: VehicleDetail;
  onRentNow: () => void;
};

async function checkAvailability(id: string, start: Date, end: Date) {
  const params = new URLSearchParams({
    start: start.toISOString(),
    end: end.toISOString(),
  });
  const res = await fetch(`/api/vehicles/${id}/availability?${params}`);
  const data = await res.json().catch(() => ({}));
  return {
    available: Boolean(data.available),
    reason: (data.reason ?? data.error) as string | undefined,
  };
}

export default function VehicleDetails({ car, onRentNow }: Props) {
  const { startDate, endDate, setDates } = useSearchStore();
  const start = toDate(startDate);
  const end = toDate(endDate);
  const hasDates = !!start && !!end;
  const ev = isElectric(car.fuel_type);
  const score = greenScore(car.carbon_emissions);

  const quote = hasDates
    ? buildQuote({
        pricePerDay: car.price_per_day,
        start,
        end,
        fuelType: car.fuel_type,
        redeemPoints: false,
      })
    : null;
  const tooLong = !!quote && quote.days > MAX_RENTAL_DAYS;

  const { data: availability, isFetching: checking } = useQuery({
    queryKey: [
      "availability",
      car.id,
      start?.toISOString(),
      end?.toISOString(),
    ],
    queryFn: () => checkAvailability(car.id, start!, end!),
    enabled: hasDates && !tooLong,
  });
  const canRent =
    hasDates && !tooLong && availability?.available === true && car.available;

  const specs = [
    {
      icon: Users,
      label: "Seats",
      value: `${car.passenger_capacity} passengers`,
    },
    { icon: Cog, label: "Transmission", value: car.transmission },
    { icon: Fuel, label: "Fuel", value: car.fuel_type },
    { icon: CarFront, label: "Body type", value: bodyTypeLabel(car.body_type) },
    {
      icon: Leaf,
      label: "Emissions",
      value: `${Number(car.carbon_emissions)} g CO₂/km`,
    },
    { icon: MapPin, label: "Pick-up", value: car.branch_city ?? "See branch" },
  ];

  return (
    <div className="grid gap-8 lg:grid-cols-[1.55fr_1fr]">
      <div className="space-y-8">
        <div className="relative overflow-hidden rounded-3xl border">
          <VehicleImage
            src={car.image}
            brand={car.brand}
            model={car.model}
            bodyType={car.body_type}
            priority
            sizes="(max-width: 1024px) 100vw, 60vw"
          />
          <div className="absolute top-4 left-4 flex gap-2">
            <FuelBadge fuelType={car.fuel_type} />
          </div>
          <div className="absolute top-4 right-4">
            <CompareToggle car={car} />
          </div>
        </div>

        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold">
              {car.brand} {car.model}
            </h2>
            <p className="mt-1 text-muted-foreground">
              {bodyTypeLabel(car.body_type)} · {car.transmission} ·{" "}
              {car.passenger_capacity} seats
            </p>
          </div>
          <GreenScoreBadge
            emissions={car.carbon_emissions}
            showLabel
            className="text-sm"
          />
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {specs.map(({ icon: Icon, label, value }) => (
            <div key={label} className="rounded-2xl border bg-card p-4">
              <Icon className="mb-2 size-5 text-primary" />
              <p className="text-xs font-medium text-muted-foreground">
                {label}
              </p>
              <p className="font-semibold">{value}</p>
            </div>
          ))}
        </div>

        <TripImpact emissions={car.carbon_emissions} days={quote?.days ?? 3} />

        <section className="rounded-2xl border bg-card p-6">
          <h2 className="mb-4 text-lg font-bold">Good to know</h2>
          <ul className="grid gap-4 text-sm sm:grid-cols-2">
            <li className="flex gap-3">
              <CalendarX2 className="size-5 shrink-0 text-primary" />
              <span>
                <strong className="block">Free cancellation</strong>
                <span className="text-muted-foreground">
                  Full refund up to 24 hours before pick-up.
                </span>
              </span>
            </li>
            <li className="flex gap-3">
              <IdCard className="size-5 shrink-0 text-primary" />
              <span>
                <strong className="block">Driver requirements</strong>
                <span className="text-muted-foreground">
                  21+ with a valid licence and photo ID.
                </span>
              </span>
            </li>
            <li className="flex gap-3">
              <Fuel className="size-5 shrink-0 text-primary" />
              <span>
                <strong className="block">
                  {ev ? "Charge policy" : "Fuel policy"}
                </strong>
                <span className="text-muted-foreground">
                  Return with the same {ev ? "charge" : "fuel"} level as at
                  pick-up.
                </span>
              </span>
            </li>
            <li className="flex gap-3">
              <Gift className="size-5 shrink-0 text-primary" />
              <span>
                <strong className="block">
                  {ev ? "2x reward points" : "Reward points"}
                </strong>
                <span className="text-muted-foreground">
                  {ev
                    ? "Electric rentals earn double points."
                    : "Earn 1 point for every dollar spent."}
                </span>
              </span>
            </li>
          </ul>
          <Link
            href="/terms"
            className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
          >
            Full rental terms <ChevronRight className="size-4" />
          </Link>
        </section>
      </div>

      <aside className="lg:sticky lg:top-24 lg:self-start">
        <div className="space-y-5 rounded-3xl border bg-card p-6 shadow-xl shadow-emerald-950/5">
          <div className="flex items-end justify-between">
            <p className="text-3xl font-bold tracking-tight">
              {formatPrice(Number(car.price_per_day))}
              <span className="text-base font-medium text-muted-foreground">
                {" "}
                /day
              </span>
            </p>
            <span className="rounded-full bg-accent px-2.5 py-1 text-xs font-semibold text-accent-foreground">
              Green {score.grade}
            </span>
          </div>

          <DateRangeField
            from={start}
            to={end}
            onChange={(f, t) => setDates(f, t)}
          />

          {hasDates && (
            <div className="text-sm" aria-live="polite">
              {tooLong ? (
                <p className="flex items-center gap-2 text-destructive">
                  <CircleAlert className="size-4" /> Rentals are limited to{" "}
                  {MAX_RENTAL_DAYS} days.
                </p>
              ) : checking ? (
                <p className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="size-4 animate-spin" /> Checking
                  availability...
                </p>
              ) : availability?.available ? (
                <p className="flex items-center gap-2 font-medium text-primary">
                  <CircleCheck className="size-4" /> Available for your dates
                </p>
              ) : availability ? (
                <p className="flex items-center gap-2 text-destructive">
                  <CircleAlert className="size-4" />{" "}
                  {availability.reason || "Not available for these dates."}
                </p>
              ) : null}
            </div>
          )}

          {car.branch_name && (
            <div className="flex gap-3 rounded-2xl bg-muted/60 p-3 text-sm">
              <MapPin className="mt-0.5 size-4 shrink-0 text-primary" />
              <div>
                <p className="font-semibold">{car.branch_name}</p>
                <p className="text-muted-foreground">
                  {[car.branch_address, car.branch_city, car.branch_province]
                    .filter(Boolean)
                    .join(", ")}
                </p>
              </div>
            </div>
          )}

          {quote && !tooLong && (
            <div className="space-y-2 text-sm">
              <Row
                label={`${formatPrice(quote.dailyRate)} x ${quote.days} day${quote.days === 1 ? "" : "s"}`}
                value={formatPrice(quote.rentalCharge)}
              />
              <Row label="Service fee" value={formatPrice(quote.serviceFee)} />
              <Row
                label={`HST (${Math.round(TAX_RATE * 100)}%)`}
                value={formatPrice(quote.tax)}
              />
              <Separator className="my-3" />
              <Row
                label="Total before points"
                value={formatPrice(quote.total)}
                strong
              />
              <p className="flex items-center gap-1.5 pt-1 text-xs font-medium text-primary">
                <Gift className="size-3.5" /> Earn about{" "}
                {quote.pointsToEarn.toLocaleString()} points
                {ev ? " (2x for EV)" : ""}
              </p>
            </div>
          )}

          <Button
            size="lg"
            className="h-12 w-full text-base"
            iconType="right-arrow"
            onClick={onRentNow}
            disabled={!canRent}
          >
            {hasDates ? "Rent Now" : "Pick dates to continue"}
          </Button>
          <p className="text-center text-xs text-muted-foreground">
            You won&apos;t be charged until checkout. Points can be redeemed
            there.
          </p>
        </div>
      </aside>
    </div>
  );
}

function Row({
  label,
  value,
  strong,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div
      className={
        strong
          ? "flex justify-between text-base font-bold"
          : "flex justify-between text-muted-foreground"
      }
    >
      <span>{label}</span>
      <span className={strong ? "" : "text-foreground"}>{value}</span>
    </div>
  );
}
