"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Loader from "@/components/utility/Loader";
import { Booking } from "@/app/bookings/[bookingId]/actions";

interface Props {
  booking?: Booking;
  isLoading: boolean;
  error: unknown;
}

export default function BookingDetail({ booking, isLoading, error }: Props) {
  const router = useRouter();

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

  if (error || !booking) {
    return (
      <div className="py-6 space-y-6">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="gap-2 px-0"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <div className="text-center space-y-4 py-16">
          <h1 className="text-2xl font-bold text-destructive">
            Booking Not Found
          </h1>
          <p className="text-muted-foreground">
            We couldn&apos;t find the booking you&apos;re looking for.
          </p>
          <Button onClick={() => router.push("/bookings")}>
            View All Bookings
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="py-6 space-y-8">
      <Button variant="ghost" onClick={() => router.back()} className="gap-2">
        <ArrowLeft /> Back
      </Button>
      <div className="flex justify-between">
        <div className="space-y-2">
          <h1 className="text-lg font-semibold tracking-tight">
            Booking Details
          </h1>
          <p className="text-muted-foreground">ID: {booking.booking_id}</p>
        </div>
        <Badge
          variant={
            booking.status === "Confirmed"
              ? "default"
              : booking.status === "Pending"
              ? "secondary"
              : booking.status === "Cancelled"
              ? "destructive"
              : "outline"
          }
          className="capitalize text-sm h-fit px-3 py-1"
        >
          {booking.status}
        </Badge>
      </div>

      <Separator />

      {/* Content Grid */}
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
                      <span className="text-muted-foreground">
                        Transmission:
                      </span>{" "}
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
                  {new Intl.NumberFormat("en-CA", {
                    style: "currency",
                    currency: "CAD",
                  }).format(parseFloat(booking.price_per_day))}
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
            <h2 className="text-lg font-semibold">Rental Period</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-muted/80 rounded-lg">
              <div>
                <p className="text-sm text-muted-foreground">Pick-up</p>
                <p className=" font-semibold">
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
                <p className=" font-semibold">
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
              <p className="font-semibold">{booking.name}</p>
              <p className="text-sm text-muted-foreground">
                {booking.address} <br />
                {booking.city}, {booking.province} {booking.postal_code}
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
                <span>
                  {new Intl.NumberFormat("en-CA", {
                    style: "currency",
                    currency: "CAD",
                  }).format(parseFloat(booking.total_price))}
                </span>
              </div>
              <Separator />
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span>
                  {new Intl.NumberFormat("en-CA", {
                    style: "currency",
                    currency: "CAD",
                  }).format(parseFloat(booking.total_price))}
                </span>
              </div>
            </div>
          </section>

          {/* Actions */}
          <section className="space-y-3">
            {booking.status === "Confirmed" && (
              <Button
                variant="outline"
                className="w-full text-destructive border-destructive hover:bg-destructive hover:text-white"
              >
                Cancel Booking
              </Button>
            )}
            <Button variant="outline" className="w-full">
              Contact Support
            </Button>
            <Button className="w-full">Download Receipt</Button>
          </section>

          {/* Metadata */}
          <section className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Created:</span>
              <span>{new Date(booking.created_at).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Updated:</span>
              <span>{new Date(booking.updated_at).toLocaleDateString()}</span>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
