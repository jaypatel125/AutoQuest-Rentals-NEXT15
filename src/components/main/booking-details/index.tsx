"use client";

import { useState } from "react";
import { format } from "date-fns";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
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
import { StatusBadge } from "@/components/vehicles/badges";
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
    <div className="grid gap-12 lg:grid-cols-[1.6fr_1fr] lg:gap-16">
      <div className="space-y-12">
        <section className="space-y-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm text-muted-foreground">Status</h2>
            <StatusBadge status={status} />
          </div>
          <ol
            className="grid gap-4"
            style={{
              gridTemplateColumns: `repeat(${timeline.length}, minmax(0, 1fr))`,
            }}
          >
            {timeline.map((step) => (
              <li
                key={step.label}
                className={cn(
                  "border-t-2 pt-3",
                  "cancelled" in step
                    ? "border-destructive"
                    : step.done
                      ? "border-foreground"
                      : "border-border"
                )}
              >
                <p
                  className={cn(
                    "text-sm",
                    !step.done && "text-muted-foreground"
                  )}
                >
                  {step.label}
                </p>
                <p className="text-xs text-muted-foreground">
                  {step.date ? format(step.date, "MMM d") : " "}
                </p>
              </li>
            ))}
          </ol>
        </section>

        <section className="grid gap-8 border-t pt-10 sm:grid-cols-[220px_1fr]">
          <VehicleImage
            src={booking.image}
            brand={booking.brand}
            model={booking.model}
            bodyType={booking.body_type}
            className="rounded-md"
          />
          <div className="space-y-5">
            <div>
              <h3 className="text-xl font-medium">
                {booking.brand} {booking.model}
              </h3>
              <p className="text-sm text-muted-foreground">
                <span className={ev ? "text-eco" : undefined}>
                  {booking.fuel_type}
                </span>{" "}
                · {bodyTypeLabel(booking.body_type)} · {booking.transmission} ·{" "}
                {booking.passenger_capacity} seats · {booking.carbon_emissions}{" "}
                g/km
              </p>
            </div>
            <dl className="grid gap-4 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-muted-foreground">Dates</dt>
                <dd className="mt-1">{format(start, "EEEE, MMMM d, yyyy")}</dd>
                <dd className="text-muted-foreground">
                  to {format(end, "EEEE, MMMM d, yyyy")} · {days} day
                  {days === 1 ? "" : "s"}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Pick-up</dt>
                <dd className="mt-1">{booking.branch_name}</dd>
                <dd className="text-muted-foreground">{address}</dd>
                <dd>
                  <a
                    href={mapsUrl(`${booking.branch_name}, ${address}`)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="no-print underline decoration-border underline-offset-4 hover:decoration-foreground"
                  >
                    Get directions
                  </a>
                </dd>
              </div>
            </dl>
          </div>
        </section>

        {saved >= 1 && status !== "Cancelled" && (
          <p className="border-t pt-10 text-sm text-muted-foreground">
            Choosing this car avoids an estimated{" "}
            <span className="text-eco">{Math.round(saved)} kg of CO₂</span>{" "}
            compared with a typical gas car on an 80 km/day trip.
          </p>
        )}
      </div>

      <aside className="space-y-10">
        <section className="space-y-4 rounded-lg border p-6">
          <h2 className="font-medium">Price Summary</h2>
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
              />
            )}
          </div>
          <div className="flex items-baseline justify-between border-t pt-4">
            <span className="text-sm">Total</span>
            <span className="text-xl font-medium tabular-nums">
              {formatPrice(total)}
            </span>
          </div>
          {status === "Cancelled" && (
            <div className="border-t pt-4 text-sm">
              <div className="flex justify-between">
                <span>Refund</span>
                <span className="tabular-nums">
                  {formatPrice(Number(booking.refund_amount ?? 0))}
                </span>
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

        <section className="space-y-3 text-sm">
          <h2 className="font-medium">Rewards</h2>
          <Row
            label="Points Earned"
            value={`+${pointsEarned.toLocaleString()} pts`}
          />
          {pointsRedeemed > 0 && (
            <Row
              label="Points Redeemed"
              value={`-${pointsRedeemed.toLocaleString()} pts`}
            />
          )}
          <p className="text-muted-foreground">
            {ev ? (
              <>
                Thank you for choosing an electric vehicle. You earned 2x
                rewards for this booking.
              </>
            ) : (
              <>
                Earn 2x rewards on your next booking by choosing an electric
                vehicle.
              </>
            )}
          </p>
        </section>

        <section className="no-print space-y-2">
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
            Print receipt
          </Button>
          {status === "Confirmed" && (
            <>
              <Button
                variant="ghost"
                className="w-full text-destructive hover:bg-destructive/5 hover:text-destructive"
                onClick={() => setConfirmOpen(true)}
                disabled={!terms.allowed}
              >
                Cancel Booking
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
          <div className="space-y-2 border-y py-4 text-sm">
            <Row label="Amount paid" value={formatPrice(total)} />
            {terms.fee > 0 && (
              <Row
                label="Late cancellation fee"
                value={`-${formatPrice(terms.fee)}`}
              />
            )}
            <div className="border-t" />
            <Row
              label="You'll be refunded"
              value={formatPrice(terms.refund)}
              strong
            />
          </div>
          {!terms.free && (
            <p className="text-sm">
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
  strong,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex justify-between gap-4",
        strong ? "font-medium" : "text-muted-foreground"
      )}
    >
      <span>{label}</span>
      <span className="text-foreground tabular-nums">{value}</span>
    </div>
  );
}
