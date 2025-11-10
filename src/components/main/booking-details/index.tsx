"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";
import Loader from "@/components/utility/Loader";
import {
  Booking,
  cancelBooking,
} from "@/app/(main)/bookings/[bookingId]/actions";
import { formatPrice } from "@/lib/utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import Error from "@/components/utility/Error";

interface Props {
  booking?: Booking;
  isLoading: boolean;
  error: unknown;
}

export default function BookingDetail({ booking, isLoading, error }: Props) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { mutate: cancelBookingMutate, isPending } = useMutation({
    mutationFn: () => cancelBooking(booking!.booking_id),
    onSuccess: () => {
      toast({
        title: "Booking Cancelled",
        description: "The booking has been successfully cancelled.",
      });
      queryClient.invalidateQueries({
        queryKey: ["booking", booking?.booking_id],
      });
      queryClient.invalidateQueries({ queryKey: ["get-bookings"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return <Loader title="Fetching your bookings" />;
  }

  if (error || !booking) {
    return <Error error="Failed to load booking details. Please try again." />;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Main Column */}
      <div className="lg:col-span-2 space-y-8">
        {/* Vehicle Info */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold">Vehicle Information</h2>
          <div className="flex flex-col md:flex-row gap-6">
            <div className="md:w-1/2">
              <Image
                src={booking.image}
                alt={`${booking.brand} ${booking.model}`}
                className="rounded-lg object-cover w-full h-auto"
                width={500}
                height={300}
              />
            </div>
            <div className="md:w-1/2 space-y-4">
              <h3 className="text-lg font-semibold">
                {booking.brand} {booking.model}
              </h3>
              <p className="text-muted-foreground">{booking.body_type}</p>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p>
                    <span className="text-muted-foreground">Transmission:</span>{" "}
                    {booking.transmission}
                  </p>
                  <p>
                    <span className="text-muted-foreground">Fuel:</span>{" "}
                    {booking.fuel_type}
                  </p>
                </div>
                <div>
                  <p>
                    <span className="text-muted-foreground">Passengers:</span>{" "}
                    {booking.passenger_capacity}
                  </p>
                  <p>
                    <span className="text-muted-foreground">Emissions:</span>{" "}
                    {booking.carbon_emissions} g/km
                  </p>
                </div>
              </div>

              <p className="text-lg font-semibold">
                {formatPrice(Number(booking.price_per_day))}
                <span className="text-sm font-normal text-muted-foreground">
                  {" "}
                  / day
                </span>
              </p>
            </div>
          </div>
        </section>

        <Separator />

        {/* Rental Period */}
        <section className="space-y-4">
          <div className="flex justify-between items-start">
            <h2 className="text-lg font-semibold">Rental Period</h2>
            <Badge
              variant={
                booking.booking_status === "Confirmed"
                  ? "default"
                  : booking.booking_status === "Pending"
                  ? "secondary"
                  : booking.booking_status === "Cancelled"
                  ? "destructive"
                  : "outline"
              }
              className="capitalize text-sm h-fit px-3 py-1"
            >
              {booking.booking_status}
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-muted/80 rounded-lg">
            <div>
              <p className="text-sm text-muted-foreground">Pick-up</p>
              <p className="font-semibold">
                {new Date(booking.start_date).toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Return</p>
              <p className="font-semibold">
                {new Date(booking.end_date).toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>
        </section>

        <Separator />

        {/* Pickup Location */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold">Pick-up Location</h2>
          <div className="p-4 bg-muted/80 rounded-lg space-y-2">
            <p className="font-semibold">{booking.branch_name}</p>
            <p className="text-sm text-muted-foreground">
              {booking.branch_address} <br />
              {booking.branch_city}, {booking.branch_province}{" "}
              {booking.branch_postal_code}
            </p>
          </div>
        </section>
      </div>

      {/* Sidebar */}
      <aside className="space-y-8">
        {/* Price Summary */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold">Price Summary</h2>
          <div className="space-y-3 p-4 border rounded-lg">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                Daily rate × duration
              </span>
              <span>{formatPrice(Number(booking.total_price))}</span>
            </div>
            <Separator />
            <div className="flex justify-between text-lg font-bold">
              <span>Total</span>
              <span>{formatPrice(Number(booking.total_price))}</span>
            </div>
          </div>
        </section>

        {/*  Rewards Summary */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold">Rewards Summary</h2>
          <div className="space-y-3 p-4 border rounded-lg ">
            <div className="flex justify-between text-sm text-green-600">
              <span>Points Earned:</span>
              <span>
                +{parseInt(booking.points_earned).toLocaleString()} pts
              </span>
            </div>
            {parseInt(booking.points_redeemed) > 0 && (
              <div className="flex justify-between text-sm text-red-600">
                <span>Points Redeemed:</span>
                <span>
                  -{parseInt(booking.points_redeemed).toLocaleString()} pts
                </span>
              </div>
            )}
            <Separator />
            <div className="flex justify-between font-semibold text-sm">
              <span>Net Points:</span>
              <span>
                {(
                  parseInt(booking.points_earned) -
                  parseInt(booking.points_redeemed)
                ).toLocaleString()}{" "}
                pts
              </span>
            </div>

            {/* Bonus message for EVs */}
            {booking.fuel_type?.toLowerCase() === "electric" ? (
              <div className="mt-3 p-3 rounded-md bg-green-50 border border-green-200 text-green-700 text-sm">
                Thank you for choosing an <strong>Electric Vehicle</strong>! You
                earned <strong>2× rewards</strong> for this booking.
              </div>
            ) : (
              <div className="mt-3 p-3 rounded-md bg-blue-50 border border-blue-200 text-blue-700 text-sm">
                Earn <strong>2× rewards</strong> on your next booking by
                choosing an
              </div>
            )}
          </div>
        </section>

        {/* Actions */}
        <section className="space-y-3">
          {booking.booking_status === "Confirmed" && (
            <Button
              variant="outline"
              className="w-full text-destructive border-destructive hover:bg-destructive hover:text-white"
              onClick={() => cancelBookingMutate()}
              loading={isPending}
              iconType="close"
            >
              {isPending ? "Cancelling..." : "Cancel Booking"}
            </Button>
          )}
        </section>

        {/* Metadata */}
        <section className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Created:</span>
            <span>
              {new Date(booking.booking_created_at).toLocaleDateString()}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Updated:</span>
            <span>
              {new Date(booking.booking_updated_at).toLocaleDateString()}
            </span>
          </div>
        </section>
      </aside>
    </div>
  );
}
