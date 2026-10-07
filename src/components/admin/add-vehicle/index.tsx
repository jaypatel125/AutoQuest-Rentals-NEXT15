"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { createVehicle } from "@/app/(admin)/admin/add-vehicle/actions";
import { fetchBranches } from "@/app/actions";
import { useToast } from "@/hooks/use-toast";
import {
  VehicleForm,
  type VehicleFormValues,
} from "../vehicle-form/VehicleForm";

export default function AddVehicleForm() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: branches = [] } = useQuery({
    queryKey: ["branches"],
    queryFn: fetchBranches,
  });

  const createMutation = useMutation({
    mutationFn: ({
      values,
      file,
    }: {
      values: VehicleFormValues;
      file: File | null;
    }) => createVehicle(values, file),
    onSuccess: () => {
      toast({
        title: "Vehicle Added",
        description: "The new vehicle has been added successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      router.push("/admin/manage-vehicles");
    },
    onError: (err: Error) => {
      toast({
        title: "Could not add vehicle",
        description: err.message,
        variant: "destructive",
      });
    },
  });

  return (
    <VehicleForm
      mode="create"
      branches={branches}
      submitting={createMutation.isPending}
      submitLabel={
        createMutation.isPending ? "Adding Vehicle..." : "Add Vehicle"
      }
      onSubmit={(values, file) => createMutation.mutate({ values, file })}
      onCancel={() => router.push("/admin/manage-vehicles")}
    />
  );
}
