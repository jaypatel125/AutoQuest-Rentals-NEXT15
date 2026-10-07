import type { Metadata } from "next";
import PageLayout from "@/components/utility/page-layout";
import RewardsPage from "@/components/main/rewards";
import { getServerSideSession } from "@/hooks/SessionHandler";

export const metadata: Metadata = {
  title: "Rewards",
  description:
    "Earn 2x points on electric rentals, redeem them at checkout, and track the CO₂ you avoid.",
};

export default async function Rewards() {
  const { user } = await getServerSideSession();
  return (
    <PageLayout
      title={
        user
          ? `Hi ${user.name.split(" ")[0]}, here are your rewards`
          : "EV Rewards Program"
      }
      eyebrow="AutoQuest Rewards"
      description="Drive green, earn rewards, and enjoy exclusive benefits every time you rent an electric vehicle."
      goBack={false}
    >
      <RewardsPage signedIn={!!user} />
    </PageLayout>
  );
}
