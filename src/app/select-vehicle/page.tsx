import React, { Suspense } from "react";
import SelectVehiclePage from "@/components/select-vehicle";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading select vehicle…</div>}>
      <SelectVehiclePage />
    </Suspense>
  );
}
