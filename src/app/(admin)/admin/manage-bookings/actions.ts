"use client";

export async function getAllBookings() {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/admin/all-bookings`,
      {
        method: "GET",
        cache: "no-store",
        credentials: "include",
      }
    );

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
