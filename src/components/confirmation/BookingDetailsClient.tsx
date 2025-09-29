"use client";

import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import { Cars as CarType } from "@/lib/database/table-types";
import { useSearchStore } from "@/lib/store/searchStore";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";
import { Label, Separator } from "@radix-ui/react-dropdown-menu";
import {
  CheckCircle,
  Loader2,
  Calendar,
  CalendarDays,
  ListChecks,
  Home,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";

interface BookingDetailsClientProps {
  status: string;
  customerEmail: string;
  amountTotal: number | null;
  currency: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  metadata: Record<string, any>;
}

async function fetchVehicle(id: string) {
  const res = await fetch(`/api/get-vehicle`, {
    headers: { "x-Car-id": id },
  });
  if (!res.ok) {
    throw new Error("Failed to fetch vehicle details");
  }
  return res.json();
}

export default function BookingDetailsClient({
  status,
  customerEmail,
  amountTotal,
  currency,
  metadata,
}: BookingDetailsClientProps) {
  const { branch } = useSearchStore();
  const router = useRouter();
  const {
    data: Car,
    isLoading,
    error,
  } = useQuery<CarType>({
    queryKey: ["vehicle", metadata?.carId],
    queryFn: () => fetchVehicle(metadata.carId),
    enabled: !!metadata?.carId,
  });

  if (status !== "complete") {
    return (
      <p>
        We appreciate your business! A confirmation email will be sent to{" "}
        {customerEmail || "your email"}.
      </p>
    );
  }

  const branchMatch =
    branch &&
    (metadata.branch === branch.id || metadata.branch === branch.name);

  return (
    <section id="success" className="space-y-8 my-8">
      <Card className="border-l-4 border-l-green-500">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-6 w-6 text-green-500" />
            <CardTitle className="text-2xl">Booking Confirmed</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Thank you for your booking! A confirmation email has been sent to{" "}
            <span className="font-semibold text-foreground">
              {customerEmail || "your email"}
            </span>
            .
          </p>
        </CardContent>
      </Card>

      {/* Car Details */}
      {Car && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Car Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 items-start">
              <div className="relative w-40 h-28 rounded-lg overflow-hidden flex-shrink-0">
                <Image
                  src={Car.image}
                  alt={`${Car.brand} ${Car.model}`}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div>
                    <h4 className="font-semibold text-lg">
                      {Car.brand} {Car.model}
                    </h4>
                    <p className="text-sm text-muted-foreground capitalize">
                      {Car.body_type || "Not specified"}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        Transmission:
                      </span>
                      <span className="text-sm font-medium capitalize">
                        {Car.transmission || "Not specified"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        Fuel Type:
                      </span>
                      <span className="text-sm font-medium capitalize">
                        {Car.fuel_type || "Not specified"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      Passenger Capacity:
                    </span>
                    <span className="text-sm font-medium">
                      {Car.passenger_capacity
                        ? `${Car.passenger_capacity} people`
                        : "Not specified"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      Carbon Emissions:
                    </span>
                    <span className="text-sm font-medium">
                      {Car.carbon_emissions
                        ? `${Car.carbon_emissions} g/km`
                        : "Not specified"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      Price per Day:
                    </span>
                    <span className="text-sm font-medium">
                      {new Intl.NumberFormat("en-CA", {
                        style: "currency",
                        currency: currency.toUpperCase(),
                      }).format(Car.price_per_day)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      Availability:
                    </span>
                    <span className="capitalize">
                      {Car.available ? "Available" : "Not Available"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      {/* Booking Details */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Booking Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label className="text-sm font-medium text-muted-foreground">
                Branch
              </Label>
              <p className="text-foreground">
                {branchMatch
                  ? `${branch?.name}, ${branch?.address}, ${branch?.city}, ${branch?.province}`
                  : metadata.branch}
              </p>
            </div>

            <div className="space-y-1">
              <Label className="text-sm font-medium text-muted-foreground">
                Total Price
              </Label>
              <p className="font-semibold text-foreground">
                {new Intl.NumberFormat("en-CA", {
                  style: "currency",
                  currency: currency.toUpperCase(),
                }).format((amountTotal ?? 0) / 100)}
              </p>
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label className="text-sm font-medium text-muted-foreground">
                Pickup Date
              </Label>
              <div className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-muted-foreground" />
                <span className="text-foreground">
                  {new Date(metadata.startDate).toLocaleDateString("en-US", {
                    weekday: "short",
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-sm font-medium text-muted-foreground">
                Return Date
              </Label>
              <div className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-muted-foreground" />
                <span className="text-foreground">
                  {new Date(metadata.endDate).toLocaleDateString("en-US", {
                    weekday: "short",
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button
          onClick={() => router.push("/bookings")}
          className="flex items-center gap-2"
        >
          <ListChecks className="h-4 w-4" />
          View My Bookings
        </Button>
        <Button
          onClick={() => router.push("/")}
          variant="outline"
          className="flex items-center gap-2"
        >
          <Home className="h-4 w-4" />
          Back to Home
        </Button>
      </div>
    </section>
  );
}
