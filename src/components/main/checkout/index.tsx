"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { CalendarDays, CarFront, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { handleCheckout } from "@/app/(main)/checkout/actions";
import { fetchRewards } from "@/app/actions";
import { IUser } from "../../../../auth-client";
import { cn, formatPrice } from "@/lib/utils";
import { toDate, useSearchStore } from "@/context/searchStore";
import {
  buildQuote,
  isElectric,
  MAX_REDEEMABLE_POINTS,
  POINTS_PER_DOLLAR,
  TAX_RATE,
} from "@/lib/pricing";
import { VehicleImage } from "@/components/vehicles/VehicleImage";
import { greenScore } from "@/lib/green";
import type { VehicleDetail } from "@/components/main/select-vehicle-details";
import { EmptyState } from "@/components/utility/EmptyState";
import { useToast } from "@/hooks/use-toast";

const STEPS = ["Search", "Choose", "Checkout", "Confirmed"];

function Steps({ current }: { current: number }) {
  return (
    <ol
      className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm"
      aria-label="Booking progress"
    >
      {STEPS.map((step, i) => (
        <li
          key={step}
          className={cn(
            "flex items-center gap-3",
            i === current ? "text-foreground" : "text-muted-foreground"
          )}
          aria-current={i === current ? "step" : undefined}
        >
          {step}
          {i < STEPS.length - 1 && (
            <span aria-hidden className="text-border">
              /
            </span>
          )}
        </li>
      ))}
    </ol>
  );
}

async function fetchVehicle(id: string): Promise<VehicleDetail> {
  const res = await fetch(`/api/vehicles/${id}`);
  if (!res.ok) throw new Error("Vehicle not found");
  return res.json();
}

