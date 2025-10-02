"use client";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";
import Loader from "@/components/utility/Loader";
import { ArrowLeft } from "lucide-react";
import Image from "next/image";
import type { Booking } from "@/app/bookings/actions";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

type Props = {
  data?: Booking[];
  isLoading: boolean;
  isError: boolean;
  router: AppRouterInstance;
};

export default function Bookings({ data, isLoading, isError, router }: Props) {
  if (isLoading) {
    return (
      <div className="w-full h-[80vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader />
          <h3 className="font-semibold text-xl">Fetching your bookings...</h3>
          <p>This won&apos;t take too long!</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="w-full h-[80vh] flex items-center justify-center">
        <p className="text-red-500">Something went wrong. Please try again.</p>
      </div>
    );
  }

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
        <div className="space-y-4">
          {data.map((booking) => (
            <Card key={booking.booking_id} className="overflow-hidden p-6">
              <div className="flex flex-col sm:flex-row">
                <Image
                  src={booking.image}
                  alt={`${booking.brand} ${booking.model}`}
                  height={100}
                  width={200}
                  className="object-cover rounded-lg shadow-md"
                />

                <div className="flex-1 p-4">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <h2 className="text-base font-semibold">
                        {booking.brand} {booking.model}
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        {booking.name}, {booking.city}, {booking.province}
                      </p>

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
                            <span>{booking.status}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 lg:flex-col">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          router.push(`/bookings/${booking.booking_id}`)
                        }
                      >
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
