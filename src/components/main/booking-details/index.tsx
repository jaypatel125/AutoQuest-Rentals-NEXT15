"use client";

import { useState } from "react";
import { format } from "date-fns";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  CalendarDays,
  CircleAlert,
  Leaf,
  MapPin,
  Navigation,
  Printer,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Loader from "@/components/utility/Loader";
import Error from "@/components/utility/Error";
import {
  Booking,
  cancelBooking,
} from "@/app/(main)/bookings/[bookingId]/actions";
import { cn, formatPrice } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { VehicleImage } from "@/components/vehicles/VehicleImage";
import {
  FuelBadge,
  GreenScoreBadge,
  StatusBadge,
} from "@/components/vehicles/badges";
import { AddToCalendarButton } from "@/components/main/AddToCalendarButton";
import { cancellationTerms, FREE_CANCELLATION_HOURS } from "@/lib/cancellation";
import {
  POINTS_PER_DOLLAR,
  SERVICE_FEE,
  TAX_RATE,
  isElectric,
  rentalDays,
} from "@/lib/pricing";
import { tripSavingsKg } from "@/lib/green";
import { mapsUrl } from "@/lib/ics";
import { bodyTypeLabel } from "@/lib/vehicles";

interface Props {
  booking?: Booking;
  isLoading: boolean;
  error: unknown;
}

