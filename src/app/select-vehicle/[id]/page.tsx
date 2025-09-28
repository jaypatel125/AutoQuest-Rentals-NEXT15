"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Fuel, CarFront } from "lucide-react";
import Image from "next/image";
import { EVPromotionDialog } from "@/components/select-vehicle/EVPromotionDialog";
import { Cars as CarType } from "@/lib/database/table-types";
import { useParams, useRouter } from "next/navigation";
import { useSearchStore } from "@/lib/store/searchStore";
import Loader from "@/components/utility/Loader";

// query function to fetch vehicle details
async function fetchVehicle(id: string) {
  const res = await fetch(`/api/get-vehicle`, {
    headers: { "x-car-id": id },
  });
  if (!res.ok) {
    throw new Error("Failed to fetch vehicle details");
  }
  return res.json();
}

export default function VehicleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const vehicleId = params.id as string;
  const [dialogOpen, setDialogOpen] = useState(false);

  // Queries
  const {
    data: Car,
    isLoading: carLoading,
    error: carError,
  } = useQuery<CarType>({
    queryKey: ["vehicle", vehicleId],
    queryFn: () => fetchVehicle(vehicleId),
    enabled: !!vehicleId,
  });

  if (carLoading) {
    return (
      <div className="w-full h-[80vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader />
          <h3 className="font-semibold text-xl">Fetching vehicle details...</h3>
          <p>This won&apos;t take too long!</p>
        </div>
      </div>
    );
  }

  if (carError || !Car) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold">Vehicle not found</h2>
        <p className="text-muted-foreground mt-2">
          Try going back and selecting a different vehicle.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="space-y-6 my-6">
        <Button
          variant="ghost"
          onClick={() => {
            router.back();
          }}
        >
          ← Back
        </Button>

        <div className="grid md:grid-cols-2 gap-10 items-start">
          <Image
            src={Car.image || "/car-placeholder.png"}
            alt={`${Car.brand} ${Car.model}`}
            width={700}
            height={400}
            className="rounded-lg shadow-md"
          />

          <div className=" space-y-8">
            <h1 className="text-3xl font-bold">
              {Car.brand} {Car.model}
            </h1>
            <div className="">
              {" "}
              <span className="font-semibold text-lg">
                ${Car.price_per_day}
                <span className="text-sm font-normal">/day</span>
              </span>
            </div>

            <Card>
              <CardContent className="text-sm text-muted-foreground">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <p>
                      <CarFront className="inline h-4 w-4 mr-2" />
                      {Car.body_type}
                    </p>
                    <p>
                      <CarFront className="inline h-4 w-4 mr-2" />
                      {Car.carbon_emissions} g/km CO2
                    </p>
                    <p>
                      <Users className="inline h-4 w-4 mr-2" />
                      {Car.passenger_capacity} Passengers
                    </p>
                  </div>

                  <div className="space-y-2">
                    <p>
                      <CarFront className="inline h-4 w-4 mr-2" />
                      {Car.transmission}
                    </p>
                    <p>
                      <Fuel className="inline h-4 w-4 mr-2" />
                      {Car.fuel_type}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex items-center justify-between gap-4">
              <Button
                className="whitespace-nowrap flex-1"
                onClick={(e) => {
                  e.preventDefault();
                  if (Car.fuel_type === "Electric") {
                    router.push(`/checkout`);
                  }
                  setDialogOpen(true);
                  useSearchStore.getState().setSelectedCar(Car);
                }}
              >
                Rent Now →
              </Button>
            </div>
          </div>
        </div>
      </div>

      <EVPromotionDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onCheckoutEV={() => {
          setDialogOpen(false);
          router.push(`/select-vehicle?fuelTypes=Electric`, { scroll: false });
        }}
        onContinue={() => {
          setDialogOpen(false);
          router.push("/checkout");
        }}
      />
    </div>
  );
}
