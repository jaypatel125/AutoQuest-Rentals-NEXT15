import { useQuery } from "@tanstack/react-query";
import { getAllBookingsByUserId } from "./actions";
import Bookings from "@/components/main/bookings";

export default function BookingsPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["get-bookings"],
    queryFn: getAllBookingsByUserId,
  });

  return <Bookings data={data} isLoading={isLoading} isError={isError} />;
}
