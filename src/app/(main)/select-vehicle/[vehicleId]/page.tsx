"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";

import Loader from "@/components/utility/Loader";
import { EVPromotionDialog } from "@/components/main/select-vehicle/EVPromotionDialog";
import { useSearchStore } from "@/context/searchStore";
import { Cars as CarType } from "@/lib/database/table-types";
import { fetchVehicle } from "./actions";
import VehicleDetails from "@/components/main/select-vehicle-details";
import PageLayout from "@/components/utility/page-layout";
import Error from "@/components/utility/Error";

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
    return <Loader title="Fetching vehicle details" />;
  }

  if (error || !Car) {
    return <Error error="Vehicle not found" />;
  }

  return (
    <>
      <PageLayout
        title="Rent Now"
        description="
        Rent your perfect vehicle easily and quickly with our seamless booking process.
      "
      >
        <VehicleDetails
          car={Car}
          onRentNow={() => {
            useSearchStore.getState().setSelectedCar(Car);
            if (Car.fuel_type === "Electric") {
              router.push(`/checkout`);
              return;
            }

            setDialogOpen(true);
          }}
        />
      </PageLayout>

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