export default function Checkout({ user }: { user: IUser }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { startDate, endDate, selectedCar, redeemPoints, setRedeemPoints } =
    useSearchStore();
  const [agreed, setAgreed] = useState(false);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { data: car } = useQuery({
    queryKey: ["vehicle", selectedCar?.id],
    queryFn: () => fetchVehicle(selectedCar!.id),
    enabled: !!selectedCar?.id,
  });
  const { data: rewards } = useQuery({
    queryKey: ["rewards"],
    queryFn: fetchRewards,
    enabled: !!user,
  });

  if (!selectedCar) {
    return (
      <EmptyState
        icon={CarFront}
        title="No car selected"
        description="No car selected. Please go back and choose a vehicle."
        action={
          <Button asChild>
            <Link href="/select-vehicle">Browse cars</Link>
          </Button>
        }
      />
    );
  }

  if (!user) {
    return (
      <EmptyState
        icon={UserRound}
        title="Sign in to continue"
        description="You must be logged in to proceed to checkout."
        action={
          <Button asChild>
            <Link href="/signin?next=/checkout">Sign in</Link>
          </Button>
        }
      />
    );
  }

  const start = toDate(startDate);
  const end = toDate(endDate);
  if (!start || !end) {
    return (
      <EmptyState
        icon={CalendarDays}
        title="Choose your dates"
        description="Please select valid rental dates to proceed."
        action={
          <Button asChild>
            <Link href={`/select-vehicle/${selectedCar.id}`}>Pick dates</Link>
          </Button>
        }
      />
    );
  }

  const vehicle = car ?? (selectedCar as VehicleDetail);
  const balance = rewards?.balance ?? user.reward_points ?? 0;
  const quote = buildQuote({
    pricePerDay: vehicle.price_per_day,
    start,
    end,
    fuelType: vehicle.fuel_type,
    availablePoints: balance,
    redeemPoints,
  });
  const potentialRedeem = buildQuote({
    pricePerDay: vehicle.price_per_day,
    start,
    end,
    availablePoints: balance,
  }).pointsRedeemed;
  const ev = isElectric(vehicle.fuel_type);

  const onPayNow = async () => {
    setError(null);
    setPaying(true);
    try {
      const data = await handleCheckout({
        carId: vehicle.id,
        startDate: start,
        endDate: end,
        redeemPoints,
      });
      router.push(data.url);
    } catch (err) {
      const message = (err as Error).message;
      setError(message);
      toast({
        title: "Checkout failed",
        description: message,
        variant: "destructive",
      });
      setPaying(false);
    }
  };

  return (
    <div className="space-y-10">
      <Steps current={2} />

      {searchParams?.get("cancelled") && (
        <p className="border-l-2 border-foreground pl-4 text-sm">
          Payment was cancelled and your card was not charged. You can try again
          below.
        </p>
      )}

      <div className="grid gap-12 lg:grid-cols-[1.5fr_1fr] lg:gap-16">
        <div className="divide-y">
          <section className="grid gap-6 pb-10 sm:grid-cols-[200px_1fr]">
            <VehicleImage
              src={vehicle.image}
              brand={vehicle.brand}
              model={vehicle.model}
              bodyType={vehicle.body_type}
              className="rounded-md"
            />
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-medium">
                  {vehicle.brand} {vehicle.model}
                </h2>
                <p className="text-sm text-muted-foreground">
                  <span className={ev ? "text-eco" : undefined}>
                    {vehicle.fuel_type}
                  </span>{" "}
                  · Green {greenScore(vehicle.carbon_emissions).grade}
                </p>
              </div>
              <dl className="grid gap-4 text-sm sm:grid-cols-2">
                <div>
                  <dt className="text-muted-foreground">Dates</dt>
                  <dd className="mt-1">
                    {format(start, "EEE, MMM d")} to {format(end, "EEE, MMM d")}
                  </dd>
                  <dd className="text-muted-foreground">
                    {quote.days} day{quote.days === 1 ? "" : "s"} ·{" "}
                    <Link
                      href={`/select-vehicle/${vehicle.id}`}
                      className="text-foreground underline decoration-border underline-offset-4 hover:decoration-foreground"
                    >
                      Change
                    </Link>
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Pick-up</dt>
                  <dd className="mt-1">
                    {vehicle.branch_name || "Pick-up branch"}
                  </dd>
                  <dd className="text-muted-foreground">
                    {[
                      vehicle.branch_address,
                      vehicle.branch_city,
                      vehicle.branch_province,
                    ]
                      .filter(Boolean)
                      .join(", ")}
                  </dd>
                </div>
              </dl>
            </div>
          </section>

          <section className="space-y-4 py-10">
            <h3 className="font-medium">Renter Information</h3>
            <dl className="grid gap-4 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-muted-foreground">Full name</dt>
                <dd className="mt-1">{user.name}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Email</dt>
                <dd className="mt-1">{user.email}</dd>
              </div>
            </dl>
            <p className="text-sm text-muted-foreground">
              Bring your driver&apos;s licence and a photo ID to pick-up.
              Details come from your{" "}
              <Link
                href="/account"
                className="text-foreground underline decoration-border underline-offset-4 hover:decoration-foreground"
              >
                account
              </Link>
              .
            </p>
          </section>

          <section className="py-10">
            <div className="flex items-start justify-between gap-6">
              <div>
                <h3 className="font-medium">Use reward points</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  You have{" "}
                  <span className="text-foreground tabular-nums">
                    {balance.toLocaleString()} pts
                  </span>
                  . {POINTS_PER_DOLLAR} points = $1, up to{" "}
                  {MAX_REDEEMABLE_POINTS.toLocaleString()} per booking.
                </p>
                {potentialRedeem > 0 && (
                  <p className="mt-2 text-sm">
                    {redeemPoints
                      ? `Using ${quote.pointsRedeemed.toLocaleString()} points saves you ${formatPrice(quote.discount)}.`
                      : `Turn on to save ${formatPrice(potentialRedeem / POINTS_PER_DOLLAR)}.`}
                  </p>
                )}
              </div>
              <Switch
                checked={redeemPoints && potentialRedeem > 0}
                disabled={potentialRedeem === 0}
                onCheckedChange={setRedeemPoints}
                aria-label="Use reward points"
              />
            </div>
          </section>

          <section className="space-y-4 pt-10">
            <h3 className="font-medium">Terms & Conditions</h3>
            <ul className="grid gap-1 text-sm text-muted-foreground sm:grid-cols-2">
              <li>Minimum age requirement: 21</li>
              <li>{ev ? "Charge" : "Fuel"} policy: same-to-same</li>
              <li>Basic insurance coverage included</li>
              <li>Late return charges apply</li>
            </ul>
            <label className="flex cursor-pointer items-start gap-3 pt-2 text-sm">
              <Checkbox
                checked={agreed}
                onCheckedChange={(v) => setAgreed(v === true)}
                aria-label="I agree to the rental terms"
                className="mt-0.5"
              />
              <span>
                I agree to the{" "}
                <Link
                  href="/terms"
                  target="_blank"
                  className="underline decoration-border underline-offset-4 hover:decoration-foreground"
                >
                  rental terms
                </Link>{" "}
                and cancellation policy (free cancellation up to 24 hours before
                pick-up).
              </span>
            </label>
          </section>
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="space-y-5 rounded-lg border p-6">
            <h3 className="font-medium">Trip Cost</h3>
            <div className="space-y-2 text-sm">
              <Line
                label={`Rental Charge (${quote.days} x ${formatPrice(quote.dailyRate)})`}
                value={formatPrice(quote.rentalCharge)}
              />
              <Line
                label="Service Charge"
                value={formatPrice(quote.serviceFee)}
              />
              <Line
                label={`HST (${Math.round(TAX_RATE * 100)}%)`}
                value={formatPrice(quote.tax)}
              />
              {quote.discount > 0 && (
                <Line
                  label={`Rewards (${quote.pointsRedeemed.toLocaleString()} pts)`}
                  value={`-${formatPrice(quote.discount)}`}
                />
              )}
            </div>
            <div className="flex items-baseline justify-between border-t pt-4">
              <span className="text-sm">Amount Due</span>
              <span className="text-2xl font-medium tabular-nums">
                {formatPrice(quote.total)}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              You&apos;ll earn +{quote.pointsToEarn.toLocaleString()} pts
              {ev ? " (2x EV bonus)" : ""}
            </p>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <Button
              size="lg"
              className="w-full"
              onClick={onPayNow}
              disabled={!agreed}
              loading={paying}
            >
              {paying
                ? "Redirecting to payment..."
                : `Pay Now ${formatPrice(quote.total)}`}
            </Button>
            <p className="text-center text-xs text-muted-foreground">
              {agreed
                ? "Secure payment with Stripe"
                : "Accept the rental terms to continue."}
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Line({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 text-muted-foreground">
      <span>{label}</span>
      <span className="text-foreground tabular-nums">{value}</span>
    </div>
  );
}
