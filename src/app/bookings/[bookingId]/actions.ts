export default async function getBooking(bookingId: string) {
  const res = await fetch(`/api/bookings/${bookingId}`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to fetch booking");
  return res.json();
}
