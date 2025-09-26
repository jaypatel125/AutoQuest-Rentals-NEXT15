"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Fuel, CarFront } from "lucide-react";
import Image from "next/image";
import { EVPromotionDialog } from "@/components/select-vehicle/EVPromotionDialog";
import { Car as CarType } from "@/lib/database/table-types";
import { useParams, useRouter } from "next/navigation";
import { useSearchStore } from "@/lib/store/searchStore";

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
    return <p className="text-center py-20">Loading vehicle details...</p>;
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
      <div className="space-y-6">
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
            src={Car.images || "/car-placeholder.png"}
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
                ${Car.pricePerDay}
                <span className="text-sm font-normal">/day</span>
              </span>
            </div>

            <Card>
              <CardContent className="text-sm text-muted-foreground">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <p>
                      <CarFront className="inline h-4 w-4 mr-2" />
                      {Car.bodyType}
                    </p>
                    <p>
                      <CarFront className="inline h-4 w-4 mr-2" />
                      {Car.carbonEmissions} g/km CO2
                    </p>
                    <p>
                      <Users className="inline h-4 w-4 mr-2" />
                      {Car.passengerCapacity} Passengers
                    </p>
                  </div>

                  <div className="space-y-2">
                    <p>
                      <CarFront className="inline h-4 w-4 mr-2" />
                      {Car.transmission}
                    </p>
                    <p>
                      <Fuel className="inline h-4 w-4 mr-2" />
                      {Car.fuelType}
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
                  if (Car.fuelType === "Electric") {
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
        carbonSaved={4.7}
        rewards={47}
      />
    </div>
  );
}
