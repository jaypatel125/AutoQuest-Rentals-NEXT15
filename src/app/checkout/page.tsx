"use client";

import { useSearchStore } from "@/lib/store/searchStore";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Info } from "lucide-react";
import useUserStore from "@/lib/store/useUserStore";
import { Separator } from "@/components/ui/separator";

export default function CheckoutPage() {
  const router = useRouter();
  const { currentUser } = useUserStore();
  const { startDate, endDate, selectedCar, branch } = useSearchStore();

  if (!selectedCar) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-lg font-medium">
          No car selected. Please go back and choose a vehicle.
        </p>
      </div>
    );
  }

  const start = startDate ? new Date(startDate) : null;
  const end = endDate ? new Date(endDate) : null;
  const days =
    start && end
      ? Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
      : 1;

  const rentalCharge = selectedCar.pricePerDay * days;
  const serviceCharge = 15;
  const rewards =
    selectedCar.fuelType === "Electric" ? rentalCharge * 2 : rentalCharge;
  const rewardsDiscount = -(rewards / 100).toFixed(2);
  const tax = rentalCharge * 0.13;
  const amountDue =
    rentalCharge + serviceCharge + tax + Number(rewardsDiscount);
  const handleCheckout = async () => {
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amountDue,
          currentUser,
          selectedCar,
          startDate,
          endDate,
          branch,
        }),
      });

      const data = await res.json();
      if (data.url) {
        window.location.href = data.url; // redirect to stripe
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="space-y-8">
      {/* Back button */}
      <Button variant="ghost" onClick={() => router.back()}>
        ← Back
      </Button>

      <div className="grid md:grid-cols-2 gap-10 items-start">
        {/* Car image */}
        <Image
          src={selectedCar.images || "/car-placeholder.png"}
          alt={`${selectedCar.brand} ${selectedCar.model}`}
          width={700}
          height={400}
          className="rounded-lg shadow-md"
        />

        {/* Right column */}
        <div className="space-y-6">
          {/* Title */}
          <h1 className="text-3xl font-bold">
            {selectedCar.brand} {selectedCar.model}
          </h1>

          {/* City + Dates */}
          <Card>
            <CardContent className="text-sm space-y-3">
              <div className="flex flex-col space-y-1">
                <span>
                  <span className="font-semibold">Pick-up Location:</span>{" "}
                  {branch?.name || "--"}
                </span>
                <span className="text-muted-foreground">{branch?.address}</span>
                <span className="text-muted-foreground">
                  {branch?.city}, {branch?.province} {branch?.postalCode}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="block font-medium">Pick-up Date</span>
                  <span className="text-muted-foreground">
                    {start ? format(start, "dd/MM/yyyy") : "--"}
                  </span>
                </div>
                <div>
                  <span className="block font-medium">Drop-off Date</span>
                  <span className="text-muted-foreground">
                    {end ? format(end, "dd/MM/yyyy") : "--"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Renter Information */}
          <Card>
            <CardContent className="space-y-4">
              <h3 className="text-lg font-semibold">Renter Information</h3>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-muted-foreground">
                    Full Name
                  </label>
                  <Input
                    type="text"
                    placeholder="John Doe"
                    defaultValue={currentUser?.name}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-muted-foreground">
                    Email Address
                  </label>
                  <Input type="email" defaultValue={currentUser?.email} />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Trip Cost */}
          <Card>
            <CardContent className="space-y-3">
              <h3 className="text-lg font-semibold">Trip Cost</h3>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Rental Charge</span>
                <span>${rentalCharge.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Service Charge</span>
                <span>${serviceCharge.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-green-600">
                <span>Rewards</span>
                <span>{rewardsDiscount}</span>
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>HST (13%)</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <Separator />
              <div className="flex justify-between text-base font-semibold">
                <span>Amount Due</span>
                <span>${amountDue.toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Terms & Conditions */}
          <Card>
            <CardContent className="space-y-4">
              <h3 className="text-lg font-semibold">Terms & Conditions</h3>
              <TooltipProvider>
                <ul className="list-disc pl-6 space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    Minimum age requirement: 21
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-4 w-4 text-muted-foreground cursor-pointer" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>
                          Drivers must be at least 21 years old with a valid
                          licence.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </li>
                  <li className="flex items-center gap-2">
                    Fuel policy: Same-to-same
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-4 w-4 text-muted-foreground cursor-pointer" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>
                          Return the car with the same fuel level as at pick-up.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </li>
                  <li className="flex items-center gap-2">
                    Insurance coverage required
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-4 w-4 text-muted-foreground cursor-pointer" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>
                          Basic insurance is mandatory. Additional coverage
                          optional.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </li>
                  <li className="flex items-center gap-2">
                    Late return charges apply
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-4 w-4 text-muted-foreground cursor-pointer" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>
                          Extra charges will apply if the vehicle is returned
                          later than the agreed time.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </li>
                </ul>
              </TooltipProvider>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-4">
            <Button variant="outline" className="flex-1">
              Cancel
            </Button>
            <Button className="flex-1" onClick={handleCheckout}>
              Pay Now →
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
