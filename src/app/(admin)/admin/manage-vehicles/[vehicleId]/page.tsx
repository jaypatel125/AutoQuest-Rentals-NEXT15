"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { fetchVehicle } from "./actions";
import Loader from "@/components/utility/Loader";
import VehicleManage from "@/components/admin/manage-vehicles/vehicleManage";
import { fetchBranches } from "@/app/actions";

export default function EditVehiclePage() {
  const params = useParams();
  const vehicleId = params["vehicleId"] as string;
  const {
    data: vehicle,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["vehicle", vehicleId],
    queryFn: () => fetchVehicle(vehicleId),
    enabled: !!vehicleId,
  });

  const { data: branches = [] } = useQuery({
    queryKey: ["branches"],
    queryFn: fetchBranches,
  });

  if (isLoading)
    return (
      <div className="w-full h-[80vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader />
          <h3 className="font-semibold text-xl">Fetching vehicle details...</h3>
          <p>This won&apos;t take too long!</p>
        </div>
      </div>
    );

  if (isError || !vehicle)
    return (
      <div className="w-full h-[80vh] flex items-center justify-center text-red-500">
        Something went wrong. Please try again.
      </div>
    );

  return <VehicleManage branches={branches} vehicle={vehicle} />;
}
