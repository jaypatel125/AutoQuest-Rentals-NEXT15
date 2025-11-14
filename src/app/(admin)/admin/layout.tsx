import type { Metadata } from "next";

import UserNavbarWrapper from "@/components/common/navigation/UseNavbarWrapper";
import Footer from "@/components/Footer";
import { Toaster } from "@/components/ui/toaster";
import MaxWidthWrapper from "@/components/utility/MaxWidthWrapper";
import { PageWrapper } from "@/components/utility/page-wrapper";

export const metadata: Metadata = {
  title: "AutoQuest – Fast & Reliable Vehicle Rentals",
  description:
    "Book cars effortlessly in your city. Choose from a wide selection of vehicles and enjoy convenient, reliable rentals at competitive prices.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="antialiased">
      <main className="min-h-screen flex flex-col">
        <UserNavbarWrapper />
        <PageWrapper>
          <MaxWidthWrapper className="flex-1">{children}</MaxWidthWrapper>
        </PageWrapper>
        <Footer />
      </main>

      <Toaster />
    </div>
  );
}
