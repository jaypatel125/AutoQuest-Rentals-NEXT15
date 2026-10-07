"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Car,
  Gift,
  Leaf,
  RotateCcw,
  Sprout,
  TreeDeciduous,
  Trees,
  Trophy,
  Zap,
} from "lucide-react";
import { fetchRewards } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { REWARD_TIERS, tierFor } from "@/lib/rewards";
import { KG_CO2_PER_TREE_YEAR } from "@/lib/green";
import {
  MAX_REDEEMABLE_POINTS,
  POINTS_PER_DOLLAR,
  pointsToDollars,
} from "@/lib/pricing";
import { cn, formatPrice } from "@/lib/utils";

const TIER_ICONS = [Sprout, Leaf, TreeDeciduous, Trees];

function Dashboard() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["rewards"],
    queryFn: fetchRewards,
  });

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-36 animate-pulse rounded-2xl bg-muted" />
        ))}
      </div>
    );
  }
  if (isError || !data) return null;

  const tier = tierFor(data.lifetimeEarned);
  const TierIcon = TIER_ICONS[REWARD_TIERS.indexOf(tier.current)] ?? Sprout;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-[1.3fr_1fr_1fr]">
        <div className="relative overflow-hidden rounded-3xl bg-hero p-6 text-white">
          <div className="bg-grid absolute inset-0 opacity-50 [mask-image:linear-gradient(to_left,black,transparent)]" />
          <div className="relative space-y-4">
            <p className="flex items-center gap-2 text-sm text-white/70">
              <Gift className="size-4" /> Available points
            </p>
            <p className="font-display text-5xl font-extrabold">
              {data.balance.toLocaleString()}
            </p>
            <p className="text-sm text-white/70">
              Worth up to{" "}
              <strong className="text-white">
                {formatPrice(
                  pointsToDollars(Math.min(data.balance, MAX_REDEEMABLE_POINTS))
                )}
              </strong>{" "}
              off your next booking.
            </p>
            <Button
              asChild
              variant="ink"
              className="bg-white text-slate-900 hover:bg-white/90 dark:bg-white"
            >
              <Link href="/select-vehicle?fuelTypes=Electric">
                <Zap /> Earn 2x with an EV
              </Link>
            </Button>
          </div>
        </div>

        <div className="rounded-3xl border bg-card p-6">
          <p className="mb-3 text-sm text-muted-foreground">Your status</p>
          <div className="mb-4 flex items-center gap-3">
            <span className="inline-flex size-12 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
              <TierIcon className="size-6" />
            </span>
            <div>
              <p className="font-display text-2xl font-bold">
                {tier.current.name}
              </p>
              <p className="text-sm text-muted-foreground">
                {tier.current.blurb}
              </p>
            </div>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary"
              style={{ width: `${tier.progress * 100}%` }}
            />
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            {tier.next
              ? `${tier.pointsToNext.toLocaleString()} points to ${tier.next.name}`
              : "You've reached the top tier!"}
          </p>
        </div>

        <div className="rounded-3xl border bg-card p-6">
          <p className="mb-3 text-sm text-muted-foreground">
            Your green impact
          </p>
          <p className="font-display text-4xl font-bold text-primary">
            {data.co2SavedKg.toLocaleString()}{" "}
            <span className="text-lg">kg CO₂</span>
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            avoided vs. a typical gas car, about{" "}
            {(data.co2SavedKg / KG_CO2_PER_TREE_YEAR).toFixed(1)} tree-years of
            absorption.
          </p>
          <div className="mt-4 flex gap-6 text-sm">
            <div>
              <p className="font-bold">{data.trips}</p>
              <p className="text-muted-foreground">Trips</p>
            </div>
            <div>
              <p className="font-bold">{data.greenTrips}</p>
              <p className="text-muted-foreground">EV / hybrid</p>
            </div>
            <div>
              <p className="font-bold">
                {data.lifetimeEarned.toLocaleString()}
              </p>
              <p className="text-muted-foreground">Lifetime pts</p>
            </div>
          </div>
        </div>
      </div>

      <section className="rounded-3xl border bg-card">
        <div className="flex items-center justify-between border-b p-5">
          <h2 className="font-bold">Points history</h2>
          <span className="text-sm text-muted-foreground">
            {data.totalRedeemed.toLocaleString()} pts redeemed all-time
          </span>
        </div>
        {data.history.length === 0 ? (
          <p className="p-8 text-center text-sm text-muted-foreground">
            No points yet. Book your first trip to start earning.
          </p>
        ) : (
          <ul className="divide-y">
            {data.history.map((item) => {
              const positive =
                item.type === "Earned" ||
                (item.type === "Adjusted" && item.points > 0);
              const Icon =
                item.type === "Earned"
                  ? ArrowUpRight
                  : item.type === "Redeemed"
                    ? ArrowDownLeft
                    : RotateCcw;
              const amount =
                item.type === "Redeemed" ? -Math.abs(item.points) : item.points;
              return (
                <li
                  key={item.id}
                  className="flex items-center gap-4 px-5 py-3.5"
                >
                  <span
                    className={cn(
                      "inline-flex size-9 shrink-0 items-center justify-center rounded-xl",
                      positive
                        ? "bg-accent text-accent-foreground"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    <Icon className="size-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">
                      {item.type === "Earned"
                        ? `Earned${item.electric ? " (2x EV)" : ""}`
                        : item.type === "Redeemed"
                          ? "Redeemed at checkout"
                          : item.points > 0
                            ? "Returned after cancellation"
                            : "Removed after cancellation"}
                    </p>
                    <p className="flex items-center gap-1 truncate text-sm text-muted-foreground">
                      {item.vehicle && (
                        <>
                          <Car className="size-3.5" />
                          {item.bookingId ? (
                            <Link
                              href={`/bookings/${item.bookingId}`}
                              className="hover:underline"
                            >
                              {item.vehicle}
                            </Link>
                          ) : (
                            item.vehicle
                          )}
                          {" · "}
                        </>
                      )}
                      {format(new Date(item.createdAt), "MMM d, yyyy")}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "font-semibold tabular-nums",
                      amount > 0 ? "text-primary" : "text-muted-foreground"
                    )}
                  >
                    {amount > 0 ? "+" : ""}
                    {amount.toLocaleString()}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}

const RewardsPage = ({ signedIn = false }: { signedIn?: boolean }) => {
  return (
    <div className="space-y-12">
      {signedIn ? (
        <Dashboard />
      ) : (
        <div className="flex flex-col items-start justify-between gap-4 rounded-3xl border bg-accent/50 p-6 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-xl font-bold">Start earning today</h2>
            <p className="text-muted-foreground">
              Create a free account and earn points on your very first rental.
            </p>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="outline">
              <Link href="/signin?next=/rewards">Sign in</Link>
            </Button>
            <Button asChild>
              <Link href="/signup">Create account</Link>
            </Button>
          </div>
        </div>
      )}

      <section className="grid gap-5 md:grid-cols-3">
        {[
          {
            icon: Gift,
            title: "Earn Points",
            body: "Earn 1 point per dollar on every rental, and 2x points on every EV rental.",
          },
          {
            icon: Trophy,
            title: "Redeem Rewards",
            body: `Every ${POINTS_PER_DOLLAR} points take $1 off at checkout, up to ${MAX_REDEEMABLE_POINTS.toLocaleString()} points per booking.`,
          },
          {
            icon: Leaf,
            title: "Drive Sustainably",
            body: "Track the CO₂ you avoid by choosing electric and hybrid vehicles.",
          },
        ].map(({ icon: Icon, title, body }) => (
          <div key={title} className="rounded-2xl border bg-card p-6">
            <span className="mb-4 inline-flex size-11 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
              <Icon className="size-5" />
            </span>
            <h3 className="mb-1.5 text-lg font-bold">{title}</h3>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {body}
            </p>
          </div>
        ))}
      </section>

      <section className="space-y-5">
        <h2 className="text-2xl font-bold">Status levels</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {REWARD_TIERS.map((tier, i) => {
            const Icon = TIER_ICONS[i];
            return (
              <div key={tier.name} className="rounded-2xl border bg-card p-5">
                <Icon className="mb-3 size-6 text-primary" />
                <p className="font-display text-lg font-bold">{tier.name}</p>
                <p className="text-sm text-muted-foreground">
                  {tier.min === 0
                    ? "Everyone starts here"
                    : `${tier.min.toLocaleString()} lifetime points`}
                </p>
                <p className="mt-2 text-sm">{tier.blurb}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="grid gap-8 md:grid-cols-2">
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">How It Works</h2>
          <ol className="space-y-3">
            {[
              "Sign up or log in to your account.",
              "Book any vehicle. Electric vehicles earn double points.",
              "Points are added to your balance as soon as your booking is confirmed.",
              "Track your points and history right here.",
              "Turn on “Use reward points” at checkout to get a discount.",
            ].map((step, i) => (
              <li key={step} className="flex gap-3">
                <span className="inline-flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  {i + 1}
                </span>
                <span className="pt-0.5 text-muted-foreground">{step}</span>
              </li>
            ))}
          </ol>
        </div>
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Terms & Conditions</h2>
          <ul className="list-disc space-y-2 pl-5 text-muted-foreground">
            <li>
              Points earned on a booking are removed if that booking is
              cancelled.
            </li>
            <li>
              Points redeemed on a cancelled booking are returned to your
              balance.
            </li>
            <li>
              Rewards are non-transferable and cannot be exchanged for cash.
            </li>
            <li>
              The company reserves the right to modify or terminate the rewards
              program at any time.
            </li>
            <li>
              Misuse of the rewards system may result in account suspension.
            </li>
          </ul>
        </div>
      </section>
    </div>
  );
};

export default RewardsPage;
