import React, { Suspense } from "react";
import ClientSelectVehiclePage from "@/components/select-vehicle/ClientSelectVehiclePage";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading select vehicle…</div>}>
      <ClientSelectVehiclePage />
    </Suspense>
  );
}
