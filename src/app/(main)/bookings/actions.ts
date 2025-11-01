"use client";

export type Booking = {
  booking_id: string;
  id: string;
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
  branch_id: string;
  branch_name: string;
  city: string;
  province: string;
  postal_code: string | null;
  points_earned: string;
  points_redeemed: string;
};

export async function getAllBookingsByUserId(): Promise<Booking[]> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/bookings`);

  if (!res.ok) {
    throw new Error("Failed to fetch bookings");
  }

  return res.json();
}
