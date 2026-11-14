import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import PageLayout from "@/components/utility/page-layout";
import Checkout from "@/components/main/checkout";
import Loader from "@/components/utility/Loader";
import { getServerSideSession } from "@/hooks/SessionHandler";

export const metadata: Metadata = { title: "Checkout" };

export default async function CheckoutPage() {
  const { user } = await getServerSideSession();

  if (!user) {
    notFound();
  }
  // With a Stripe test key no real charge can happen, so the page can show
  // the test card details next to the pay button.
  const testMode = (process.env.STRIPE_SECRET_KEY ?? "").startsWith("sk_test_");
  return (
    <PageLayout
      title="Review and pay"
      description="Check your trip details, apply reward points, and pay securely."
    >
      <Suspense fallback={<Loader />}>
        <Checkout user={user} testMode={testMode} />
      </Suspense>
    </PageLayout>
  );
}
