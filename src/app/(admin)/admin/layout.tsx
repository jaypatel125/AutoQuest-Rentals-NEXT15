import type { Metadata } from "next";

import UserNavbarWrapper from "@/components/common/navigation/UseNavbarWrapper";
import MaxWidthWrapper from "@/components/utility/MaxWidthWrapper";
import { UncontainedPages } from "@/components/utility/page-layout";
import { AdminSidebar } from "@/components/layout/AdminSidebar";
import {
  AdminAccessProvider,
  ReviewerBanner,
} from "@/components/admin/AdminAccess";
import { getServerSideSession } from "@/hooks/SessionHandler";
import { canEditAdmin } from "@/lib/roles";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { user } = await getServerSideSession();
  // The middleware only lets admins and reviewers in; anyone who can't edit
  // is a reviewer. The API enforces the same rule on every write.
  const readOnly = !canEditAdmin(user?.role);

  return (
    <div className="flex min-h-screen flex-col bg-sand/60">
      <UserNavbarWrapper />
      <MaxWidthWrapper className="flex max-w-[88rem] flex-1 flex-col gap-6 py-8 lg:flex-row lg:gap-10">
        <AdminSidebar />
        <main id="main" className="min-w-0 flex-1 pb-10">
          <AdminAccessProvider readOnly={readOnly}>
            {readOnly && <ReviewerBanner />}
            <UncontainedPages>{children}</UncontainedPages>
          </AdminAccessProvider>
        </main>
      </MaxWidthWrapper>
    </div>
  );
}
