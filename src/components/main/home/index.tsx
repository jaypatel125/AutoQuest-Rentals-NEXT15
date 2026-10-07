"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  fetchCarBodyTypes,
  fetchCarBrands,
  fetchFeaturedCars,
  fetchFleetStats,
} from "@/app/actions";
import { SearchBar } from "../searchbar";
import MaxWidthWrapper from "@/components/utility/MaxWidthWrapper";
import {
  VehicleCard,
  VehicleCardSkeleton,
} from "@/components/vehicles/VehicleCard";
import { bodyTypeLabel } from "@/lib/vehicles";
import { REWARD_TIERS } from "@/lib/rewards";

const STEPS = [
  {
    title: "Search",
    body: "Pick a city and your dates. Only cars free for the whole trip are shown.",
  },
  {
    title: "Compare",
    body: "Every car has a Green Score and an all-in price, taxes and fees included.",
  },
  {
    title: "Drive",
    body: "Pay securely, pick up at the branch, and cancel free up to 24 hours before.",
  },
];

const FAQS = [
  {
    q: "How do reward points work?",
    a: "You earn 1 point per dollar spent, or 2 points per dollar on electric vehicles. At checkout, every 10 points takes $1 off, up to 1,000 points per booking.",
  },
  {
    q: "Can I cancel my booking?",
    a: "Yes. Cancel from your bookings page more than 24 hours before pick-up for a full refund. Inside 24 hours, one day's rental is kept and the rest is refunded.",
  },
  {
    q: "What is the Green Score?",
    a: "A simple A+ to E rating based on each car's CO₂ emissions per kilometre. Electric cars score A+ with zero tailpipe emissions.",
  },
  {
    q: "What do I need to pick up a car?",
    a: "Drivers must be 21 or older with a valid driver's licence and a government-issued photo ID.",
  },
];

function Stat({ value, label }: { value?: number; label: string }) {
  return (
    <div>
      <dd className="text-2xl font-medium tabular-nums">
        {value === undefined ? (
          <span className="inline-block h-6 w-8 animate-pulse rounded bg-muted align-middle" />
        ) : (
          value.toLocaleString()
        )}
      </dd>
      <dt className="text-sm text-muted-foreground">{label}</dt>
    </div>
  );
}

