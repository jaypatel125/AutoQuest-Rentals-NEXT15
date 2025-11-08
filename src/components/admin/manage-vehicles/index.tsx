"use client";

import { useQuery } from "@tanstack/react-query";
import Loader from "@/components/utility/Loader";
import VehicleOverviewTable from "@/components/admin/manage-vehicles/vehicles";
import { fetchAllVehicles } from "@/app/(admin)/admin/manage-vehicles/actions";
import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import Error from "@/components/utility/Error";

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

  if (isLoading) return <Loader title="Loading vehicles" />;

  if (isError) return <Error error="Failed to load vehicles." />;
  return (
    <VehicleOverviewTable
      branchId={branchId}
      vehicles={(branchId ? filteredData : data) || []}
    />
  );
}
