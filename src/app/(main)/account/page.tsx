import SettingsProfilePage from "@/components/common/account";
import PageLayout from "@/components/utility/page-layout";
import { getServerSideSession } from "@/hooks/SessionHandler";
import { notFound } from "next/navigation";
import React from "react";

const AccountPage = async () => {
  const { user } = await getServerSideSession();

  if (!user) {
    notFound();
  }
  return (
    <PageLayout
      title="Profile Settings"
      description=" Update your profile information to personalize your shopping
            experience."
    >
      <SettingsProfilePage user={user} />
    </PageLayout>
  );
};

export default AccountPage;
