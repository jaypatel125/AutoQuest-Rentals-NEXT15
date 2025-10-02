"use client";

import { useParams } from "next/navigation";

export default function BookingDetailPage() {
  const params = useParams();
  const bookingId = params.bookingId;
  console.log("Booking ID:", bookingId);

  return (
    <div>
      <h1>Booking Detail</h1>
      <p>Booking ID: {bookingId}</p>
      {/* Fetch booking details using bookingId */}
    </div>
  );
}
