"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
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

function Dashboard() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["rewards"],
    queryFn: fetchRewards,
  });

  if (isLoading) {
    return (
      <div className="grid gap-px overflow-hidden rounded-lg border bg-border md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-40 animate-pulse bg-muted" />
        ))}
      </div>
    );
  }
  if (isError || !data) return null;

  const tier = tierFor(data.lifetimeEarned);

  return (
    <div className="space-y-16">
      <div className="grid gap-px overflow-hidden rounded-lg border bg-border md:grid-cols-3">
        <div className="space-y-3 bg-background p-6">
          <p className="text-sm text-muted-foreground">Available points</p>
          <p className="text-4xl font-medium tabular-nums">
            {data.balance.toLocaleString()}
          </p>
          <p className="text-sm text-muted-foreground">
            Worth up to{" "}
            <span className="text-foreground">
              {formatPrice(
                pointsToDollars(Math.min(data.balance, MAX_REDEEMABLE_POINTS))
              )}
            </span>{" "}
            off your next booking.
          </p>
          <Link
            href="/select-vehicle?fuelTypes=Electric"
            className="inline-block pt-1 text-sm underline decoration-border underline-offset-4 hover:decoration-foreground"
          >
            Earn 2x with an EV
          </Link>
        </div>

        <div className="space-y-3 bg-background p-6">
          <p className="text-sm text-muted-foreground">Your status</p>
          <p className="text-4xl font-medium">{tier.current.name}</p>
          <p className="text-sm text-muted-foreground">{tier.current.blurb}</p>
          <div className="h-1 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-foreground"
              style={{ width: `${tier.progress * 100}%` }}
            />
          </div>
          <p className="text-sm text-muted-foreground">
            {tier.next
              ? `${tier.pointsToNext.toLocaleString()} points to ${tier.next.name}`
              : "You've reached the top tier!"}
          </p>
        </div>

        <div className="space-y-3 bg-background p-6">
          <p className="text-sm text-muted-foreground">CO₂ avoided</p>
          <p className="text-4xl font-medium tabular-nums">
            {data.co2SavedKg.toLocaleString()}
            <span className="text-base text-muted-foreground"> kg</span>
          </p>
          <p className="text-sm text-muted-foreground">
            Compared with a typical gas car, about{" "}
            {(data.co2SavedKg / KG_CO2_PER_TREE_YEAR).toFixed(1)} tree-years of
            absorption.
          </p>
          <dl className="flex gap-6 pt-1 text-sm">
            <div>
              <dd className="tabular-nums">{data.trips}</dd>
              <dt className="text-muted-foreground">Trips</dt>
            </div>
            <div>
              <dd className="tabular-nums">{data.greenTrips}</dd>
              <dt className="text-muted-foreground">EV / hybrid</dt>
            </div>
            <div>
              <dd className="tabular-nums">
                {data.lifetimeEarned.toLocaleString()}
              </dd>
              <dt className="text-muted-foreground">Lifetime pts</dt>
            </div>
          </dl>
        </div>
      </div>

      <section>
        <div className="flex items-baseline justify-between border-b pb-4">
          <h2 className="font-medium">Points history</h2>
          <span className="text-sm text-muted-foreground">
            {data.totalRedeemed.toLocaleString()} pts redeemed all-time
          </span>
        </div>
        {data.history.length === 0 ? (
          <p className="py-10 text-sm text-muted-foreground">
            No points yet. Book your first trip to start earning.
          </p>
        ) : (
          <ul className="divide-y">
            {data.history.map((item) => {
              const amount =
                item.type === "Redeemed" ? -Math.abs(item.points) : item.points;
              return (
                <li key={item.id} className="flex items-center gap-4 py-4">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm">
                      {item.type === "Earned"
                        ? `Earned${item.electric ? " (2x EV)" : ""}`
                        : item.type === "Redeemed"
                          ? "Redeemed at checkout"
                          : item.points > 0
                            ? "Returned after cancellation"
                            : "Removed after cancellation"}
                    </p>
                    <p className="truncate text-sm text-muted-foreground">
                      {item.vehicle && (
                        <>
                          {item.bookingId ? (
                            <Link
                              href={`/bookings/${item.bookingId}`}
                              className="hover:text-foreground"
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
                      "text-sm tabular-nums",
                      amount <= 0 && "text-muted-foreground"
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
    <div className="space-y-20">
      {signedIn ? (
        <Dashboard />
      ) : (
        <div className="flex flex-col items-start justify-between gap-6 border-y py-8 sm:flex-row sm:items-center">
          <div>
            <h2 className="font-medium">Start earning today</h2>
            <p className="mt-1 text-sm text-muted-foreground">
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

      <section className="grid gap-10 md:grid-cols-3">
        {[
          {
            title: "Earn Points",
            body: "Earn 1 point per dollar on every rental, and 2x points on every EV rental.",
          },
          {
            title: "Redeem Rewards",
            body: `Every ${POINTS_PER_DOLLAR} points take $1 off at checkout, up to ${MAX_REDEEMABLE_POINTS.toLocaleString()} points per booking.`,
          },
          {
            title: "Drive Sustainably",
            body: "Track the CO₂ you avoid by choosing electric and hybrid vehicles.",
          },
        ].map(({ title, body }, i) => (
          <div key={title} className="border-t pt-5">
            <p className="text-sm text-muted-foreground tabular-nums">
              0{i + 1}
            </p>
            <h3 className="mt-3 font-medium">{title}</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
              {body}
            </p>
          </div>
        ))}
      </section>

      <section className="space-y-6">
        <h2 className="text-2xl font-semibold">Status levels</h2>
        <div className="grid gap-px overflow-hidden rounded-lg border bg-border sm:grid-cols-2 lg:grid-cols-4">
          {REWARD_TIERS.map((tier) => (
            <div key={tier.name} className="bg-background p-5">
              <p className="font-medium">{tier.name}</p>
              <p className="text-sm text-muted-foreground">
                {tier.min === 0
                  ? "Everyone starts here"
                  : `${tier.min.toLocaleString()} lifetime points`}
              </p>
              <p className="mt-3 text-sm">{tier.blurb}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-12 md:grid-cols-2">
        <div className="space-y-5">
          <h2 className="text-2xl font-semibold">How It Works</h2>
          <ol className="space-y-3 text-sm">
            {[
              "Sign up or log in to your account.",
              "Book any vehicle. Electric vehicles earn double points.",
              "Points are added to your balance as soon as your booking is confirmed.",
              "Track your points and history right here.",
              "Turn on “Use reward points” at checkout to get a discount.",
            ].map((step, i) => (
              <li key={step} className="flex gap-4">
                <span className="w-5 shrink-0 text-muted-foreground tabular-nums">
                  {i + 1}.
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </div>
        <div className="space-y-5">
          <h2 className="text-2xl font-semibold">Terms & Conditions</h2>
          <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
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
