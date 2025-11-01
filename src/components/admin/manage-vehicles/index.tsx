"use client";

import { useQuery } from "@tanstack/react-query";
import Loader from "@/components/utility/Loader";
import VehicleOverviewTable from "@/components/admin/manage-vehicles/vehicles";
import { fetchAllVehicles } from "@/app/(admin)/admin/manage-vehicles/actions";

export default function Vehicles() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["vehicles"],
    queryFn: fetchAllVehicles,
  });

  if (isLoading)
    return (
      <div className="w-full mt-24 flex justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader />
          <h3 className="font-semibold text-xl">Loading vehicles...</h3>
          <p>Please wait while we fetch data.</p>
        </div>
      </div>
    );

  if (isError) return <div>Error loading vehicles.</div>;

  return <VehicleOverviewTable vehicles={data || []} />;
}
