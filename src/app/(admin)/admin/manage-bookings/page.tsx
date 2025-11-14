"use client";

import BookingsOverview from "@/components/admin/manage-bookings";
import PageLayout from "@/components/utility/page-layout";
import { Suspense } from "react";

export default function Page() {
  return (
    <PageLayout
      title="Manage Bookings"
      description="View and manage all bookings made on the platform."
    >
      <Suspense fallback={<div>Loading bookings...</div>}>
        <BookingsOverview />
      </Suspense>
    </PageLayout>
  );
}
