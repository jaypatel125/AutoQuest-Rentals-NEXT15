"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";

import Loader from "@/components/utility/Loader";
import { EVPromotionDialog } from "@/components/main/select-vehicle/EVPromotionDialog";
import { useSearchStore } from "@/context/searchStore";
import { fetchVehicle } from "./actions";
import VehicleDetails, {
  type VehicleDetail,
} from "@/components/main/select-vehicle-details";
import MaxWidthWrapper from "@/components/utility/MaxWidthWrapper";
import Error from "@/components/utility/Error";
import type { Branches } from "@/lib/database/table-types";

export default function VehicleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const vehicleId = params.vehicleId as string;
  const [dialogOpen, setDialogOpen] = useState(false);

  const {
    data: car,
    isLoading,
    error,
  } = useQuery<VehicleDetail>({
    queryKey: ["vehicle", vehicleId],
    queryFn: () => fetchVehicle(vehicleId),
    enabled: !!vehicleId,
  });

  if (isLoading) {
    return <Loader title="Fetching vehicle details" />;
  }

  if (error || !car) {
    return <Error error="Vehicle not found" />;
  }

  const handleRent = () => {
    const store = useSearchStore.getState();
    store.setSelectedCar(car);
    // Pick-up happens at the car's own branch.
    if (car.branch_id) {
      store.setBranch({
        id: car.branch_id,
        name: car.branch_name ?? "",
        address: car.branch_address ?? null,
        city: car.branch_city ?? null,
        province: car.branch_province ?? null,
        postal_code: car.branch_postal_code ?? null,
      } as Branches);
    }
    if (car.fuel_type === "Electric") {
      router.push(`/checkout`);
      return;
    }
    setDialogOpen(true);
  };

  return (
    <>
      <MaxWidthWrapper className="py-10 md:py-14">
        <nav
          aria-label="Breadcrumb"
          className="mb-8 flex items-center gap-2 text-sm text-muted-foreground"
        >
          <Link href="/select-vehicle" className="hover:text-foreground">
            Browse cars
          </Link>
          <span aria-hidden>/</span>
          <span className="text-foreground">
            {car.brand} {car.model}
          </span>
        </nav>
        <VehicleDetails car={car} onRentNow={handleRent} />
      </MaxWidthWrapper>

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
