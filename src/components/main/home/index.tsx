"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  BadgeCheck,
  CalendarX2,
  ChevronDown,
  Gauge,
  Gift,
  Leaf,
  ReceiptText,
  Sparkles,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  fetchCarBodyTypes,
  fetchCarBrands,
  fetchFeaturedCars,
  fetchFleetStats,
} from "@/app/actions";
import { SearchBar } from "../searchbar";
import MaxWidthWrapper from "@/components/utility/MaxWidthWrapper";
import { CarIllustration } from "@/components/vehicles/CarIllustration";
import {
  VehicleCard,
  VehicleCardSkeleton,
} from "@/components/vehicles/VehicleCard";
import { bodyTypeLabel } from "@/lib/vehicles";
import { REWARD_TIERS } from "@/lib/rewards";
import { cn } from "@/lib/utils";

const STEPS = [
  {
    icon: Gauge,
    title: "Search your trip",
    body: "Pick a city and your dates. We only show cars that are free for your whole trip.",
  },
  {
    icon: Leaf,
    title: "Compare and choose",
    body: "Every car has a Green Score and an all-in price, so you know the impact and the total upfront.",
  },
  {
    icon: BadgeCheck,
    title: "Book and drive",
    body: "Pay securely with Stripe, pick up at the branch, and earn points on every rental.",
  },
];

