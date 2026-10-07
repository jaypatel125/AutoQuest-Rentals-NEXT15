import type { Metadata } from "next";
import PageLayout from "@/components/utility/page-layout";
import TermsDetails from "@/components/main/terms";

export const metadata: Metadata = {
  title: "Rental terms",
  description:
    "Rental terms, cancellation policy, and renter responsibilities.",
};

export default function TermsPage() {
  return (
    <PageLayout
      title="Rental Terms & Conditions"
      eyebrow="Legal"
      description="Please read these terms carefully before renting a vehicle with us. By booking a rental, you agree to the following policies and conditions."
    >
      <TermsDetails />
    </PageLayout>
  );
}