const HomePage = () => {
  const router = useRouter();
  const { data: stats } = useQuery({
    queryKey: ["stats"],
    queryFn: fetchFleetStats,
  });
  const { data: featured, isLoading: featuredLoading } = useQuery({
    queryKey: ["featured"],
    queryFn: fetchFeaturedCars,
  });
  const { data: brands = [] } = useQuery<string[]>({
    queryKey: ["brands"],
    queryFn: () => fetchCarBrands(),
  });
  const { data: bodyTypes = [] } = useQuery<string[]>({
    queryKey: ["bodyTypes"],
    queryFn: () => fetchCarBodyTypes(),
  });

  return (
    <div className="pb-24">
      {/* Hero */}
      <MaxWidthWrapper className="pt-20 pb-16 md:pt-28 md:pb-20">
        <p className="mb-5 text-sm text-muted-foreground">
          Car rentals across Canada
        </p>
        <h1 className="max-w-3xl text-5xl leading-[1.05] font-semibold sm:text-6xl">
          Find, book, and drive green.
        </h1>
        <p className="mt-5 max-w-xl text-lg text-muted-foreground">
          Electric, hybrid, and gas cars with the full price and carbon
          footprint upfront. Earn double points when you go electric.
        </p>
        <SearchBar className="mt-10" />
        <dl className="mt-10 flex gap-12">
          <Stat value={stats?.vehicles} label="Cars" />
          <Stat value={stats?.low_emission} label="Electric & hybrid" />
          <Stat value={stats?.cities} label="Cities" />
        </dl>
      </MaxWidthWrapper>

      {/* Body types */}
      <MaxWidthWrapper>
        <div className="flex flex-wrap items-center gap-2 border-t pt-10">
          <span className="mr-2 text-sm text-muted-foreground">Browse</span>
          {bodyTypes.map((type) => (
            <Link
              key={type}
              href={`/select-vehicle?bodyTypes=${encodeURIComponent(type)}`}
              className="rounded-full border px-3.5 py-1.5 text-sm transition-colors hover:border-foreground"
            >
              {bodyTypeLabel(type)}
            </Link>
          ))}
        </div>
      </MaxWidthWrapper>

      {/* Featured */}
      <MaxWidthWrapper className="mt-24">
        <SectionHeading
          title="Low-emission picks"
          description="One of each model, greenest first."
          action={
            <Link
              href="/select-vehicle"
              className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              All cars <ArrowRight className="size-4" strokeWidth={1.5} />
            </Link>
          }
        />
        <div className="mt-10 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
          {featuredLoading
            ? Array.from({ length: 4 }).map((_, i) => (
                <VehicleCardSkeleton key={i} />
              ))
            : featured
                ?.slice(0, 8)
                .map((car, i) => (
                  <VehicleCard key={car.id} car={car} priority={i < 4} />
                ))}
        </div>
      </MaxWidthWrapper>

      {/* How it works */}
      <MaxWidthWrapper className="mt-32">
        <SectionHeading title="How it works" />
        <ol className="mt-10 grid gap-10 md:grid-cols-3">
          {STEPS.map((step, i) => (
            <li key={step.title} className="border-t pt-5">
              <p className="text-sm text-muted-foreground tabular-nums">
                0{i + 1}
              </p>
              <h3 className="mt-3 font-medium">{step.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                {step.body}
              </p>
            </li>
          ))}
        </ol>
      </MaxWidthWrapper>

      {/* Rewards */}
      <MaxWidthWrapper className="mt-32">
        <div className="grid gap-10 rounded-lg bg-muted px-8 py-12 md:grid-cols-[1.2fr_1fr] md:items-center md:px-12">
          <div>
            <h2 className="text-2xl font-semibold md:text-3xl">
              Rewards for driving cleaner
            </h2>
            <p className="mt-3 max-w-md text-muted-foreground">
              Earn a point for every dollar, and twice that on electric cars.
              Every 10 points takes $1 off your next trip.
            </p>
            <Button
              variant="outline"
              className="mt-6 bg-background"
              onClick={() => router.push("/rewards")}
            >
              Learn more
            </Button>
          </div>
          <ol className="grid grid-cols-2 gap-px overflow-hidden rounded-md border bg-border text-sm">
            {REWARD_TIERS.map((tier) => (
              <li key={tier.name} className="bg-background p-4">
                <p className="font-medium">{tier.name}</p>
                <p className="text-muted-foreground">
                  {tier.min === 0
                    ? "Start here"
                    : `${tier.min.toLocaleString()}+ pts`}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </MaxWidthWrapper>

      {/* FAQ */}
      <MaxWidthWrapper className="mt-32 grid items-start gap-10 lg:grid-cols-[1fr_1.6fr]">
        <SectionHeading
          title="Questions"
          description={
            <>
              Something else?{" "}
              <Link
                href="/contact"
                className="text-foreground underline decoration-border underline-offset-4 hover:decoration-foreground"
              >
                Contact us
              </Link>
              .
            </>
          }
        />
        <div className="divide-y border-y">
          {FAQS.map((faq) => (
            <details
              key={faq.q}
              className="group py-5 [&_summary::-webkit-details-marker]:hidden"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4">
                {faq.q}
                <Plus
                  className="size-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-45"
                  strokeWidth={1.5}
                />
              </summary>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
                {faq.a}
              </p>
            </details>
          ))}
        </div>
      </MaxWidthWrapper>

      {/* Brands */}
      {brands.length > 0 && (
        <MaxWidthWrapper className="mt-24">
          <p className="text-sm text-muted-foreground">
            In our fleet:{" "}
            {brands.map((brand, i) => (
              <span key={brand}>
                {i > 0 && ", "}
                <Link
                  href={`/select-vehicle?brands=${encodeURIComponent(brand)}`}
                  className="transition-colors hover:text-foreground"
                >
                  {brand}
                </Link>
              </span>
            ))}
          </p>
        </MaxWidthWrapper>
      )}
    </div>
  );
};

function SectionHeading({
  title,
  description,
  action,
}: {
  title: string;
  description?: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold md:text-3xl">{title}</h2>
        {description && <p className="text-muted-foreground">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export default HomePage;
