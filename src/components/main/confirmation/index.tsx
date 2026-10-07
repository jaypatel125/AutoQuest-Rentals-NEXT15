"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import MaxWidthWrapper from "@/components/utility/MaxWidthWrapper";
import { VehicleImage } from "@/components/vehicles/VehicleImage";
import { greenScore } from "@/lib/green";
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
    <MaxWidthWrapper className="max-w-3xl py-16 md:py-24">
      <div className="mb-14">
        <span className="mb-8 inline-flex size-10 items-center justify-center rounded-full border">
          <Check className="size-5" strokeWidth={1.5} />
        </span>
        <p className="mb-2 text-sm text-muted-foreground">Booking Confirmed</p>
        <h1 className="text-3xl font-semibold md:text-4xl">
          You&apos;re all set!
        </h1>
        <p className="mt-3 max-w-lg text-muted-foreground">
          Thank you for your booking! A confirmation email has been sent to{" "}
          <span className="text-foreground">
            {data.customerEmail || "your email"}
          </span>
          .
        </p>
      </div>

      <div className="grid gap-8 border-t pt-10 sm:grid-cols-[220px_1fr]">
        <VehicleImage
          src={car?.image}
          brand={car?.brand}
          model={car?.model}
          bodyType={car?.body_type}
          className="rounded-md"
        />
        <div className="space-y-5">
          <div>
            <h2 className="text-xl font-medium">{vehicleName}</h2>
            {car && (
              <p className="text-sm text-muted-foreground">
                <span className={ev ? "text-eco" : undefined}>
                  {car.fuel_type}
                </span>{" "}
                · Green {greenScore(car.carbon_emissions).grade}
              </p>
            )}
          </div>
          <dl className="grid gap-4 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-muted-foreground">Dates</dt>
              <dd className="mt-1">
                {format(start, "EEE, MMM d, yyyy")} to{" "}
                {format(end, "EEE, MMM d, yyyy")}
              </dd>
              <dd className="text-muted-foreground">
                {rentalDays(start, end)} day rental
              </dd>
            </div>
            {branch && (
              <div>
                <dt className="text-muted-foreground">Pick-up</dt>
                <dd className="mt-1">{branch.name}</dd>
                <dd className="text-muted-foreground">
                  {[branch.address, branch.city, branch.province]
                    .filter(Boolean)
                    .join(", ")}
                </dd>
                <dd>
                  <a
                    href={mapsUrl(address)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline decoration-border underline-offset-4 hover:decoration-foreground"
                  >
                    Get directions
                  </a>
                </dd>
              </div>
            )}
          </dl>
        </div>
      </div>

      <dl className="mt-10 grid gap-6 border-t pt-10 sm:grid-cols-3">
        <div>
          <dt className="text-sm text-muted-foreground">Total paid</dt>
          <dd className="mt-1 text-2xl font-medium tabular-nums">
            {formatPrice(data.amountTotal)}
          </dd>
          <dd className="text-xs text-muted-foreground">{data.currency}</dd>
        </div>
        <div>
          <dt className="text-sm text-muted-foreground">Points earned</dt>
          <dd className="mt-1 text-2xl font-medium tabular-nums">
            +
            {(
              data.pointsEarned ?? Math.floor(data.amountTotal * (ev ? 2 : 1))
            ).toLocaleString()}
          </dd>
          <dd className="text-xs text-muted-foreground">
            {ev ? "2x EV bonus applied" : "1 pt per dollar"}
          </dd>
        </div>
        <div>
          <dt className="text-sm text-muted-foreground">Points redeemed</dt>
          <dd className="mt-1 text-2xl font-medium tabular-nums">
            {data.redeemedPoints > 0
              ? `-${data.redeemedPoints.toLocaleString()}`
              : "0"}
          </dd>
          <dd className="text-xs text-muted-foreground">
            {data.redeemedPoints > 0
              ? `Saved ${formatPrice(data.redeemedPoints / 10)}`
              : "Saved for next time"}
          </dd>
        </div>
      </dl>

      {!data.bookingId && (
        <p className="mt-10 flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" /> Finalizing your booking.
          It will appear in My Bookings in a moment.
        </p>
      )}

      <div className="mt-12 flex flex-col gap-3 sm:flex-row">
        {data.bookingId ? (
          <Button asChild>
            <Link href={`/bookings/${data.bookingId}`}>View booking</Link>
          </Button>
        ) : (
          <Button onClick={() => router.push("/bookings")}>
            View My Bookings
          </Button>
        )}
        <AddToCalendarButton
          id={data.bookingId ?? data.startDate}
          vehicle={vehicleName}
          start={start}
          end={end}
          location={address}
        />
        <Button variant="ghost" onClick={() => router.push("/")}>
          Back to Home
        </Button>
      </div>
    </MaxWidthWrapper>
  );
}
