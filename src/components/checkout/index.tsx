"use client";

import { useSearchStore } from "@/lib/store/searchStore";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ArrowLeft, ArrowRight, Info } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useFormatPrice } from "@/lib/utils";
import { handleCheckout } from "@/app/checkout/actions";
import { IUser } from "../../../auth-client";

export default function Checkout({ user }: { user: IUser }) {
  const router = useRouter();
  const currentUser = user;
  const { formatPrice } = useFormatPrice();
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

  const rentalCharge = selectedCar.price_per_day * days;
  const serviceCharge = 15;
  const rewards =
    currentUser?.reward_points && currentUser.reward_points >= 1
      ? Math.min(1000, currentUser.reward_points)
      : 0;
  const rewardsDiscount = -(rewards / 10).toFixed(2);
  const tax = rentalCharge * 0.13;
  const amountDue =
    rentalCharge + serviceCharge + tax + Number(rewardsDiscount);
  const isEV =
    selectedCar.fuel_type && selectedCar.fuel_type.toLowerCase() === "electric";

  const pointsEarned = Math.floor(isEV ? amountDue * 2 : amountDue * 1);

  if (!currentUser) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-lg font-medium">
          You must be logged in to proceed to checkout.
        </p>
      </div>
    );
  }

  if (!startDate || !endDate) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-lg font-medium">
          Please select valid rental dates to proceed.
        </p>
      </div>
    );
  }

  if (!branch) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-lg font-medium">
          Please select a pick-up location to proceed.
        </p>
      </div>
    );
  }

  const onPayNow = async () => {
    try {
      const data = await handleCheckout(
        currentUser,
        selectedCar,
        startDate,
        endDate,
        branch
      );
      if (data?.url) router.push(data.url);
    } catch (err) {
      console.error("Checkout failed", err);
    }
  };

  return (
    <div className="space-y-8 my-6">
      {/* Back button */}
      <Button variant="ghost" onClick={() => router.back()}>
        <ArrowLeft /> Back
      </Button>

      <div className="grid md:grid-cols-2 gap-10 items-start">
        {/* Car image */}
        <Image
          src={selectedCar.image || "/car-placeholder.png"}
          alt={`${selectedCar.brand} ${selectedCar.model}`}
          width={700}
          height={400}
          className="rounded-lg shadow-md"
        />

        {/* Right column */}
        <div className="space-y-8">
          {/* Title */}
          <h1 className="text-lg font-semibold">
            {selectedCar.brand} {selectedCar.model}
          </h1>
          {selectedCar.fuel_type?.toLowerCase() === "electric" && (
            <div className="flex items-start gap-3 p-4 rounded-lg bg-green-50 border border-green-200 text-green-700">
              <Info className="w-5 h-5 mt-0.5 text-green-600" />
              <p className="text-sm leading-relaxed">
                Thank you for choosing an <strong>Electric Vehicle</strong>!
                You’ll earn <strong>2× reward points</strong> for this rental as
                part of our sustainability program.
              </p>
            </div>
          )}

          {/* Pick-up Location + Dates */}
          <div className="space-y-4 text-sm">
            <div>
              <span className="font-semibold">Pick-up Location:</span>{" "}
              {branch?.name || "--"}
              <div className="text-muted-foreground">{branch?.address}</div>
              <div className="text-muted-foreground">
                {branch?.city}, {branch?.province} {branch?.postal_code}
              </div>
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
          </div>

          <Separator />

          {/* Renter Information */}
          <div className="space-y-4 ">
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
          </div>

          <Separator />

          {/* Trip Cost */}
          <div className="space-y-4 gap-6 p-4 bg-muted/80 rounded-lg">
            <h3 className="text-lg font-semibold">Trip Cost</h3>
            <h2 className="text-md">
              Available Reward Points: {currentUser?.reward_points || 0} (10
              point = $1 discount)
            </h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Rental Charge</span>
                <span>{formatPrice(rentalCharge)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Service Charge</span>
                <span>{formatPrice(serviceCharge)}</span>
              </div>
              <div className="flex justify-between text-green-600 items-center">
                <div className="flex items-center gap-1">
                  <span>Rewards</span>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="w-4 h-4  cursor-pointer" />
                      </TooltipTrigger>
                      <TooltipContent side="top">
                        <p>
                          Maximum 1000 points can be redeemed per transaction.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <span>{formatPrice(rewardsDiscount)}</span>
              </div>

              <div className="flex justify-between text-muted-foreground">
                <span>HST (13%)</span>
                <span>{formatPrice(tax)}</span>
              </div>
              <Separator />
              <div className="flex justify-between text-base font-semibold">
                <span>Amount Due</span>
                <span>{formatPrice(amountDue)}</span>
              </div>
              <Separator />
              <div className="flex flex-col">
                <div className="flex justify-between text-blue-600">
                  <span>Reward Points You&apos;ll Earn</span>
                  <span>+{pointsEarned.toLocaleString()} pts</span>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Terms & Conditions */}

          <div className="space-y-4 gap-6 p-4 bg-muted/80 rounded-lg">
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
                        later than agreed.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </li>
              </ul>
            </TooltipProvider>
          </div>

          <Separator />

          {/* Actions */}
          <div className="flex gap-4">
            <Button variant="outline" className="flex-1">
              Cancel
            </Button>
            <Button className="flex-1" onClick={onPayNow}>
              Pay Now <ArrowRight className="ml-1" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
