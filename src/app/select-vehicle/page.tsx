import React, { Suspense } from "react";
import ClientSelectVehiclePage from "./components/ClientSelectVehiclePage";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading select vehicle…</div>}>
      <ClientSelectVehiclePage />
    </Suspense>
  );
}
