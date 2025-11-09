"use client";

import { Button } from "@/components/ui/button";
import Loader from "@/components/utility/Loader";
import Image from "next/image";
import type { Booking } from "@/app/(main)/bookings/actions";
import { Separator } from "../../ui/separator";
import { Calendar } from "lucide-react";
import { formatDate, formatPrice } from "@/lib/utils";
import { useRouter } from "next/navigation";
import Error from "@/components/utility/Error";

type Props = {
  data?: Booking[];
  isLoading: boolean;
  isError: boolean;
};

export default function Bookings({ data, isLoading, isError }: Props) {
  const router = useRouter();
  if (isLoading) {
    return <Loader title="Fetching your bookings" />;
  }

  if (isError) {
    return <Error error="Failed to load bookings. Please try again." />;
  }

  return (
    <div>
      {data && data.length > 0 ? (
        <div className="space-y-4">
          {data.map((booking) => (
            <div key={booking.booking_id}>
              <div className="py-6">
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Car Image */}
                  <div className="flex-shrink-0">
                    <Image
                      src={booking.image}
                      alt={`${booking.brand} ${booking.model}`}
                      width={200}
                      height={120}
                      className="min-w-full lg:h-full object-cover rounded-lg shadow-md"
                    />
                  </div>

                  {/* Booking Details */}
                  <div className="w-[100%]">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {booking.brand} {booking.model}
                    </h3>
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 lg:gap-6 gap-2">
                      {/* Car & Location Info */}
                      <div className="space-y-3">
                        <p className="text-sm text-gray-600 mt-1">
                          {booking.branch_name}, {booking.city},{" "}
                          {booking.province}
                        </p>

                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <span className="text-gray-600">Pickup:</span>
                            <span className="font-medium">
                              {formatDate(booking.start_date)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <span className="text-gray-600">Return:</span>
                            <span className="font-medium">
                              {formatDate(booking.end_date)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Booking Status & Financial Info */}
                      <div className="space-y-3">
                        <div className="flex flex-col gap-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">
                              Status:
                            </span>
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                booking.status === "Confirmed"
                                  ? "bg-green-100 text-green-800"
                                  : booking.status === "Pending"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : booking.status === "Cancelled"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-blue-100 text-blue-800"
                              }`}
                            >
                              {booking.status.charAt(0).toUpperCase() +
                                booking.status.slice(1)}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">
                              Booked on:
                            </span>
                            <span className="text-sm text-gray-600">
                              <span>
                                {new Date(
                                  booking.created_at
                                ).toLocaleDateString("en-US", {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                })}
                              </span>
                            </span>
                          </div>

                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">
                              Total Price:
                            </span>
                            <span className="font-semibold text-gray-900">
                              {formatPrice(Number(booking.total_price))}
                            </span>
                          </div>

                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">
                              Price per day:
                            </span>
                            <span className="text-gray-900">
                              {formatPrice(Number(booking.price_per_day))}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Points & Actions */}
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">
                              Points Earned:
                            </span>
                            <span className="font-semibold text-green-600">
                              +{booking.points_earned}
                            </span>
                          </div>

                          {booking.points_redeemed &&
                            parseInt(booking.points_redeemed) > 0 && (
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">
                                  Points Redeemed:
                                </span>
                                <span className="font-semibold text-orange-600">
                                  -{booking.points_redeemed}
                                </span>
                              </div>
                            )}
                        </div>

                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            iconType="view"
                            onClick={() =>
                              router.push(`/bookings/${booking.booking_id}`)
                            }
                            className="flex-1"
                          >
                            View Details
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <Separator className="mt-4" />
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
          <Calendar className="h-12 w-12 text-muted-foreground mx-auto" />
          <h3 className="text-lg font-semibold">No bookings found</h3>
          <p className="text-muted-foreground">
            You haven&apos;t made any bookings yet. Start exploring our
            available cars.
          </p>
          <Button
            iconType="list"
            onClick={() => router.push("/")}
            className="mt-2"
          >
            Browse Cars
          </Button>
        </div>
      )}
    </div>
  );
}
