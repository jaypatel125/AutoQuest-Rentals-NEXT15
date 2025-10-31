"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import Loader from "@/components/utility/Loader";
import { fetchAllVehicles } from "./actions";
import ManageVehicleTable from "@/components/admin/manage-vehicles";
import { Separator } from "@/components/ui/separator";

export default function ManageVehiclesPage() {
  const router = useRouter();
  const {
    data: vehicles,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["vehicles"],
    queryFn: fetchAllVehicles,
  });

  if (isLoading || !vehicles) {
    return (
      <div className="w-full h-[80vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader />
          <h3 className="font-semibold text-xl">Fetching vehicles...</h3>
          <p>This won&apos;t take too long!</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="w-full h-[80vh] flex items-center justify-center">
        <p className="text-red-500">Something went wrong. Please try again.</p>
      </div>
    );
  }

  return (
    <div className="py-6 space-y-6">
      <Button variant="ghost" onClick={() => router.back()} className="gap-2">
        <ArrowLeft /> Back
      </Button>

      <div className="space-y-2">
        <h1 className="text-xl font-bold tracking-tight">Manage Vehicles</h1>
        <p className="text-muted-foreground">
          View and manage all vehicles listed on the platform.
        </p>
      </div>
      <Separator />

      <ManageVehicleTable vehicles={vehicles} />
    </div>
  );
}
