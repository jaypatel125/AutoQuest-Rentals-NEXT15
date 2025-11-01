"use client";

import PageLayout from "@/components/common/page-layout";
import Vehicles from "@/components/admin/manage-vehicles";

export default function ManageVehiclesPage() {
  return (
    <PageLayout
      title="Manage Vehicles"
      description="View, edit, and manage all vehicles listed in the system."
    >
      <Vehicles />
    </PageLayout>
  );
}
