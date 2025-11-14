"use client";

import PageLayout from "@/components/utility/page-layout";
import Vehicles from "@/components/admin/manage-vehicles";
import { Suspense } from "react";

export default function ManageVehiclesPage() {
  return (
    <PageLayout
      title="Manage Vehicles"
      description="View, edit, and manage all vehicles listed in the system."
    >
      <Suspense fallback={<div>Loading Vehicles...</div>}>
        <Vehicles />
      </Suspense>
    </PageLayout>
  );
}
