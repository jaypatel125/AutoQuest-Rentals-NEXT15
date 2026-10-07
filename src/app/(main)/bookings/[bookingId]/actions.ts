export interface Booking {
  booking_id: string;
  user_id: string;
  car_id: string;
  start_date: string;
  end_date: string;
  sub_total: string | null;
  total_price: string;
  booking_status: string;
  booking_created_at: string;
  booking_updated_at: string;
  cancelled_at: string | null;
  refund_amount: string | null;
  paid_online: boolean;
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
  branch_id: string;
  branch_name: string;
  branch_address: string;
  branch_city: string;
  branch_province: string;
  branch_postal_code: string | null;
  points_earned: string;
  points_redeemed: string;
}

export default async function getBooking(bookingId: string): Promise<Booking> {
  const res = await fetch(`/api/bookings/${encodeURIComponent(bookingId)}`);
  if (!res.ok) throw new Error("Failed to fetch booking");
  return res.json();
}

export interface CancelResult {
  success: boolean;
  refund: number;
  fee: number;
  refundedAutomatically: boolean;
}

export async function cancelBooking(bookingId: string): Promise<CancelResult> {
  const res = await fetch(`/api/bookings/${encodeURIComponent(bookingId)}`, {
    method: "PATCH",
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data?.error || "Failed to cancel booking");
  }
  return data;
}
