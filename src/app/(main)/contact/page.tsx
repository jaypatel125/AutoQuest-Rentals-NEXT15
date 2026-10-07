import type { Metadata } from "next";
import PageLayout from "@/components/utility/page-layout";
import ContactForm from "@/components/main/contact-form";

export const metadata: Metadata = {
  title: "Contact us",
  description:
    "Questions about a booking, rewards, or our fleet? Get in touch.",
};

export default function ContactPage() {
  return (
    <PageLayout
      title="Contact Us"
      eyebrow="Help center"
      description="We'd love to hear from you! Whether you have questions, feedback, or need assistance, our team is here to help."
      goBack={false}
    >
      <ContactForm />
    </PageLayout>
  );
}
