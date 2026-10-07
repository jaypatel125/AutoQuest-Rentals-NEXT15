"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import getBooking, { Booking } from "./actions";
import BookingDetail from "@/components/main/booking-details";
import PageLayout from "@/components/utility/page-layout";

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

  const title = booking
    ? `${booking.brand} ${booking.model}`
    : "Booking Details";

  return (
    <PageLayout
      title={title}
      eyebrow="Booking Details"
      description={`Booking reference ${bookingId.slice(0, 8).toUpperCase()}`}
    >
      <BookingDetail booking={booking} isLoading={isLoading} error={error} />
    </PageLayout>
  );
}
