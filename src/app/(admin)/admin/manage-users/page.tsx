import React from "react";
import CustomersOverview from "@/components/admin/manage-users";
import { getServerSideSession } from "@/hooks/SessionHandler";
import PageLayout from "@/components/common/page-layout";

const CustomersPage = async () => {
  const { user } = await getServerSideSession();
  return user ? (
    <PageLayout
      title="Manage Users"
      description="View and manage all users registered on the platform."
    >
      <CustomersOverview user={user} />
    </PageLayout>
  ) : (
    <div>Loading...</div>
  );
};

export default CustomersPage;
