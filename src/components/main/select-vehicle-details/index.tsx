"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { VehicleImage } from "@/components/vehicles/VehicleImage";
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
    { label: "Seats", value: `${car.passenger_capacity} passengers` },
    { label: "Transmission", value: car.transmission },
    { label: "Fuel", value: car.fuel_type },
    { label: "Body type", value: bodyTypeLabel(car.body_type) },
    {
      label: "Emissions",
      value: `${Number(car.carbon_emissions)} g CO₂/km`,
    },
    { label: "Green Score", value: `${score.grade} · ${score.label}` },
  ];

  const notes = [
    {
      title: "Free cancellation",
      body: "Full refund up to 24 hours before pick-up.",
    },
    {
      title: "Driver requirements",
      body: "21+ with a valid licence and photo ID.",
    },
    {
      title: ev ? "Charge policy" : "Fuel policy",
      body: `Return with the same ${ev ? "charge" : "fuel"} level as at pick-up.`,
    },
    {
      title: ev ? "2x reward points" : "Reward points",
      body: ev
        ? "Electric rentals earn double points."
        : "Earn 1 point for every dollar spent.",
    },
  ];

  return (
    <div className="grid gap-12 lg:grid-cols-[1.6fr_1fr] lg:gap-16">
      <div className="space-y-12">
        <div className="relative overflow-hidden rounded-lg">
          <VehicleImage
            src={car.image}
            brand={car.brand}
            model={car.model}
            bodyType={car.body_type}
            priority
            sizes="(max-width: 1024px) 100vw, 60vw"
          />
          <div className="absolute top-4 right-4">
            <CompareToggle car={car} />
          </div>
        </div>

        <div>
          <h1 className="text-3xl font-semibold md:text-4xl">
            {car.brand} {car.model}
          </h1>
          <p className="mt-2 text-muted-foreground">
            <span className={ev ? "text-eco" : undefined}>{car.fuel_type}</span>{" "}
            · {bodyTypeLabel(car.body_type)} · {car.transmission} ·{" "}
            {car.passenger_capacity} seats
          </p>
        </div>

        <dl className="grid grid-cols-2 gap-x-8 border-t sm:grid-cols-3">
          {specs.map(({ label, value }) => (
            <div key={label} className="border-b py-4">
              <dt className="text-sm text-muted-foreground">{label}</dt>
              <dd className="mt-1 text-sm">{value}</dd>
            </div>
          ))}
        </dl>

        <TripImpact emissions={car.carbon_emissions} days={quote?.days ?? 3} />

        <section className="space-y-5 border-t pt-8">
          <h2 className="font-medium">Good to know</h2>
          <dl className="grid gap-6 text-sm sm:grid-cols-2">
            {notes.map((note) => (
              <div key={note.title}>
                <dt>{note.title}</dt>
                <dd className="mt-1 text-muted-foreground">{note.body}</dd>
              </div>
            ))}
          </dl>
          <Link
            href="/terms"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Full rental terms
            <ArrowRight className="size-4" strokeWidth={1.5} />
          </Link>
        </section>
      </div>

      <aside className="lg:sticky lg:top-24 lg:self-start">
        <div className="space-y-6 rounded-lg border p-6">
          <p className="text-2xl font-medium">
            <span>{formatPrice(Number(car.price_per_day))}</span>
            <span className="text-base text-muted-foreground"> / day</span>
          </p>

          <DateRangeField
            from={start}
            to={end}
            onChange={(f, t) => setDates(f, t)}
          />

          {hasDates && (
            <div className="text-sm" aria-live="polite">
              {tooLong ? (
                <p className="text-destructive">
                  Rentals are limited to {MAX_RENTAL_DAYS} days.
                </p>
              ) : checking ? (
                <p className="text-muted-foreground">
                  Checking availability...
                </p>
              ) : availability?.available ? (
                <p className="flex items-center gap-2">
                  <span className="size-1.5 rounded-full bg-eco" />
                  Available for your dates
                </p>
              ) : availability ? (
                <p className="text-destructive">
                  {availability.reason || "Not available for these dates."}
                </p>
              ) : null}
            </div>
          )}

          {car.branch_name && (
            <div className="text-sm">
              <p className="text-muted-foreground">Pick-up</p>
              <p className="mt-1">{car.branch_name}</p>
              <p className="text-muted-foreground">
                {[car.branch_address, car.branch_city, car.branch_province]
                  .filter(Boolean)
                  .join(", ")}
              </p>
            </div>
          )}

          {quote && !tooLong && (
            <div className="space-y-2 border-t pt-5 text-sm">
              <Row
                label={`${formatPrice(quote.dailyRate)} x ${quote.days} day${quote.days === 1 ? "" : "s"}`}
                value={formatPrice(quote.rentalCharge)}
              />
              <Row label="Service fee" value={formatPrice(quote.serviceFee)} />
              <Row
                label={`HST (${Math.round(TAX_RATE * 100)}%)`}
                value={formatPrice(quote.tax)}
              />
              <div className="pt-2">
                <Row
                  label="Total before points"
                  value={formatPrice(quote.total)}
                  strong
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Earn about {quote.pointsToEarn.toLocaleString()} points
                {ev ? " (2x for EV)" : ""}
              </p>
            </div>
          )}

          <Button
            size="lg"
            className="w-full"
            onClick={onRentNow}
            disabled={!canRent}
          >
            {hasDates ? "Rent Now" : "Pick dates to continue"}
          </Button>
          <p className="text-center text-xs text-muted-foreground">
            You won&apos;t be charged until checkout.
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
          ? "flex justify-between font-medium"
          : "flex justify-between text-muted-foreground"
      }
    >
      <span>{label}</span>
      <span className={strong ? "" : "text-foreground"}>{value}</span>
    </div>
  );
}
