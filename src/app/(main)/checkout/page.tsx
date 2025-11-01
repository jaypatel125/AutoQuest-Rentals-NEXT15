import PageLayout from "@/components/common/page-layout";
import Checkout from "@/components/main/checkout";
import { getServerSideSession } from "@/hooks/SessionHandler";
import { notFound } from "next/navigation";

export default async function CheckoutPage() {
  const { user } = await getServerSideSession();

  if (!user) {
    notFound();
  }
  return (
    <PageLayout
      title="Checkout"
      description="Complete your purchase by providing your payment and shipping information."
    >
      <Checkout user={user} />
    </PageLayout>
  );
}
