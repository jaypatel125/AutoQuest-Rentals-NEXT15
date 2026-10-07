"use client";

import { useQuery } from "@tanstack/react-query";
import { getAllBookingsByUserId } from "./actions";
import Bookings from "@/components/main/bookings";
import Link from "next/link";
import PageLayout from "@/components/utility/page-layout";
import { Button } from "@/components/ui/button";

export default function BookingsPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["get-bookings"],
    queryFn: getAllBookingsByUserId,
  });

  return (
    <PageLayout
      title="My Bookings"
      description="Manage upcoming trips, revisit past rentals, and track your points."
      goBack={false}
      actions={
        <Button asChild variant="outline" size="sm">
          <Link href="/select-vehicle">Book a car</Link>
        </Button>
      }
    >
      <Bookings data={data} isLoading={isLoading} isError={isError} />
    </PageLayout>
  );
}