export default function BookingDetail({ booking, isLoading, error }: Props) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const { mutate: cancelBookingMutate, isPending } = useMutation({
    mutationFn: () => cancelBooking(booking!.booking_id),
    onSuccess: (result) => {
      setConfirmOpen(false);
      toast({
        title: "Booking Cancelled",
        description: result.refundedAutomatically
          ? `Your refund of ${formatPrice(result.refund)} is on its way.`
          : result.refund > 0
            ? `We'll process your refund of ${formatPrice(result.refund)} within 5 to 7 business days.`
            : "The booking has been successfully cancelled.",
      });
      queryClient.invalidateQueries({
        queryKey: ["booking", booking?.booking_id],
      });
      queryClient.invalidateQueries({ queryKey: ["get-bookings"] });
      queryClient.invalidateQueries({ queryKey: ["rewards"] });
    },
    onError: (err: Error) => {
      toast({
        title: "Could not cancel",
        description: err.message,
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return <Loader title="Fetching your booking" />;
  }

  if (error || !booking) {
    return <Error error="Failed to load booking details. Please try again." />;
  }

  const start = new Date(booking.start_date);
  const end = new Date(booking.end_date);
  const days = rentalDays(start, end);
  const status = booking.booking_status;
  const total = Number(booking.total_price);
  const subTotal = booking.sub_total ? Number(booking.sub_total) : null;
  const pointsEarned = parseInt(booking.points_earned) || 0;
  const pointsRedeemed = parseInt(booking.points_redeemed) || 0;
  const ev = isElectric(booking.fuel_type);
  const terms = cancellationTerms({
    status,
    start_date: booking.start_date,
    total_price: booking.total_price,
    price_per_day: booking.price_per_day,
  });
  const upcoming =
    status === "Confirmed" && end >= new Date(new Date().setHours(0, 0, 0, 0));
  const address = [
    booking.branch_address,
    booking.branch_city,
    booking.branch_province,
    booking.branch_postal_code,
  ]
    .filter(Boolean)
    .join(", ");
  const saved = tripSavingsKg(booking.carbon_emissions, days);

  const timeline = [
    { label: "Booked", date: new Date(booking.booking_created_at), done: true },
    ...(status === "Cancelled"
      ? [
          {
            label: "Cancelled",
            date: booking.cancelled_at
              ? new Date(booking.cancelled_at)
              : new Date(booking.booking_updated_at),
            done: true,
            cancelled: true,
          },
        ]
      : [
          { label: "Pick-up", date: start, done: start <= new Date() },
          { label: "Return", date: end, done: end <= new Date() },
          { label: "Completed", date: null, done: status === "Completed" },
        ]),
  ];

  return (
    <div className="grid gap-8 lg:grid-cols-[1.6fr_1fr]">
      <div className="space-y-6">
        <section className="rounded-2xl border bg-card p-5">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-bold">Status</h2>
            <StatusBadge status={status} />
          </div>
          <ol
            className="grid gap-4"
            style={{
              gridTemplateColumns: `repeat(${timeline.length}, minmax(0, 1fr))`,
            }}
          >
            {timeline.map((step, i) => (
              <li key={step.label} className="relative">
                {i > 0 && (
                  <span
                    className={cn(
                      "absolute top-3 right-1/2 left-[-50%] h-0.5 -translate-y-1/2",
                      step.done ? "bg-primary" : "bg-border"
                    )}
                    aria-hidden
                  />
                )}
                <div className="relative flex flex-col items-center text-center">
                  <span
                    className={cn(
                      "z-10 inline-flex size-6 items-center justify-center rounded-full border-2 bg-card",
                      step.done &&
                        !("cancelled" in step) &&
                        "border-primary bg-primary",
                      "cancelled" in step &&
                        "border-destructive bg-destructive",
                      !step.done && "border-border"
                    )}
                  />
                  <span className="mt-2 text-sm font-semibold">
                    {step.label}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {step.date ? format(step.date, "MMM d") : " "}
                  </span>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section className="grid overflow-hidden rounded-2xl border bg-card md:grid-cols-[1fr_1.1fr]">
          <VehicleImage
            src={booking.image}
            brand={booking.brand}
            model={booking.model}
            bodyType={booking.body_type}
            className="h-full md:aspect-auto"
          />
          <div className="space-y-4 p-5">
            <div className="flex flex-wrap gap-2">
              <FuelBadge fuelType={booking.fuel_type} />
              <GreenScoreBadge emissions={booking.carbon_emissions} />
            </div>
            <div>
              <h3 className="text-xl font-bold">
                {booking.brand} {booking.model}
              </h3>
              <p className="text-sm text-muted-foreground">
                {bodyTypeLabel(booking.body_type)} · {booking.transmission} ·{" "}
                {booking.passenger_capacity} seats · {booking.carbon_emissions}{" "}
                g/km
              </p>
            </div>
            <div className="flex gap-3 text-sm">
              <CalendarDays className="mt-0.5 size-4 shrink-0 text-primary" />
              <div>
                <p className="font-semibold">
                  {format(start, "EEEE, MMMM d, yyyy")}
                </p>
                <p className="text-muted-foreground">
                  to {format(end, "EEEE, MMMM d, yyyy")} · {days} day
                  {days === 1 ? "" : "s"}
                </p>
              </div>
            </div>
            <div className="flex gap-3 text-sm">
              <MapPin className="mt-0.5 size-4 shrink-0 text-primary" />
              <div>
                <p className="font-semibold">{booking.branch_name}</p>
                <p className="text-muted-foreground">{address}</p>
                <a
                  href={mapsUrl(`${booking.branch_name}, ${address}`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="no-print mt-1 inline-flex items-center gap-1 font-medium text-primary hover:underline"
                >
                  <Navigation className="size-3.5" /> Get directions
                </a>
              </div>
            </div>
          </div>
        </section>

        {saved >= 1 && status !== "Cancelled" && (
          <section className="flex items-center gap-4 rounded-2xl border bg-accent/60 p-5 text-accent-foreground">
            <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-2xl bg-card text-primary">
              <Leaf className="size-5" />
            </span>
            <p className="text-sm">
              Choosing this car avoids an estimated{" "}
              <strong>{Math.round(saved)} kg of CO₂</strong> compared with a
              typical gas car on an 80 km/day trip.
            </p>
          </section>
        )}
      </div>

      <aside className="space-y-6">
        <section className="rounded-2xl border bg-card p-5">
          <h2 className="mb-4 font-bold">Price Summary</h2>
          <div className="space-y-2 text-sm">
            {subTotal !== null && (
              <>
                <Row
                  label={`${formatPrice(Number(booking.price_per_day))} x ${days} day${days === 1 ? "" : "s"}`}
                  value={formatPrice(subTotal)}
                />
                <Row label="Service fee" value={formatPrice(SERVICE_FEE)} />
                <Row
                  label={`HST (${Math.round(TAX_RATE * 100)}%)`}
                  value={formatPrice(subTotal * TAX_RATE)}
                />
              </>
            )}
            {pointsRedeemed > 0 && (
              <Row
                label={`Points redeemed (${pointsRedeemed.toLocaleString()})`}
                value={`-${formatPrice(pointsRedeemed / POINTS_PER_DOLLAR)}`}
                accent
              />
            )}
          </div>
          <Separator className="my-4" />
          <div className="flex items-baseline justify-between">
            <span className="font-semibold">Total</span>
            <span className="font-display text-2xl font-bold">
              {formatPrice(total)}
            </span>
          </div>
          {status === "Cancelled" && (
            <div className="mt-4 rounded-xl bg-muted/70 p-3 text-sm">
              <div className="flex justify-between font-semibold">
                <span>Refund</span>
                <span>{formatPrice(Number(booking.refund_amount ?? 0))}</span>
              </div>
              {booking.cancelled_at && (
                <p className="mt-1 text-xs text-muted-foreground">
                  Cancelled on{" "}
                  {format(new Date(booking.cancelled_at), "MMM d, yyyy")}
                </p>
              )}
            </div>
          )}
        </section>

        <section className="rounded-2xl border bg-card p-5">
          <h2 className="mb-4 font-bold">Rewards Summary</h2>
          <div className="space-y-2 text-sm">
            <Row
              label="Points Earned"
              value={`+${pointsEarned.toLocaleString()} pts`}
              accent
            />
            {pointsRedeemed > 0 && (
              <Row
                label="Points Redeemed"
                value={`-${pointsRedeemed.toLocaleString()} pts`}
              />
            )}
          </div>
          <p
            className={cn(
              "mt-4 rounded-xl p-3 text-sm",
              ev
                ? "bg-accent text-accent-foreground"
                : "bg-muted/70 text-muted-foreground"
            )}
          >
            {ev ? (
              <>
                Thank you for choosing an <strong>Electric Vehicle</strong>! You
                earned <strong>2x rewards</strong> for this booking.
              </>
            ) : (
              <>
                Earn <strong>2x rewards</strong> on your next booking by
                choosing an electric vehicle.
              </>
            )}
          </p>
        </section>

        <section className="no-print space-y-3">
          {upcoming && (
            <AddToCalendarButton
              id={booking.booking_id}
              vehicle={`${booking.brand} ${booking.model}`}
              start={start}
              end={end}
              location={`${booking.branch_name}, ${address}`}
              className="w-full"
            />
          )}
          <Button
            variant="outline"
            className="w-full"
            onClick={() => window.print()}
          >
            <Printer /> Print receipt
          </Button>
          {status === "Confirmed" && (
            <>
              <Button
                variant="outline"
                className="w-full border-destructive/40 text-destructive hover:bg-destructive hover:text-white"
                onClick={() => setConfirmOpen(true)}
                disabled={!terms.allowed}
              >
                <XCircle /> Cancel Booking
              </Button>
              <p className="text-center text-xs text-muted-foreground">
                {terms.allowed
                  ? terms.free
                    ? `Free cancellation until ${FREE_CANCELLATION_HOURS} hours before pick-up.`
                    : "Inside 24 hours of pick-up, one day's rental is kept."
                  : terms.reason}
              </p>
            </>
          )}
        </section>
      </aside>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel this booking?</DialogTitle>
            <DialogDescription>
              {booking.brand} {booking.model}, {format(start, "MMM d")} to{" "}
              {format(end, "MMM d")}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 rounded-xl bg-muted/70 p-4 text-sm">
            <Row label="Amount paid" value={formatPrice(total)} />
            {terms.fee > 0 && (
              <Row
                label="Late cancellation fee"
                value={`-${formatPrice(terms.fee)}`}
              />
            )}
            <Separator className="my-2" />
            <Row
              label="You'll be refunded"
              value={formatPrice(terms.refund)}
              strong
            />
          </div>
          {!terms.free && (
            <p className="flex gap-2 text-sm text-amber-700 dark:text-amber-300">
              <CircleAlert className="mt-0.5 size-4 shrink-0" />
              Your pick-up is less than {FREE_CANCELLATION_HOURS} hours away, so
              one day&apos;s rental is kept.
            </p>
          )}
          <p className="text-sm text-muted-foreground">
            Points earned on this booking will be removed
            {pointsRedeemed > 0
              ? ` and your ${pointsRedeemed.toLocaleString()} redeemed points returned`
              : ""}
            .
            {!booking.paid_online &&
              " Our team will process the refund manually."}
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>
              Keep booking
            </Button>
            <Button
              variant="destructive"
              loading={isPending}
              onClick={() => cancelBookingMutate()}
            >
              {isPending ? "Cancelling..." : "Yes, cancel"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Row({
  label,
  value,
  accent,
  strong,
}: {
  label: string;
  value: string;
  accent?: boolean;
  strong?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex justify-between gap-4",
        strong ? "font-bold" : "text-muted-foreground"
      )}
    >
      <span>{label}</span>
      <span
        className={cn(
          "font-medium",
          accent ? "text-primary" : "text-foreground"
        )}
      >
        {value}
      </span>
    </div>
  );
}
