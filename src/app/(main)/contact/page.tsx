import PageLayout from "@/components/common/page-layout";
import ContactForm from "@/components/main/contact-form";

export default function ContactPage() {
  return (
    <PageLayout
      title="Contact Us"
      description="  We'd love to hear from you! Whether you have questions, feedback, or need assistance, our team is here to help."
    >
      <div className="py-6 space-y-6">
        <ContactForm />
      </div>
    </PageLayout>
  );
}
