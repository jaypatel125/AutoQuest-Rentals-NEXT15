"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";

import Loader from "@/components/utility/Loader";
import { EVPromotionDialog } from "@/components/select-vehicle/EVPromotionDialog";
import { useSearchStore } from "@/lib/store/searchStore";
import { Cars as CarType } from "@/lib/database/table-types";
import { fetchVehicle } from "./actions";
import VehicleDetails from "@/components/select-vehicle-detail";

export default function VehicleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const vehicleId = params.vehicleId as string;
  const [dialogOpen, setDialogOpen] = useState(false);

  // Queries
  const {
    data: Car,
    isLoading,
    error,
  } = useQuery<CarType>({
    queryKey: ["vehicle", vehicleId],
    queryFn: () => fetchVehicle(vehicleId),
    enabled: !!vehicleId,
  });

  if (isLoading) {
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

  if (error || !Car) {
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
    <>
      <VehicleDetails
        car={Car}
        onRentNow={() => {
          if (Car.fuel_type === "Electric") {
            router.push(`/checkout`);
          }
          setDialogOpen(true);
          useSearchStore.getState().setSelectedCar(Car);
        }}
        onBack={() => router.back()}
      />

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
    </>
  );
}
