import { AdminDashboard } from "@/components/admin/dashboard";
import PageLayout from "@/components/utility/page-layout";

export default function AdminDashboardPage() {
  return (
    <PageLayout
      title="Admin Dashboard"
      description="Comprehensive overview of your car rental business performance and analytics"
      goBack={false}
    >
      <AdminDashboard />
    </PageLayout>
  );
}
