import PageLayout from "@/components/utility/page-layout";
import RewardsPage from "@/components/main/rewards";

export default async function Rewards() {
  return (
    <PageLayout
      title="EV Rewards Program"
      description="Drive green, earn rewards, and enjoy exclusive benefits every time you rent an electric vehicle."
    >
      <RewardsPage />
    </PageLayout>
  );
}
