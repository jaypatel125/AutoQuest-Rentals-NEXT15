"use client";
import ManageBranchesTable from "@/components/admin/manage-branches/branches";
import PageLayout from "@/components/common/page-layout";

export default function ManageBranchesPage() {
  return (
    <PageLayout
      title="Manage Branches"
      description="Manage the branches of the organization from this admin panel."
    >
      <ManageBranchesTable />
    </PageLayout>
  );
}
