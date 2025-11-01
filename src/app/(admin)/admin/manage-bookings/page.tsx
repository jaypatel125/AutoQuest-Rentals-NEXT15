"use client";

import BookingsOverview from "@/components/admin/manage-bookings";
import PageLayout from "@/components/common/page-layout";

export default function Page() {
  return (
    <PageLayout
      title="Manage Bookings"
      description="View and manage all bookings made on the platform."
    >
      <BookingsOverview />
    </PageLayout>
  );
}
