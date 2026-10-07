"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  ArrowRight,
  CalendarDays,
  Check,
  Gift,
  Loader2,
  MapPin,
  Navigation,
  Receipt,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import MaxWidthWrapper from "@/components/utility/MaxWidthWrapper";
import { VehicleImage } from "@/components/vehicles/VehicleImage";
import { FuelBadge, GreenScoreBadge } from "@/components/vehicles/badges";
import { AddToCalendarButton } from "@/components/main/AddToCalendarButton";
import type { ConfirmationData } from "@/app/(main)/confirmation/action";
import { useSearchStore } from "@/context/searchStore";
import { isElectric, rentalDays } from "@/lib/pricing";
import { mapsUrl } from "@/lib/ics";
import { formatPrice } from "@/lib/utils";

export default function ConfirmationDetails({
  data,
}: {
  data: ConfirmationData;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const refreshes = useRef(0);
  const { car, branch } = data;
  const start = new Date(data.startDate);
  const end = new Date(data.endDate);
  const ev = isElectric(car?.fuel_type);
  const vehicleName = car ? `${car.brand} ${car.model}` : "Your vehicle";
  const address = branch
    ? [
        branch.name,
        branch.address,
        branch.city,
        branch.province,
        branch.postal_code,
      ]
        .filter(Boolean)
        .join(", ")
    : "";

  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: ["get-bookings"] });
    queryClient.invalidateQueries({ queryKey: ["rewards"] });
    useSearchStore.setState({ selectedCar: undefined });
  }, [queryClient]);

  // The booking is written by the Stripe webhook, which can lag a few seconds.
  useEffect(() => {
    if (data.bookingId || refreshes.current >= 6) return;
    const timer = setTimeout(() => {
      refreshes.current += 1;
      router.refresh();
    }, 2500);
    return () => clearTimeout(timer);
  }, [data.bookingId, router]);

  return (
    <MaxWidthWrapper className="max-w-4xl animate-fade-up py-10 md:py-14">
      <div className="mb-10 text-center">
        <div className="relative mx-auto mb-6 size-20">
          <span className="absolute inset-0 animate-ping rounded-full bg-primary/20 [animation-iteration-count:2]" />
          <span className="relative inline-flex size-20 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-xl shadow-primary/30">
            <Check className="size-10" strokeWidth={3} />
          </span>
        </div>
        <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-primary">
          Booking Confirmed
        </p>
        <h1 className="text-3xl font-bold md:text-4xl">You&apos;re all set!</h1>
        <p className="mx-auto mt-3 max-w-lg text-muted-foreground">
          Thank you for your booking! A confirmation email has been sent to{" "}
          <span className="font-semibold text-foreground">
            {data.customerEmail || "your email"}
          </span>
          .
        </p>
      </div>

      <div className="overflow-hidden rounded-3xl border bg-card shadow-xl shadow-emerald-950/5">
        <div className="grid md:grid-cols-[1fr_1.2fr]">
          <VehicleImage
            src={car?.image}
            brand={car?.brand}
            model={car?.model}
            bodyType={car?.body_type}
            className="h-full md:aspect-auto"
          />
          <div className="space-y-5 p-6">
            <div className="flex flex-wrap gap-2">
              <FuelBadge fuelType={car?.fuel_type} />
              {car && <GreenScoreBadge emissions={car.carbon_emissions} />}
            </div>
            <h2 className="text-2xl font-bold">{vehicleName}</h2>
            <div className="space-y-3 text-sm">
              <div className="flex gap-3">
                <CalendarDays className="mt-0.5 size-4 shrink-0 text-primary" />
                <div>
                  <p className="font-semibold">
                    {format(start, "EEE, MMM d, yyyy")} to{" "}
                    {format(end, "EEE, MMM d, yyyy")}
                  </p>
                  <p className="text-muted-foreground">
                    {rentalDays(start, end)} day rental
                  </p>
                </div>
              </div>
              {branch && (
                <div className="flex gap-3">
                  <MapPin className="mt-0.5 size-4 shrink-0 text-primary" />
                  <div>
                    <p className="font-semibold">{branch.name}</p>
                    <p className="text-muted-foreground">
                      {[branch.address, branch.city, branch.province]
                        .filter(Boolean)
                        .join(", ")}
                    </p>
                    <a
                      href={mapsUrl(address)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 inline-flex items-center gap-1 font-medium text-primary hover:underline"
                    >
                      <Navigation className="size-3.5" /> Get directions
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <Separator />

        <div className="grid gap-6 p-6 sm:grid-cols-3">
          <div>
            <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Receipt className="size-4" /> Total paid
            </p>
            <p className="font-display text-2xl font-bold">
              {formatPrice(data.amountTotal)}
            </p>
            <p className="text-xs text-muted-foreground">{data.currency}</p>
          </div>
          <div>
            <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Gift className="size-4" /> Points earned
            </p>
            <p className="font-display text-2xl font-bold text-primary">
              +
              {(
                data.pointsEarned ?? Math.floor(data.amountTotal * (ev ? 2 : 1))
              ).toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground">
              {ev ? "2x EV bonus applied" : "1 pt per dollar"}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Points redeemed</p>
            <p className="font-display text-2xl font-bold">
              {data.redeemedPoints > 0
                ? `-${data.redeemedPoints.toLocaleString()}`
                : "0"}
            </p>
            <p className="text-xs text-muted-foreground">
              {data.redeemedPoints > 0
                ? `Saved ${formatPrice(data.redeemedPoints / 10)}`
                : "Saved for next time"}
            </p>
          </div>
        </div>

        <div
          className={
            ev
              ? "bg-accent px-6 py-4 text-sm text-accent-foreground"
              : "bg-muted/60 px-6 py-4 text-sm text-muted-foreground"
          }
        >
          {ev ? (
            <>
              Thank you for choosing an <strong>Electric Vehicle</strong>!
              You&apos;ve earned <strong>2x reward points</strong> on this
              booking.
            </>
          ) : (
            <>
              You&apos;ve earned standard reward points for this rental. Next
              time, rent an EV and earn <strong>2x rewards!</strong>
            </>
          )}
        </div>
      </div>

      {!data.bookingId && (
        <p className="mt-6 flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" /> Finalizing your booking.
          It will appear in My Bookings in a moment.
        </p>
      )}

      <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
        {data.bookingId ? (
          <Button asChild size="lg">
            <Link href={`/bookings/${data.bookingId}`}>
              View booking <ArrowRight />
            </Link>
          </Button>
        ) : (
          <Button size="lg" onClick={() => router.push("/bookings")}>
            View My Bookings <ArrowRight />
          </Button>
        )}
        <AddToCalendarButton
          id={data.bookingId ?? data.startDate}
          vehicle={vehicleName}
          start={start}
          end={end}
          location={address}
          className="h-11"
        />
        <Button variant="ghost" size="lg" onClick={() => router.push("/")}>
          Back to Home
        </Button>
      </div>
    </MaxWidthWrapper>
  );
}
