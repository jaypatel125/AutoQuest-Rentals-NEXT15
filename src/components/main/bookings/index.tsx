"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { differenceInCalendarDays, format } from "date-fns";
import { CalendarDays, CalendarX2 } from "lucide-react";
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
        className="divide-y border-y"
        role="status"
        aria-label="Fetching your bookings"
      >
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex gap-6 py-6">
            <div className="h-20 w-32 animate-pulse rounded-md bg-muted" />
            <div className="flex-1 space-y-2 pt-1">
              <div className="h-4 w-1/3 animate-pulse rounded bg-muted" />
              <div className="h-3.5 w-1/4 animate-pulse rounded bg-muted" />
            </div>
          </div>
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
          <Button asChild variant="outline">
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
    <div className="space-y-2">
      <div
        role="tablist"
        aria-label="Booking status"
        className="flex gap-6 border-b"
      >
        {tabs.map(({ key, label }) => (
          <button
            key={key}
            role="tab"
            type="button"
            aria-selected={active === key}
            onClick={() => setTab(key)}
            className={cn(
              "-mb-px inline-flex cursor-pointer items-center gap-2 border-b py-3 text-sm text-muted-foreground transition-colors hover:text-foreground",
              active === key
                ? "border-foreground text-foreground"
                : "border-transparent"
            )}
          >
            {label}
            <span className="text-xs text-muted-foreground tabular-nums">
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
              ? "Your next trip is just a search away."
              : undefined
          }
          action={
            active === "upcoming" ? (
              <Button asChild variant="outline">
                <Link href="/select-vehicle">Find a car</Link>
              </Button>
            ) : undefined
          }
        />
      ) : (
        <ul className="divide-y">
          {list.map((booking) => {
            const start = new Date(booking.start_date);
            const end = new Date(booking.end_date);
            const soon =
              active === "upcoming" ? countdown(start, end, today) : null;
            const cancelled = booking.status === "Cancelled";
            return (
              <li key={booking.booking_id}>
                <Link
                  href={`/bookings/${booking.booking_id}`}
                  className="group grid gap-5 py-6 sm:grid-cols-[160px_1fr_auto] sm:items-center"
                >
                  <VehicleImage
                    src={booking.image}
                    brand={booking.brand}
                    model={booking.model}
                    bodyType={booking.body_type}
                    className={cn(
                      "rounded-md",
                      cancelled && "opacity-50 grayscale"
                    )}
                  />
                  <div className="min-w-0 space-y-1">
                    <h3 className="font-medium group-hover:underline group-hover:underline-offset-4">
                      {booking.brand} {booking.model}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {format(start, "MMM d")} to {format(end, "MMM d, yyyy")}
                      {" · "}
                      {booking.branch_name}, {booking.city}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      +{Number(booking.points_earned).toLocaleString()} pts
                      {Number(booking.points_redeemed) > 0 &&
                        ` · -${Number(booking.points_redeemed).toLocaleString()} pts used`}
                    </p>
                    {soon && <p className="text-sm">{soon}</p>}
                  </div>
                  <div className="flex items-center justify-between gap-6 sm:flex-col sm:items-end sm:gap-2">
                    <StatusBadge status={booking.status} />
                    <div className="text-right text-sm">
                      <p className="text-xs text-muted-foreground">
                        {cancelled ? "Refunded" : "Total"}
                      </p>
                      <p className="tabular-nums">
                        {formatPrice(
                          Number(
                            cancelled
                              ? (booking.refund_amount ?? booking.total_price)
                              : booking.total_price
                          )
                        )}
                      </p>
                    </div>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
