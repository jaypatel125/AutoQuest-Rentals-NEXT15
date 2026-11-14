"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  BadgeCheck,
  CalendarX2,
  ChevronDown,
  Gift,
  Leaf,
  ReceiptText,
  Search,
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
import { VehicleImage } from "@/components/vehicles/VehicleImage";
import {
  VehicleCard,
  VehicleCardSkeleton,
} from "@/components/vehicles/VehicleCard";
import { FuelBadge, GreenScoreBadge } from "@/components/vehicles/badges";
import { bodyTypeLabel } from "@/lib/vehicles";
import { REWARD_TIERS } from "@/lib/rewards";
import { cn, formatPrice } from "@/lib/utils";
import {
  ReviewerDemoCard,
  type ReviewerDemoCredentials,
} from "@/components/common/auth/ReviewerDemo";

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

const STEPS = [
  {
    icon: Search,
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
      <p className="font-display text-3xl font-bold tracking-tight">
        {value === undefined ? (
          <span className="inline-block h-8 w-12 animate-pulse rounded-lg bg-muted align-middle" />
        ) : (
          value.toLocaleString()
        )}
      </p>
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  );
}

const HomePage = ({
  reviewerDemo = null,
}: {
  reviewerDemo?: ReviewerDemoCredentials | null;
}) => {
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

  const heroCar = featured?.[0];
  const heroCar2 = featured?.[1];

  return (
    <div className="pb-24">
      {/* Hero */}
      <section className="bg-hero">
        <MaxWidthWrapper className="pt-12 pb-12 md:pt-16 md:pb-16">
          <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_1fr]">
            <div className="animate-fade-up space-y-6">
              <span className="inline-flex items-center gap-2 rounded-full bg-amber-soft px-3 py-1.5 text-sm font-semibold text-amber-900 dark:text-amber-100">
                <Sparkles className="size-4" />
                Earn 2x points on every electric rental
              </span>
              <h1 className="font-display text-4xl leading-[1.05] font-extrabold sm:text-5xl lg:text-[3.6rem]">
                Find, book, and{" "}
                <span className="text-primary">drive green.</span>
              </h1>
              <p className="max-w-xl text-lg text-muted-foreground">
                Electric, hybrid, and gas cars across Canada. See every
                trip&apos;s carbon footprint and the full price upfront, then
                earn rewards for choosing cleaner.
              </p>
              <div className="flex gap-8 pt-2">
                <Stat value={stats?.vehicles} label="Cars ready" />
                <Stat value={stats?.low_emission} label="Electric & hybrid" />
                <Stat value={stats?.cities} label="Cities" />
              </div>
            </div>

            <div className="relative hidden lg:block" aria-hidden>
              <div className="relative ml-auto w-[88%] overflow-hidden rounded-3xl border bg-card shadow-float">
                {heroCar ? (
                  <>
                    <VehicleImage
                      src={heroCar.image}
                      brand={heroCar.brand}
                      model={heroCar.model}
                      bodyType={heroCar.body_type}
                      priority
                      sizes="40vw"
                    />
                    <div className="flex items-center justify-between gap-3 p-4">
                      <div>
                        <p className="font-display font-bold">
                          {heroCar.brand} {heroCar.model}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {heroCar.branch_city} · from{" "}
                          {formatPrice(Number(heroCar.price_per_day))}/day
                        </p>
                      </div>
                      <div className="flex gap-1.5">
                        <FuelBadge fuelType={heroCar.fuel_type} />
                        <GreenScoreBadge emissions={heroCar.carbon_emissions} />
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="aspect-[4/3] animate-pulse bg-muted" />
                )}
              </div>
              {heroCar2 && (
                <div className="animate-float absolute -bottom-6 left-0 w-[46%] overflow-hidden rounded-2xl border bg-card shadow-card-hover">
                  <VehicleImage
                    src={heroCar2.image}
                    brand={heroCar2.brand}
                    model={heroCar2.model}
                    bodyType={heroCar2.body_type}
                    sizes="20vw"
                  />
                  <div className="p-3">
                    <p className="truncate text-sm font-semibold">
                      {heroCar2.brand} {heroCar2.model}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatPrice(Number(heroCar2.price_per_day))}/day
                    </p>
                  </div>
                </div>
              )}
              <div className="absolute -top-4 right-4 flex items-center gap-2 rounded-2xl border bg-card px-3.5 py-2.5 shadow-card">
                <span className="inline-flex size-8 items-center justify-center rounded-xl bg-amber-soft text-amber-800 dark:text-amber-200">
                  <Gift className="size-4" />
                </span>
                <div>
                  <p className="text-xs text-muted-foreground">
                    This trip earns
                  </p>
                  <p className="font-display text-sm font-bold">+2x points</p>
                </div>
              </div>
            </div>
          </div>

          <div className="relative z-10 mt-10 lg:mt-14">
            <SearchBar />
          </div>
        </MaxWidthWrapper>
      </section>

      {/* Perks strip */}
      <MaxWidthWrapper className="mt-12">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {PERKS.map((perk) => (
            <div
              key={perk.title}
              className="flex gap-3 rounded-2xl border bg-card p-4 shadow-card"
            >
              <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                <perk.icon className="size-5" />
              </span>
              <div>
                <h3 className="text-sm font-bold">{perk.title}</h3>
                <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                  {perk.body}
                </p>
              </div>
            </div>
          ))}
        </div>
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
                className="group rounded-2xl border bg-card p-3 text-center shadow-card transition-all hover:-translate-y-0.5 hover:shadow-card-hover"
              >
                <div className="rounded-xl bg-studio px-2 pt-3 pb-1">
                  <CarIllustration
                    bodyType={type}
                    seed={type}
                    className="transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <p className="mt-2 text-sm font-semibold">
                  {bodyTypeLabel(type)}
                </p>
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
      <MaxWidthWrapper className="mt-20 space-y-8">
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

      {/* Why electric */}
      <MaxWidthWrapper className="mt-20">
        <div className="relative overflow-hidden rounded-3xl bg-forest p-8 text-white shadow-float md:p-12">
          <div className="grid gap-10 lg:grid-cols-[1.2fr_1fr] lg:items-center">
            <div className="space-y-5">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-sm font-medium text-white/90 ring-1 ring-white/15">
                <Zap className="size-4 text-amber" /> Go electric
              </span>
              <h2 className="font-display text-3xl font-bold md:text-4xl">
                Zero tailpipe emissions, double the rewards
              </h2>
              <p className="max-w-lg text-white/75">
                Our electric fleet scores A+ on every trip. Rent one and
                you&apos;ll earn 2x points, see exactly how much CO₂ you avoid,
                and skip the gas station entirely.
              </p>
              <Button asChild variant="amber" size="lg">
                <Link href="/select-vehicle?fuelTypes=Electric">
                  Browse electric cars <ArrowRight />
                </Link>
              </Button>
            </div>
            <dl className="grid grid-cols-3 gap-3 lg:grid-cols-1">
              {[
                ["A+", "Green Score on every EV"],
                ["2x", "reward points per dollar"],
                ["0 g", "CO₂ per kilometre"],
              ].map(([value, label]) => (
                <div
                  key={label}
                  className="rounded-2xl bg-white/10 p-4 ring-1 ring-white/10 backdrop-blur"
                >
                  <dt className="font-display text-3xl font-extrabold">
                    {value}
                  </dt>
                  <dd className="text-sm text-white/70">{label}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </MaxWidthWrapper>

      {/* How it works */}
      <MaxWidthWrapper className="mt-20">
        <SectionHeading
          eyebrow="How it works"
          title="On the road in three steps"
          center
        />
        <ol className="mt-10 grid gap-5 md:grid-cols-3">
          {STEPS.map((step, i) => (
            <li
              key={step.title}
              className="relative rounded-2xl border bg-card p-6 shadow-card"
            >
              <div className="mb-4 flex items-center justify-between">
                <span className="inline-flex size-11 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
                  <step.icon className="size-5" />
                </span>
                <span className="font-display text-sm font-bold text-muted-foreground">
                  0{i + 1}
                </span>
              </div>
              <h3 className="font-display text-lg font-bold">{step.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                {step.body}
              </p>
            </li>
          ))}
        </ol>
      </MaxWidthWrapper>

      {/* Rewards */}
      <MaxWidthWrapper className="mt-20">
        <div className="grid gap-8 rounded-3xl border bg-card p-8 shadow-card md:grid-cols-[1.2fr_1fr] md:items-center md:p-12">
          <div className="space-y-5">
            <span className="inline-flex items-center gap-2 rounded-full bg-amber-soft px-3 py-1 text-sm font-semibold text-amber-900 dark:text-amber-100">
              <Gift className="size-4" /> AutoQuest Rewards
            </span>
            <h2 className="font-display text-3xl font-bold md:text-4xl">
              Earn rewards for going green
            </h2>
            <p className="max-w-lg text-muted-foreground">
              Earn <strong className="text-foreground">2x points</strong> when
              renting electric vehicles. Redeem your points for discounts on
              future rides, and grow from Seedling to Forest status.
            </p>
            <Button size="lg" onClick={() => router.push("/rewards")}>
              Learn More <ArrowRight />
            </Button>
          </div>
          <ol className="grid grid-cols-2 gap-3">
            {REWARD_TIERS.map((tier, i) => (
              <li
                key={tier.name}
                className={cn(
                  "rounded-2xl border p-4",
                  i === 3 ? "bg-accent" : "bg-secondary/60"
                )}
              >
                <Leaf
                  className="mb-3 size-5 text-primary"
                  style={{ opacity: 0.45 + i * 0.18 }}
                />
                <p className="font-display font-bold">{tier.name}</p>
                <p className="text-sm text-muted-foreground">
                  {tier.min === 0
                    ? "Start here"
                    : `${tier.min.toLocaleString()}+ pts earned`}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </MaxWidthWrapper>

      {/* Admin demo */}
      {reviewerDemo && (
        <MaxWidthWrapper className="mt-20">
          <div className="grid items-center gap-8 rounded-3xl border bg-card p-8 shadow-card md:grid-cols-[1.1fr_1fr] md:p-12">
            <div className="space-y-4">
              <p className="text-sm font-semibold tracking-wider text-primary uppercase">
                For reviewers
              </p>
              <h2 className="font-display text-3xl font-bold md:text-4xl">
                See how the admin side works
              </h2>
              <p className="max-w-lg text-muted-foreground">
                Sign in with the shared reviewer account to explore the
                dashboard, bookings, fleet, branches and customer pages. Nothing
                can be changed, and customer details are partly hidden.
              </p>
            </div>
            <ReviewerDemoCard credentials={reviewerDemo} />
          </div>
        </MaxWidthWrapper>
      )}

      {/* Brands */}
      {brands.length > 0 && (
        <MaxWidthWrapper className="mt-20 text-center">
          <p className="mb-5 text-sm font-semibold tracking-wider text-muted-foreground uppercase">
            Brands in our fleet
          </p>
          <div className="flex flex-wrap justify-center gap-2.5">
            {brands.map((brand) => (
              <Link
                key={brand}
                href={`/select-vehicle?brands=${encodeURIComponent(brand)}`}
                className="rounded-full border bg-card px-4 py-2 text-sm font-semibold text-muted-foreground shadow-xs transition-colors hover:border-primary/40 hover:text-foreground"
              >
                {brand}
              </Link>
            ))}
          </div>
        </MaxWidthWrapper>
      )}

      {/* FAQ */}
      <MaxWidthWrapper className="mt-20 grid gap-10 lg:grid-cols-[1fr_1.4fr]">
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
        <div className="divide-y rounded-2xl border bg-card shadow-card">
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
        <p className="text-sm font-semibold tracking-wider text-primary uppercase">
          {eyebrow}
        </p>
        <h2 className="font-display text-3xl font-bold md:text-4xl">{title}</h2>
        {description && (
          <p className="max-w-xl text-muted-foreground">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}

export default HomePage;
