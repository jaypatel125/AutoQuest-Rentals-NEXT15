"use client";

import { useQuery } from "@tanstack/react-query";
import Loader from "@/components/utility/Loader";
import VehicleOverviewTable from "@/components/admin/manage-vehicles/vehicles";
import { fetchAllVehicles } from "@/app/(admin)/admin/manage-vehicles/actions";
import { useMemo } from "react";
import { useSearchParams } from "next/navigation";

export default function Vehicles() {
  const params = useSearchParams();
  const branchId = params.get("branchId") || "";

  const { data, isLoading, isError } = useQuery({
    queryKey: ["vehicles"],
    queryFn: fetchAllVehicles,
  });

  const filteredData = useMemo(() => {
    if (!data) return [];
    return data.filter((vehicle) => vehicle.branch_id === branchId);
  }, [data, branchId]);

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

  return (
    <VehicleOverviewTable
      branchId={branchId}
      vehicles={(branchId ? filteredData : data) || []}
    />
  );
}
