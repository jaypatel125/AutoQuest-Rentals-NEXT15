import type { Metadata } from "next";

import UserNavbarWrapper from "@/components/common/navigation/UseNavbarWrapper";
import MaxWidthWrapper from "@/components/utility/MaxWidthWrapper";
import { UncontainedPages } from "@/components/utility/page-layout";
import { AdminSidebar } from "@/components/layout/AdminSidebar";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen flex-col">
      <UserNavbarWrapper />
      <MaxWidthWrapper className="flex max-w-7xl flex-1 flex-col gap-8 py-10 lg:flex-row lg:gap-12">
        <AdminSidebar />
        <main id="main" className="min-w-0 flex-1 pb-10">
          <UncontainedPages>{children}</UncontainedPages>
        </main>
      </MaxWidthWrapper>
    </div>
  );
}
