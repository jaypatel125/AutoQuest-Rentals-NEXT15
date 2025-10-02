"use client";

export type Booking = {
  booking_id: string;
  user_id: string;
  car_id: string;
  start_date: string;
  end_date: string;
  total_price: string;
  status: string;
  created_at: string;
  updated_at: string;
  brand: string;
  model: string;
  image: string;
  price_per_day: string;
  name: string;
  address: string;
  city: string;
  province: string;
  postal_code: string | null;
};

export async function getAllBookingsByUserId(): Promise<Booking[]> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL}/api/get-bookings`,
    {
      method: "GET",
      credentials: "include",
      cache: "no-store",
    }
  );

  if (!res.ok) {
    throw new Error("Failed to fetch bookings");
  }

  return res.json();
}
