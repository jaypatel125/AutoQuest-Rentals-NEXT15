"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  CalendarDays,
  CarFront,
  Check,
  CircleAlert,
  Copy,
  FlaskConical,
  Gift,
  Info,
  Lock,
  MapPin,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
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
import { FuelBadge, GreenScoreBadge } from "@/components/vehicles/badges";
import type { VehicleDetail } from "@/components/main/select-vehicle-details";
import { EmptyState } from "@/components/utility/EmptyState";
import { useToast } from "@/hooks/use-toast";

const STEPS = ["Search", "Choose", "Checkout", "Confirmed"];

/** Stripe's standard test card; it never charges anything. */
const TEST_CARD = {
  number: "4242 4242 4242 4242",
  expiry: "12/34",
  cvc: "123",
  postal: "M5V 3L9",
};

function Steps({ current }: { current: number }) {
  return (
    <ol
      className="flex items-center gap-2 text-sm"
      aria-label="Booking progress"
    >
      {STEPS.map((step, i) => (
        <li key={step} className="flex items-center gap-2">
          <span
            className={cn(
              "inline-flex size-6 items-center justify-center rounded-full text-xs font-bold",
              i < current && "bg-accent text-accent-foreground",
              i === current && "bg-primary text-primary-foreground",
              i > current && "bg-secondary text-muted-foreground"
            )}
          >
            {i < current ? <Check className="size-3.5" /> : i + 1}
          </span>
          <span
            className={cn(
              "hidden sm:inline",
              i === current ? "font-semibold" : "text-muted-foreground"
            )}
          >
            {step}
          </span>
          {i < STEPS.length - 1 && (
            <span className="h-px w-6 bg-border sm:w-10" />
          )}
        </li>
      ))}
    </ol>
  );
}

