"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import Loader from "@/components/utility/Loader";
import { fetchAllVehicles } from "./actions";
import ManageVehicleTable from "@/components/admin/manage-vehicles";

export default function ManageVehiclesPage() {
  const router = useRouter();
  const { data: vehicles, isLoading } = useQuery({
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

  return (
    <div className="py-6 space-y-6">
      <div className="flex justify-between items-center mb-2">
        <Button variant="ghost" onClick={() => router.back()} className="gap-2">
          <ArrowLeft /> Back
        </Button>

        <Link href="/admin/manage-vehicles/add-vehicle">
          <Button>Add Vehicle</Button>
        </Link>
      </div>

      <ManageVehicleTable vehicles={vehicles} />
    </div>
  );
}
