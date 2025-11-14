import React from "react";
import CustomersOverview from "@/components/admin/manage-users";
import { getServerSideSession } from "@/hooks/SessionHandler";
import PageLayout from "@/components/utility/page-layout";
import Loader from "@/components/utility/Loader";

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
    <Loader title="Checking authentication" />
  );
};

export default CustomersPage;