const PERKS = [
  {
    icon: Leaf,
    title: "Green Score on every car",
    body: "A to E ratings from real tailpipe emissions, plus a CO₂ estimate for your trip.",
  },
  {
    icon: ReceiptText,
    title: "No surprise fees",
    body: "See the full price, taxes and fees included, before you pay.",
  },
  {
    icon: CalendarX2,
    title: "Free cancellation",
    body: "Plans changed? Cancel up to 24 hours before pick-up for a full refund.",
  },
  {
    icon: Zap,
    title: "2x points on EVs",
    body: "Earn double reward points on electric rentals and use them on your next trip.",
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
      <p className="font-display text-3xl font-bold text-white">
        {value === undefined ? (
          <span className="inline-block h-8 w-12 animate-pulse rounded-lg bg-white/15 align-middle" />
        ) : (
          value.toLocaleString()
        )}
      </p>
      <p className="text-sm text-white/60">{label}</p>
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
      <section className="relative overflow-hidden bg-hero text-white">
        <div className="bg-grid absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]" />
        <MaxWidthWrapper className="relative grid gap-10 pt-16 pb-28 md:pt-20 lg:grid-cols-[1.1fr_1fr] lg:items-center lg:pb-36">
          <div className="animate-fade-up space-y-6">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-sm font-medium text-emerald-100 backdrop-blur">
              <Sparkles className="size-4 text-emerald-300" />
              Earn 2x points on every electric rental
            </span>
            <h1 className="text-4xl leading-[1.05] font-extrabold sm:text-5xl lg:text-6xl">
              Find, book, and{" "}
              <span className="text-gradient">drive green.</span>
            </h1>
            <p className="max-w-xl text-lg text-white/70">
              Electric, hybrid, and gas cars across Canada. See every
              trip&apos;s carbon footprint and the full price upfront, then earn
              rewards for choosing cleaner.
            </p>
            <div className="flex gap-8 pt-2">
              <Stat value={stats?.vehicles} label="Cars ready" />
              <Stat value={stats?.low_emission} label="Electric & hybrid" />
              <Stat value={stats?.cities} label="Cities" />
            </div>
          </div>

          <div className="relative hidden lg:block" aria-hidden>
            <div className="absolute inset-x-6 bottom-6 h-24 rounded-[100%] bg-emerald-400/25 blur-3xl" />
            <div className="animate-float relative">
              <CarIllustration bodyType="Suv" color="#10b981" />
            </div>
            <div className="absolute -top-4 right-0 rounded-2xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur-md">
              <p className="text-xs text-white/60">Green Score</p>
              <p className="font-display text-xl font-bold text-emerald-300">
                A+ · 0 g/km
              </p>
            </div>
            <div className="absolute -top-4 left-0 rounded-2xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur-md">
              <p className="text-xs text-white/60">This trip earns</p>
              <p className="font-display text-xl font-bold">+2x points</p>
            </div>
          </div>
        </MaxWidthWrapper>
      </section>

      {/* Search */}
      <MaxWidthWrapper className="relative z-10 -mt-16 lg:-mt-20">
        <SearchBar variant="hero" />
      </MaxWidthWrapper>

      {/* Body types */}
      <MaxWidthWrapper className="mt-20 space-y-8">
        <SectionHeading
          eyebrow="Browse"
          title="Find the right shape for your trip"
          action={
            <Link
              href="/select-vehicle"
              className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
            >
              All vehicles <ArrowRight className="size-4" />
            </Link>
          }
        />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
          {(bodyTypes.length
            ? bodyTypes
            : Array.from({ length: 7 }, () => "")
          ).map((type, i) =>
            type ? (
              <Link
                key={type}
                href={`/select-vehicle?bodyTypes=${encodeURIComponent(type)}`}
                className="group rounded-2xl border bg-card p-3 text-center transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg"
              >
                <div className="bg-studio rounded-xl px-2 pt-3 pb-1">
                  <CarIllustration
                    bodyType={type}
                    seed={type}
                    className="transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <p className="mt-2 font-semibold">{bodyTypeLabel(type)}</p>
              </Link>
            ) : (
              <div
                key={i}
                className="h-32 animate-pulse rounded-2xl bg-muted"
              />
            )
          )}
        </div>
      </MaxWidthWrapper>

      {/* Featured */}
      <MaxWidthWrapper className="mt-24 space-y-8">
        <SectionHeading
          eyebrow="Popular picks"
          title="Low-emission favourites"
          description="One of each model, greenest first. Pick dates to see the trip total."
        />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
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
      <MaxWidthWrapper className="mt-24">
        <div className="rounded-3xl border bg-card p-8 md:p-12">
          <SectionHeading
            eyebrow="How it works"
            title="On the road in three steps"
            center
          />
          <ol className="mt-10 grid gap-8 md:grid-cols-3">
            {STEPS.map((step, i) => (
              <li key={step.title} className="relative space-y-3">
                <div className="flex items-center gap-3">
                  <span className="inline-flex size-11 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
                    <step.icon className="size-5" />
                  </span>
                  <span className="font-display text-sm font-bold text-muted-foreground">
                    Step {i + 1}
                  </span>
                </div>
                <h3 className="text-lg font-bold">{step.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {step.body}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </MaxWidthWrapper>

      {/* Rewards */}
      <MaxWidthWrapper className="mt-24">
        <div className="relative overflow-hidden rounded-3xl bg-hero p-8 text-white md:p-12">
          <div className="bg-grid absolute inset-0 opacity-60 [mask-image:linear-gradient(to_left,black,transparent)]" />
          <div className="relative grid gap-10 lg:grid-cols-2 lg:items-center">
            <div className="space-y-5">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-sm font-medium text-emerald-100">
                <Gift className="size-4" /> AutoQuest Rewards
              </span>
              <h2 className="text-3xl font-bold md:text-4xl">
                Earn rewards for going green
              </h2>
              <p className="max-w-lg text-white/70">
                Earn <strong className="text-white">2x points</strong> when
                renting electric vehicles. Redeem your points for discounts on
                future rides, and grow from Seedling to Forest status.
              </p>
              <Button
                variant="ink"
                size="xl"
                className="bg-white text-slate-900 hover:bg-white/90 dark:bg-white"
                onClick={() => router.push("/rewards")}
              >
                Learn More <ArrowRight />
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {REWARD_TIERS.map((tier, i) => (
                <div
                  key={tier.name}
                  className={cn(
                    "rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur",
                    i === 3 && "bg-emerald-400/15"
                  )}
                >
                  <Leaf
                    className="mb-3 size-5 text-emerald-300"
                    style={{ opacity: 0.5 + i * 0.17 }}
                  />
                  <p className="font-display text-lg font-bold">{tier.name}</p>
                  <p className="text-sm text-white/60">
                    {tier.min === 0
                      ? "Start here"
                      : `${tier.min.toLocaleString()}+ pts earned`}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </MaxWidthWrapper>

      {/* Why us */}
      <MaxWidthWrapper className="mt-24 space-y-10">
        <SectionHeading
          eyebrow="Why AutoQuest"
          title="Rentals that respect your time and the planet"
          center
        />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {PERKS.map((perk) => (
            <div key={perk.title} className="rounded-2xl border bg-card p-6">
              <span className="mb-4 inline-flex size-11 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
                <perk.icon className="size-5" />
              </span>
              <h3 className="mb-1.5 font-bold">{perk.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {perk.body}
              </p>
            </div>
          ))}
        </div>
      </MaxWidthWrapper>

      {/* Brands */}
      {brands.length > 0 && (
        <MaxWidthWrapper className="mt-24 text-center">
          <p className="mb-5 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Brands in our fleet
          </p>
          <div className="flex flex-wrap justify-center gap-2.5">
            {brands.map((brand) => (
              <Link
                key={brand}
                href={`/select-vehicle?brands=${encodeURIComponent(brand)}`}
                className="rounded-full border bg-card px-4 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
              >
                {brand}
              </Link>
            ))}
          </div>
        </MaxWidthWrapper>
      )}

      {/* FAQ */}
      <MaxWidthWrapper className="mt-24 grid gap-10 lg:grid-cols-[1fr_1.4fr]">
        <div>
          <SectionHeading
            eyebrow="FAQ"
            title="Questions, answered"
            description={
              <>
                Can&apos;t find what you need?{" "}
                <Link
                  href="/contact"
                  className="font-semibold text-primary hover:underline"
                >
                  Contact us
                </Link>
                .
              </>
            }
          />
        </div>
        <div className="divide-y rounded-2xl border bg-card">
          {FAQS.map((faq) => (
            <details
              key={faq.q}
              className="group p-5 [&_summary::-webkit-details-marker]:hidden"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold">
                {faq.q}
                <ChevronDown className="size-5 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" />
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {faq.a}
              </p>
            </details>
          ))}
        </div>
      </MaxWidthWrapper>
    </div>
  );
};

function SectionHeading({
  eyebrow,
  title,
  description,
  action,
  center,
}: {
  eyebrow: string;
  title: string;
  description?: React.ReactNode;
  action?: React.ReactNode;
  center?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 md:flex-row md:items-end md:justify-between",
        center && "items-center text-center md:flex-col md:items-center"
      )}
    >
      <div className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-wider text-primary">
          {eyebrow}
        </p>
        <h2 className="text-3xl font-bold md:text-4xl">{title}</h2>
        {description && (
          <p className="max-w-xl text-muted-foreground">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}

export default HomePage;
