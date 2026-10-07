import type { Metadata } from "next";
import React, { Suspense } from "react";
import SelectVehiclePage from "@/components/main/select-vehicle";
import Loader from "@/components/utility/Loader";

export const metadata: Metadata = {
  title: "Browse cars",
  description: "Search electric, hybrid, and gas rentals by city and date.",
};

export default function Page() {
  return (
    <Suspense fallback={<Loader />}>
      <SelectVehiclePage />
    </Suspense>
  );
}
