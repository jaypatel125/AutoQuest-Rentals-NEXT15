import PageLayout from "@/components/utility/page-layout";
import TermsDetails from "@/components/main/terms";
import React from "react";

const Termspage = () => {
  return (
    <PageLayout
      title="Rental Terms & Conditions"
      description="Please read these terms carefully before renting a vehicle with us. By booking a rental, you agree to the following policies and conditions."
    >
      <TermsDetails />
    </PageLayout>
  );
};

export default Termspage;
