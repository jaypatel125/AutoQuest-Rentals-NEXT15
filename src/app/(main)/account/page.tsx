import SettingsProfilePage from "@/components/common/account";
import { getServerSideSession } from "@/hooks/SessionHandler";
import { notFound } from "next/navigation";
import React from "react";

const AccountPage = async () => {
  const { user } = await getServerSideSession();

  if (!user) {
    notFound();
  }
  return <SettingsProfilePage user={user} />;
};

export default AccountPage;
