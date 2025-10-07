export interface Booking {
  booking_id: string;
  user_id: string;
  car_id: string;
  start_date: string;
  end_date: string;
  total_price: string;
  booking_status: string;
  booking_created_at: string;
  booking_updated_at: string;
  car_branch_id: string;
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
  car_created_at: string;
  car_updated_at: string;
  branch_id: string;
  branch_name: string;
  branch_address: string;
  branch_city: string;
  branch_province: string;
  branch_postal_code: string | null;
  branch_created_at: string;
  branch_updated_at: string;
  points_earned: string;
  points_redeemed: string;
}

export default async function getBooking(bookingId: string): Promise<Booking> {
  const res = await fetch(`/api/get-bookings/${bookingId}`);
  if (!res.ok) throw new Error("Failed to fetch booking");
  return res.json();
}