function TestCardHelper() {
  const { toast } = useToast();
  const [copied, setCopied] = useState<string | null>(null);

  const copy = async (label: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value.replace(/\s/g, ""));
      setCopied(label);
      toast({ title: `${label} copied` });
      setTimeout(() => setCopied(null), 1500);
    } catch {
      toast({ title: "Copy failed", description: value });
    }
  };

  const rows = [
    ["Card number", TEST_CARD.number],
    ["Expiry", TEST_CARD.expiry],
    ["CVC", TEST_CARD.cvc],
    ["Postal code", TEST_CARD.postal],
  ];

  return (
    <div
      className="rounded-2xl border border-dashed border-amber/70 bg-amber-soft/70 p-4 text-sm dark:bg-amber-soft/40"
      data-testid="test-card-helper"
    >
      <p className="flex items-center gap-2 font-semibold">
        <FlaskConical className="size-4 text-amber-800 dark:text-amber-200" />
        Test mode: no real charge
      </p>
      <p className="mt-1 text-xs text-muted-foreground">
        Use this card on the Stripe page that opens next. Any name works.
      </p>
      <dl className="mt-3 grid gap-1.5">
        {rows.map(([label, value]) => (
          <div
            key={label}
            className="flex items-center justify-between gap-3 rounded-lg bg-card/70 px-2.5 py-1.5"
          >
            <dt className="text-xs text-muted-foreground">{label}</dt>
            <dd className="flex items-center gap-1.5">
              <code className="font-mono text-[13px] font-semibold">
                {value}
              </code>
              <button
                type="button"
                onClick={() => copy(label, value)}
                aria-label={`Copy ${label.toLowerCase()}`}
                className="inline-flex size-6 cursor-pointer items-center justify-center rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground"
              >
                {copied === label ? (
                  <Check className="size-3.5 text-eco" />
                ) : (
                  <Copy className="size-3.5" />
                )}
              </button>
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

async function fetchVehicle(id: string): Promise<VehicleDetail> {
  const res = await fetch(`/api/vehicles/${id}`);
  if (!res.ok) throw new Error("Vehicle not found");
  return res.json();
}

export default function Checkout({
  user,
  testMode = false,
}: {
  user: IUser;
  testMode?: boolean;
}) {
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
    <div className="space-y-8">
      <Steps current={2} />

      {searchParams?.get("cancelled") && (
        <div className="flex items-center gap-3 rounded-2xl border border-amber/50 bg-amber-soft px-4 py-3 text-sm">
          <Info className="size-5 shrink-0 text-amber-800 dark:text-amber-200" />
          Payment was cancelled and your card was not charged. You can try again
          below.
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr]">
        <div className="space-y-6">
          <section className="overflow-hidden rounded-2xl border bg-card shadow-card">
            <div className="grid sm:grid-cols-[260px_1fr]">
              <VehicleImage
                src={vehicle.image}
                brand={vehicle.brand}
                model={vehicle.model}
                bodyType={vehicle.body_type}
                className="h-full sm:aspect-auto"
              />
              <div className="space-y-3 p-5">
                <div className="flex flex-wrap gap-2">
                  <FuelBadge fuelType={vehicle.fuel_type} />
                  <GreenScoreBadge emissions={vehicle.carbon_emissions} />
                </div>
                <h2 className="font-display text-xl font-bold">
                  {vehicle.brand} {vehicle.model}
                </h2>
                <div className="grid gap-3 text-sm sm:grid-cols-2">
                  <div className="flex gap-2">
                    <CalendarDays className="mt-0.5 size-4 shrink-0 text-primary" />
                    <div>
                      <p className="font-semibold">
                        {format(start, "EEE, MMM d")} to{" "}
                        {format(end, "EEE, MMM d")}
                      </p>
                      <p className="text-muted-foreground">
                        {quote.days} day{quote.days === 1 ? "" : "s"} ·{" "}
                        <Link
                          href={`/select-vehicle/${vehicle.id}`}
                          className="font-medium text-primary hover:underline"
                        >
                          Change
                        </Link>
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <MapPin className="mt-0.5 size-4 shrink-0 text-primary" />
                    <div>
                      <p className="font-semibold">
                        {vehicle.branch_name || "Pick-up branch"}
                      </p>
                      <p className="text-muted-foreground">
                        {[
                          vehicle.branch_address,
                          vehicle.branch_city,
                          vehicle.branch_province,
                        ]
                          .filter(Boolean)
                          .join(", ")}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border bg-card p-5 shadow-card">
            <h3 className="mb-4 flex items-center gap-2 font-display font-bold">
              <UserRound className="size-5 text-primary" /> Renter Information
            </h3>
            <dl className="grid gap-4 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-muted-foreground">Full name</dt>
                <dd className="font-semibold">{user.name}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Email</dt>
                <dd className="font-semibold">{user.email}</dd>
              </div>
            </dl>
            <p className="mt-4 rounded-xl bg-secondary p-3 text-sm text-muted-foreground">
              Bring your driver&apos;s licence and a photo ID to pick-up.
              Details are taken from your{" "}
              <Link
                href="/account"
                className="font-medium text-primary hover:underline"
              >
                account
              </Link>
              .
            </p>
          </section>

          <section className="rounded-2xl border bg-card p-5 shadow-card">
            <div className="flex items-start justify-between gap-4">
              <div className="flex gap-3">
                <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-amber-soft text-amber-800 dark:text-amber-200">
                  <Gift className="size-5" />
                </span>
                <div>
                  <h3 className="font-display font-bold">Use reward points</h3>
                  <p className="text-sm text-muted-foreground">
                    You have{" "}
                    <strong className="text-foreground">
                      {balance.toLocaleString()} pts
                    </strong>
                    . {POINTS_PER_DOLLAR} points = $1, up to{" "}
                    {MAX_REDEEMABLE_POINTS.toLocaleString()} per booking.
                  </p>
                </div>
              </div>
              <Switch
                checked={redeemPoints && potentialRedeem > 0}
                disabled={potentialRedeem === 0}
                onCheckedChange={setRedeemPoints}
                aria-label="Use reward points"
              />
            </div>
            {potentialRedeem > 0 && (
              <p className="mt-3 text-sm font-medium text-primary">
                {redeemPoints
                  ? `Using ${quote.pointsRedeemed.toLocaleString()} points saves you ${formatPrice(quote.discount)}.`
                  : `Turn on to save ${formatPrice(potentialRedeem / POINTS_PER_DOLLAR)}.`}
              </p>
            )}
          </section>

          <section className="rounded-2xl border bg-card p-5 shadow-card">
            <h3 className="mb-3 font-display font-bold">Terms & Conditions</h3>
            <ul className="mb-4 grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
              <li>Minimum age requirement: 21</li>
              <li>{ev ? "Charge" : "Fuel"} policy: same-to-same</li>
              <li>Basic insurance coverage included</li>
              <li>Late return charges apply</li>
            </ul>
            <label className="flex cursor-pointer items-start gap-3 rounded-xl bg-secondary p-3 text-sm">
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
                  className="font-medium text-primary hover:underline"
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
          <div className="space-y-4 rounded-3xl border bg-card p-6 shadow-float">
            <h3 className="font-display text-lg font-bold">Trip Cost</h3>
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
                  className="text-primary"
                />
              )}
            </div>
            <Separator />
            <div className="flex items-baseline justify-between">
              <span className="font-semibold">Amount Due</span>
              <span className="font-display text-3xl font-bold">
                {formatPrice(quote.total)}
              </span>
            </div>
            <div className="flex items-center gap-2 rounded-xl bg-accent px-3 py-2 text-sm font-medium text-accent-foreground">
              <Gift className="size-4" />
              You&apos;ll earn +{quote.pointsToEarn.toLocaleString()} pts
              {ev ? " (2x EV bonus)" : ""}
            </div>

            {testMode && <TestCardHelper />}

            {error && (
              <p className="flex items-start gap-2 rounded-xl bg-destructive/10 p-3 text-sm text-destructive">
                <CircleAlert className="mt-0.5 size-4 shrink-0" /> {error}
              </p>
            )}

            <Button
              size="xl"
              className="w-full"
              onClick={onPayNow}
              disabled={!agreed}
              loading={paying}
            >
              {!paying && <Lock className="size-4" />}
              {paying
                ? "Redirecting to payment..."
                : `Pay Now ${formatPrice(quote.total)}`}
            </Button>
            {!agreed && (
              <p className="text-center text-xs text-muted-foreground">
                Accept the rental terms to continue.
              </p>
            )}
            <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
              <ShieldCheck className="size-4" /> Secure payment with Stripe
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Line({
  label,
  value,
  className,
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex justify-between gap-4 text-muted-foreground",
        className
      )}
    >
      <span>{label}</span>
      <span className={cn("font-medium", !className && "text-foreground")}>
        {value}
      </span>
    </div>
  );
}
