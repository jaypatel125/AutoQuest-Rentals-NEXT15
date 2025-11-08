"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { fetchVehicle } from "./actions";
import Loader from "@/components/utility/Loader";
import VehicleManage from "@/components/admin/edit-vehicle";
import { fetchBranches } from "@/app/actions";
import PageLayout from "@/components/common/page-layout";
import Error from "@/components/utility/Error";

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

  if (isLoading) return <Loader title="Fetching vehicle details" />;

  if (isError || !vehicle) return <Error />;

  const title = `Manage Vehicle - ${vehicle.brand} ${vehicle.model}`;

  return (
    <PageLayout
      title={title}
      description="Update vehicle details and specifications"
    >
      <VehicleManage branches={branches} vehicle={vehicle} />
    </PageLayout>
  );
}
