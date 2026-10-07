import type { Metadata } from "next";
import { notFound } from "next/navigation";
import SettingsProfilePage from "@/components/common/account";
import PageLayout from "@/components/utility/page-layout";
import { getServerSideSession } from "@/hooks/SessionHandler";

export const metadata: Metadata = { title: "Account settings" };

const AccountPage = async () => {
  const { user } = await getServerSideSession();

  if (!user) {
    notFound();
  }
  return (
    <PageLayout
      title="Profile Settings"
      description="Manage your personal details, sign-in, and account."
      goBack={false}
    >
      <SettingsProfilePage user={user} />
    </PageLayout>
  );
};

export default AccountPage;
