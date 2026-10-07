"use client";

export interface AdminBooking {
  id: string;
  user_id: string;
  car_id: string;
  start_date: string; // ISO date string
  end_date: string; // ISO date string
  total_price: number;
  status: string;
  created_at: string; // ISO date string
  name: string;
  email: string;
  vehicle_brand: string;
  vehicle_model: string;
}

export async function getAllBookings(): Promise<AdminBooking[]> {
  try {
    const res = await fetch("/api/admin/all-bookings", {
      method: "GET",
      cache: "no-store",
      credentials: "include",
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(
        errorText || `Failed to fetch bookings (status ${res.status})`
      );
    }

    const data = await res.json();
    return data;
  } catch (err) {
    console.error("Error fetching bookings:", err);
    throw err;
  }
}

export async function updateBookingStatus(bookingId: string, status: string) {
  const response = await fetch(
    `/api/admin/update-booking-status/${bookingId}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    }
  );

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error || "Failed to update booking status");
  }

  return response.json();
}
