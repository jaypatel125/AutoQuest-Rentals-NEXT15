// src/app/bookings/page.tsx
"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { getAllBookingsByUserId } from "./actions";
import Bookings from "@/components/bookings";

export default function BookingsPage() {
  const router = useRouter();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["get-bookings"],
    queryFn: getAllBookingsByUserId,
  });

  return (
    <Bookings
      data={data}
      isLoading={isLoading}
      isError={isError}
      router={router}
    />
  );
}
