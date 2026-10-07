"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQueries } from "@tanstack/react-query";
import { Scale, X } from "lucide-react";
import PageLayout from "@/components/utility/page-layout";
import { EmptyState } from "@/components/utility/EmptyState";
import { Button } from "@/components/ui/button";
import { VehicleImage } from "@/components/vehicles/VehicleImage";
import type { CarListing } from "@/components/vehicles/VehicleCard";
import { useCompareStore } from "@/context/compareStore";
import { toDate, useSearchStore } from "@/context/searchStore";
import { buildQuote } from "@/lib/pricing";
import { DEFAULT_KM_PER_DAY, greenScore, tripEmissionsKg } from "@/lib/green";
import { bodyTypeLabel } from "@/lib/vehicles";
import { formatPrice } from "@/lib/utils";

type Detail = CarListing & { branch_address?: string | null };

async function fetchVehicle(id: string): Promise<Detail> {
  const res = await fetch(`/api/vehicles/${id}`);
  if (!res.ok) throw new Error("Vehicle not found");
  return res.json();
}

export default function ComparePage() {
  const router = useRouter();
  const { items, remove, clear } = useCompareStore();
  const { startDate, endDate, setSelectedCar } = useSearchStore();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const start = toDate(startDate);
  const end = toDate(endDate);
  const days =
    start && end ? buildQuote({ pricePerDay: 0, start, end }).days : 3;

  const queries = useQueries({
    queries: items.map((item) => ({
      queryKey: ["vehicle", item.id],
      queryFn: () => fetchVehicle(item.id),
    })),
  });
  const cars = queries.map((q) => q.data).filter(Boolean) as Detail[];
  const loading = queries.some((q) => q.isLoading);

  if (!mounted) return null;

  if (items.length === 0) {
    return (
      <PageLayout
        title="Compare vehicles"
        description="Line up to three cars side by side."
      >
        <EmptyState
          icon={Scale}
          title="Nothing to compare yet"
          description="Tap “Compare” on any vehicle card to add it here. You can compare up to three at a time."
          action={
            <Button asChild>
              <Link href="/select-vehicle">Browse cars</Link>
            </Button>
          }
        />
      </PageLayout>
    );
  }

  const price = (c: Detail) => Number(c.price_per_day);
  const cheapest = cars.length > 1 ? Math.min(...cars.map(price)) : null;
  const greenest =
    cars.length > 1
      ? Math.min(...cars.map((c) => Number(c.carbon_emissions)))
      : null;

  const rows: { label: string; render: (c: Detail) => React.ReactNode }[] = [
    {
      label: "Price per day",
      render: (c) => (
        <Best active={cheapest === price(c)} label="Lowest price">
          {formatPrice(price(c))}
        </Best>
      ),
    },
    {
      label: start && end ? `Trip total (${days} days)` : "3-day estimate",
      render: (c) =>
        formatPrice(
          buildQuote({
            pricePerDay: c.price_per_day,
            start: start ?? new Date(),
            end: end ?? new Date(Date.now() + 3 * 86400000),
            redeemPoints: false,
          }).total
        ),
    },
    {
      label: "Green Score",
      render: (c) => (
        <Best active={greenest === Number(c.carbon_emissions)} label="Greenest">
          {greenScore(c.carbon_emissions).grade}
        </Best>
      ),
    },
    {
      label: "Emissions",
      render: (c) => `${Number(c.carbon_emissions)} g CO₂/km`,
    },
    {
      label: `Trip CO₂ (${DEFAULT_KM_PER_DAY} km/day)`,
      render: (c) =>
        `${tripEmissionsKg(c.carbon_emissions, days).toFixed(1)} kg`,
    },
    { label: "Fuel", render: (c) => c.fuel_type },
    { label: "Body type", render: (c) => bodyTypeLabel(c.body_type) },
    { label: "Seats", render: (c) => c.passenger_capacity },
    { label: "Transmission", render: (c) => c.transmission },
    {
      label: "Pick-up",
      render: (c) =>
        c.branch_name ? `${c.branch_name}, ${c.branch_city}` : "-",
    },
  ];

  return (
    <PageLayout
      title="Compare vehicles"
      description={
        start && end
          ? `Prices and emissions for your ${days}-day trip.`
          : "Add trip dates on the search page to see exact totals."
      }
      actions={
        <Button variant="outline" size="sm" onClick={clear}>
          Clear all
        </Button>
      }
    >
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] table-fixed text-sm">
          <thead>
            <tr className="border-b align-top">
              <th className="w-44 py-4 pr-4 text-left font-normal text-muted-foreground">
                {loading ? "Loading..." : `${cars.length} vehicles`}
              </th>
              {cars.map((c) => (
                <th key={c.id} className="p-4 text-left font-normal">
                  <div className="relative overflow-hidden rounded-md">
                    <VehicleImage
                      src={c.image}
                      brand={c.brand}
                      model={c.model}
                      bodyType={c.body_type}
                    />
                    <button
                      type="button"
                      aria-label={`Remove ${c.brand} ${c.model}`}
                      onClick={() => remove(c.id)}
                      className="absolute top-2 right-2 inline-flex size-7 cursor-pointer items-center justify-center rounded-full border bg-background text-muted-foreground hover:text-foreground"
                    >
                      <X className="size-3.5" />
                    </button>
                  </div>
                  <p className="mt-3 font-medium">
                    {c.brand} {c.model}
                  </p>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.label} className="border-b">
                <th
                  scope="row"
                  className="py-3.5 pr-4 text-left font-normal text-muted-foreground"
                >
                  {row.label}
                </th>
                {cars.map((c) => (
                  <td key={c.id} className="p-4">
                    {row.render(c)}
                  </td>
                ))}
              </tr>
            ))}
            <tr>
              <td className="p-4" />
              {cars.map((c) => (
                <td key={c.id} className="p-4">
                  <div className="flex flex-wrap gap-2">
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/select-vehicle/${c.id}`}>Details</Link>
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => {
                        setSelectedCar(c);
                        router.push(
                          start && end ? "/checkout" : `/select-vehicle/${c.id}`
                        );
                      }}
                    >
                      Rent Now
                    </Button>
                  </div>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </PageLayout>
  );
}

function Best({
  active,
  label,
  children,
}: {
  active: boolean;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <span className="inline-flex flex-wrap items-center gap-2">
      {children}
      {active && <span className="text-xs text-muted-foreground">{label}</span>}
    </span>
  );
}
