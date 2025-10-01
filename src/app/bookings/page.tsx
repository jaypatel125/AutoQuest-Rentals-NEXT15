"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";
import useUserStore from "@/lib/store/useUserStore";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

type Booking = {
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
  name: string;
  address: string;
  city: string;
  province: string;
  postal_code: string | null;
};

async function getAllBookingsByUserId(userId: string): Promise<Booking[]> {
  const res = await fetch(`/api/get-bookings?userId=${userId}`);
  if (!res.ok) throw new Error("Failed to fetch bookings");
  return res.json();
}

export default function BookingsPage() {
  const { currentUser } = useUserStore();
  const currentUserId = currentUser?.id || "";
  const router = useRouter();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["get-bookings"],
    queryFn: () => getAllBookingsByUserId(currentUserId),
  });

  if (isLoading) return <p>Loading bookings...</p>;
  if (isError) return <p>Failed to load bookings.</p>;

  return (
    <div className="py-6 space-y-6">
      <Button variant="ghost" onClick={() => router.back()} className="gap-2">
        <ArrowLeft /> Back
      </Button>

      <div className="space-y-2">
        <h1 className="text-xl font-bold tracking-tight">My Bookings</h1>
        <p className="text-muted-foreground">
          Manage and view your rental bookings
        </p>
      </div>

      {data && data.length > 0 ? (
        <div className="space-y-4 ">
          {data.map((booking) => (
            <Card
              key={booking.id + booking.car_id}
              className="overflow-hidden p-6"
            >
              <div className="flex flex-col sm:flex-row">
                {/* Car Image */}

                <Image
                  src={booking.image}
                  alt={`${booking.brand} ${booking.model}`}
                  height={100}
                  width={200}
                  className="object-cover rounded-lg shadow-md"
                />

                {/* Booking Details */}
                <div className="flex-1 p-4">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                    {/* Car + Location */}
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <h2 className="text-base font-semibold">
                            {booking.brand} {booking.model}
                          </h2>
                          <p className="text-sm text-muted-foreground">
                            {booking.name}, {booking.city}, {booking.province}
                          </p>
                        </div>
                      </div>

                      {/* Dates + Price */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                        <div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              Pickup:
                            </span>
                            <span>
                              {new Date(booking.start_date).toLocaleDateString(
                                "en-US",
                                {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                }
                              )}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              Return:
                            </span>
                            <span>
                              {new Date(booking.end_date).toLocaleDateString(
                                "en-US",
                                {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                }
                              )}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              Status:
                            </span>
                            <span>
                              <span>{booking.status}</span>
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 lg:flex-col">
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="text-center space-y-2">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold">No bookings found</h3>
              <p className="text-muted-foreground">
                You haven&apos;t made any bookings yet. Start exploring our
                available cars.
              </p>
              <Button onClick={() => router.push("/")} className="mt-4">
                Browse Cars
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
