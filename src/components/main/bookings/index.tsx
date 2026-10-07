"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { differenceInCalendarDays, format } from "date-fns";
import {
  ArrowRight,
  CalendarDays,
  CalendarX2,
  Gift,
  MapPin,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Booking } from "@/app/(main)/bookings/actions";
import { formatPrice, cn } from "@/lib/utils";
import Error from "@/components/utility/Error";
import { EmptyState } from "@/components/utility/EmptyState";
import { VehicleImage } from "@/components/vehicles/VehicleImage";
import { StatusBadge } from "@/components/vehicles/badges";

type Props = {
  data?: Booking[];
  isLoading: boolean;
  isError: boolean;
};

type Tab = "upcoming" | "past" | "cancelled";

function categorize(b: Booking, today: Date): Tab {
  if (b.status === "Cancelled") return "cancelled";
  if (b.status === "Completed") return "past";
  return new Date(b.end_date) < today ? "past" : "upcoming";
}

function countdown(start: Date, end: Date, today: Date) {
  const days = differenceInCalendarDays(start, today);
  if (days > 1) return `Pick-up in ${days} days`;
  if (days === 1) return "Pick-up tomorrow";
  if (days === 0) return "Pick-up today";
  return differenceInCalendarDays(end, today) >= 0 ? "On the road" : null;
}

export default function Bookings({ data, isLoading, isError }: Props) {
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);
  const groups = useMemo(() => {
    const g: Record<Tab, Booking[]> = { upcoming: [], past: [], cancelled: [] };
    for (const b of data ?? []) g[categorize(b, today)].push(b);
    g.upcoming.sort(
      (a, b) => +new Date(a.start_date) - +new Date(b.start_date)
    );
    return g;
  }, [data, today]);
  const [tab, setTab] = useState<Tab | null>(null);
  const active: Tab =
    tab ?? (groups.upcoming.length || !data?.length ? "upcoming" : "past");

  if (isLoading) {
    return (
      <div
        className="space-y-4"
        role="status"
        aria-label="Fetching your bookings"
      >
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-40 animate-pulse rounded-2xl bg-muted" />
        ))}
      </div>
    );
  }

  if (isError) {
    return <Error error="Failed to load bookings. Please try again." />;
  }

  if (!data || data.length === 0) {
    return (
      <EmptyState
        icon={CalendarDays}
        title="No bookings found"
        description="You haven't made any bookings yet. Start exploring our available cars."
        action={
          <Button asChild>
            <Link href="/select-vehicle">Browse Cars</Link>
          </Button>
        }
      />
    );
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: "upcoming", label: "Upcoming" },
    { key: "past", label: "Past" },
    { key: "cancelled", label: "Cancelled" },
  ];
  const list = groups[active];

  return (
    <div className="space-y-6">
      <div
        role="tablist"
        aria-label="Booking status"
        className="inline-flex rounded-xl bg-muted p-1"
      >
        {tabs.map(({ key, label }) => (
          <button
            key={key}
            role="tab"
            type="button"
            aria-selected={active === key}
            onClick={() => setTab(key)}
            className={cn(
              "inline-flex cursor-pointer items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-muted-foreground transition-colors",
              active === key && "bg-card text-foreground shadow-sm"
            )}
          >
            {label}
            <span className="rounded-full bg-background/70 px-1.5 text-xs">
              {groups[key].length}
            </span>
          </button>
        ))}
      </div>

      {list.length === 0 ? (
        <EmptyState
          icon={active === "cancelled" ? CalendarX2 : CalendarDays}
          title={`No ${active} bookings`}
          description={
            active === "upcoming"
              ? "Your next adventure is just a search away."
              : undefined
          }
          action={
            active === "upcoming" ? (
              <Button asChild>
                <Link href="/select-vehicle">Find a car</Link>
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="space-y-4">
          {list.map((booking) => {
            const start = new Date(booking.start_date);
            const end = new Date(booking.end_date);
            const soon =
              active === "upcoming" ? countdown(start, end, today) : null;
            return (
              <Link
                key={booking.booking_id}
                href={`/bookings/${booking.booking_id}`}
                className="group grid overflow-hidden rounded-2xl border bg-card transition-all hover:-translate-y-0.5 hover:shadow-lg sm:grid-cols-[220px_1fr]"
              >
                <VehicleImage
                  src={booking.image}
                  brand={booking.brand}
                  model={booking.model}
                  bodyType={booking.body_type}
                  className={cn(
                    "h-full sm:aspect-auto",
                    active === "cancelled" && "opacity-60 grayscale"
                  )}
                />
                <div className="flex flex-col gap-4 p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-bold">
                        {booking.brand} {booking.model}
                      </h3>
                      <p className="flex items-center gap-1 text-sm text-muted-foreground">
                        <MapPin className="size-3.5" /> {booking.branch_name},{" "}
                        {booking.city}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {soon && (
                        <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                          {soon}
                        </span>
                      )}
                      <StatusBadge status={booking.status} />
                    </div>
                  </div>

                  <div className="grid gap-3 text-sm sm:grid-cols-3">
                    <div>
                      <p className="text-muted-foreground">Dates</p>
                      <p className="font-semibold">
                        {format(start, "MMM d")} to {format(end, "MMM d, yyyy")}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">
                        {booking.status === "Cancelled" ? "Refunded" : "Total"}
                      </p>
                      <p className="font-semibold">
                        {formatPrice(
                          Number(
                            booking.status === "Cancelled"
                              ? (booking.refund_amount ?? booking.total_price)
                              : booking.total_price
                          )
                        )}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Points</p>
                      <p className="flex items-center gap-1 font-semibold text-primary">
                        <Gift className="size-3.5" />+
                        {Number(booking.points_earned).toLocaleString()}
                        {Number(booking.points_redeemed) > 0 && (
                          <span className="text-muted-foreground">
                            {" "}
                            / -
                            {Number(booking.points_redeemed).toLocaleString()}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>

                  <span className="mt-auto inline-flex items-center gap-1 text-sm font-semibold text-primary">
                    View Details
                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
