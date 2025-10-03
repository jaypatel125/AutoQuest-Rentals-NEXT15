export interface Booking {
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
  branch_id: string;
  brand: string;
  model: string;
  transmission: string;
  fuel_type: string;
  passenger_capacity: number;
  body_type: string;
  carbon_emissions: number;
  price_per_day: string;
  available: boolean;
  image: string;
  name: string;
  address: string;
  city: string;
  province: string;
  postal_code: string;
}

export default async function getBooking(bookingId: string): Promise<Booking> {
  const res = await fetch(`/api/get-bookings/${bookingId}`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to fetch booking");
  return res.json();
}
