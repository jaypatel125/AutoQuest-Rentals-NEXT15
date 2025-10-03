"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import getBooking, { Booking } from "./actions";
import BookingDetail from "@/components/booking-details";

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

  return (
    <BookingDetail booking={booking} isLoading={isLoading} error={error} />
  );
}
