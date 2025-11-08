import React, { Suspense } from "react";
import SelectVehiclePage from "@/components/main/select-vehicle";
import Loader from "@/components/utility/Loader";

export default function Page() {
  return (
    <Suspense fallback={<Loader />}>
      <SelectVehiclePage />
    </Suspense>
  );
}
