"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import getBooking, { Booking } from "./actions";
import BookingDetail from "@/components/main/booking-details";
import PageLayout from "@/components/common/page-layout";

export default function BookingDetailPage() {
  const params = useParams();
  const bookingId = params.bookingId as string;

  const {
    data: booking,
    isLoading,
    error,
  } = useQuery<Booking>({
    queryKey: ["booking", bookingId],
    queryFn: () => getBooking(bookingId),
    enabled: !!bookingId,
  });

  if (isLoading) {
    return;
  }

  const description = `ID: ${booking!.booking_id}`;

  return (
    <PageLayout title="Booking Details" description={description}>
      <BookingDetail booking={booking} isLoading={isLoading} error={error} />
    </PageLayout>
  );
}
