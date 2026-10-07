"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter, useParams } from "next/navigation";
import { Branches } from "@/lib/database/table-types";
import {
  CarWithBranchDetails,
  replaceVehiclePhoto,
  updateVehicle,
} from "@/app/(admin)/admin/manage-vehicles/[vehicleId]/actions";
import { useToast } from "@/hooks/use-toast";
import {
  VehicleForm,
  type VehicleFormValues,
} from "../vehicle-form/VehicleForm";

export default function VehicleManage({
  vehicle,
  branches,
}: {
  vehicle: CarWithBranchDetails;
  branches: Branches[];
}) {
  const router = useRouter();
  const params = useParams();
  const vehicleId = params["vehicleId"] as string;
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["vehicle", vehicleId] });
    queryClient.invalidateQueries({ queryKey: ["vehicles"] });
  };

  const mutation = useMutation({
    mutationFn: (values: VehicleFormValues) =>
      updateVehicle(vehicleId, { ...values }),
    onSuccess: () => {
      toast({
        title: "Vehicle Updated",
        description: "The vehicle details have been updated successfully.",
      });
      invalidate();
      router.push("/admin/manage-vehicles");
    },
    onError: (err: Error) => {
      toast({
        title: "Could not update vehicle",
        description: err.message,
        variant: "destructive",
      });
    },
  });

  const photoMutation = useMutation({
    mutationFn: (file: File) => replaceVehiclePhoto(vehicleId, file),
    onSuccess: () => {
      toast({
        title: "Photo Replaced",
        description: "The vehicle photo has been replaced successfully.",
      });
      invalidate();
    },
    onError: (err: Error) => {
      toast({
        title: "Upload failed",
        description: err.message,
        variant: "destructive",
      });
    },
  });

  const removeMutation = useMutation({
    mutationFn: () => updateVehicle(vehicleId, { image: null }),
    onSuccess: () => {
      toast({
        title: "Photo removed",
        description: "Customers will see an illustration instead.",
      });
      invalidate();
    },
    onError: (err: Error) => {
      toast({
        title: "Could not remove photo",
        description: err.message,
        variant: "destructive",
      });
    },
  });

  return (
    <VehicleForm
      mode="edit"
      initial={{
        brand: vehicle.brand,
        model: vehicle.model,
        branch_id: vehicle.branch_id?.toString(),
        price_per_day: Number(vehicle.price_per_day),
        carbon_emissions: Number(vehicle.carbon_emissions),
        body_type: vehicle.body_type,
        passenger_capacity: vehicle.passenger_capacity,
        fuel_type: vehicle.fuel_type,
        transmission: vehicle.transmission,
        available: vehicle.available,
      }}
      initialImage={vehicle.image}
      branches={branches}
      submitting={mutation.isPending}
      submitLabel={mutation.isPending ? "Updating..." : "Update Vehicle"}
      onSubmit={(values) => mutation.mutate(values)}
      onCancel={() => router.push("/admin/manage-vehicles")}
      onReplacePhoto={async (file) =>
        (await photoMutation.mutateAsync(file)).image
      }
      onRemovePhoto={async () => {
        await removeMutation.mutateAsync();
      }}
      photoBusy={photoMutation.isPending || removeMutation.isPending}
    />
  );
}
