"use client";

import { useQuery } from "@tanstack/react-query";
import { getAllBookingsByUserId } from "./actions";
import Bookings from "@/components/main/bookings";
import PageLayout from "@/components/utility/page-layout";

export default function BookingsPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["get-bookings"],
    queryFn: getAllBookingsByUserId,
  });

  return (
    <PageLayout
      title="My Bookings"
      description="Manage and view your rental bookings"
    >
      <Bookings data={data} isLoading={isLoading} isError={isError} />
    </PageLayout>
  );
}
