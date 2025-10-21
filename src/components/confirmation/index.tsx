"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import { Cars as CarType } from "@/lib/database/table-types";
import { useSearchStore } from "@/context/searchStore";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";
import { Label, Separator } from "@radix-ui/react-dropdown-menu";
import {
  CheckCircle,
  Calendar,
  CalendarDays,
  ListChecks,
  Home,
  CarIcon,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import Loader from "../utility/Loader";
import { useEffect } from "react";
import { formatPrice } from "@/lib/utils";

interface ConfirmationDetailsProps {
  status: string;
  customerEmail: string;
  amountTotal: number | null;
  currency: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  metadata: Record<string, any>;
}

// Query function to fetch vehicle details
async function fetchVehicle(id: string) {
  const res = await fetch(`/api/vehicles/${id}`);
  if (!res.ok) throw new Error("Failed to fetch vehicle details");
  return res.json();
}

export default function ConfirmationDetails({
  status,
  customerEmail,
  amountTotal,
  currency,
  metadata,
}: ConfirmationDetailsProps) {
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

  const queryClient = useQueryClient();

  useEffect(() => {
    if (status === "complete" || status === "paid") {
      queryClient.invalidateQueries({ queryKey: ["get-bookings"] });
      queryClient.invalidateQueries({ queryKey: ["booking"] });
    }
  }, [status, queryClient]);

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

  let fuelType = "";
  let isEV = false;
  let redeemedPoints = 0;
  let totalPrice = 0;
  let pointsEarned = 0;

  if (Car) {
    fuelType = Car.fuel_type?.toLowerCase() || "";
    isEV = fuelType === "electric";
  }

  redeemedPoints = Number(metadata.redeemedPoints ?? 0);
  totalPrice = Number(metadata.total ?? 0);
  pointsEarned = Math.floor(isEV ? totalPrice * 2 : totalPrice * 1);

  const rewardMessage = isEV
    ? {
        text: (
          <>
            Thank you for choosing an <strong>Electric Vehicle</strong>! You’ve
            earned <strong>2× reward points</strong> on this booking.
          </>
        ),
        style: "bg-green-50 border border-green-200 text-green-700",
      }
    : {
        text: (
          <>
            You’ve earned standard reward points for this rental. Next time,
            rent an EV and earn <strong>2× rewards!</strong>{" "}
          </>
        ),
        style: "bg-blue-50 border border-blue-200 text-blue-700",
      };

  // ====== RETURN JSX ======
  return (
    <section id="success" className="space-y-8 my-8">
      {/* Booking Confirmation */}
      <Card className="border-l-4 border-l-green-500">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-6 w-6 text-green-500" />
            <CardTitle className="text-xl">Booking Confirmed</CardTitle>
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
      {isLoading ? (
        <div className="w-full h-40 flex items-center justify-center">
          <Loader />
        </div>
      ) : error ? (
        <div className="text-center py-10">
          <h2 className="text-xl font-bold">Vehicle not found</h2>
          <p className="text-muted-foreground mt-2">
            Try going back and selecting a different vehicle.
          </p>
        </div>
      ) : Car ? (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <CarIcon className="h-5 w-5" />
              <CardTitle className="text-lg">Car Details</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-6">
              {/* Image */}
              <div className="relative w-full md:w-48 h-32 rounded-lg overflow-hidden flex-shrink-0">
                <Image
                  src={Car.image || "/car-placeholder.png"}
                  alt={`${Car.brand} ${Car.model}`}
                  fill
                  className="object-cover"
                />
              </div>

              {/* Info */}
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h4 className="font-semibold text-lg">
                    {Car.brand} {Car.model}
                  </h4>
                </div>

                <div className="space-y-2">
                  {[
                    [
                      "Passenger Capacity",
                      Car.passenger_capacity
                        ? `${Car.passenger_capacity} people`
                        : "Not specified",
                    ],
                    ["Body Type", Car.body_type || "Not specified"],
                    ["Transmission", Car.transmission || "Not specified"],
                    ["Fuel Type", Car.fuel_type || "Not specified"],
                  ].map(([label, value]) => (
                    <div key={label} className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        {label}:
                      </span>
                      <span className="text-sm font-medium capitalize">
                        {value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {/* Booking Details */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Booking Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Branch + Price */}
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
                {formatPrice(Number(amountTotal) / 100)}
              </p>
            </div>
          </div>

          <Separator />

          {/* Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              ["Pickup Date", metadata.startDate],
              ["Return Date", metadata.endDate],
            ].map(([label, date]) => (
              <div key={label} className="space-y-1">
                <Label className="text-sm font-medium text-muted-foreground">
                  {label}
                </Label>
                <div className="flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-muted-foreground" />
                  <span className="text-foreground">
                    {new Date(date as string).toLocaleDateString("en-US", {
                      weekday: "short",
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Rewards Summary */}
      {Car && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Rewards Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {redeemedPoints > 0 && (
              <div className="flex justify-between text-muted-foreground">
                <span>Redeemed Points:</span>
                <span className="text-red-600 font-medium">
                  -{redeemedPoints.toLocaleString()} pts
                </span>
              </div>
            )}

            <div className="flex justify-between text-muted-foreground">
              <span>Earned Points:</span>
              <span className="text-green-600 font-medium">
                +{pointsEarned.toLocaleString()} pts
              </span>
            </div>

            <div className={`mt-3 p-3 rounded-md ${rewardMessage.style}`}>
              {rewardMessage.text}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
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
