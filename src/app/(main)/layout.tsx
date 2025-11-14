import Footer from "@/components/Footer";
import UserNavbarWrapper from "@/components/common/navigation/UseNavbarWrapper";
import { PageWrapper } from "@/components/utility/page-wrapper";
import { Toaster } from "@/components/ui/toaster";
import MaxWidthWrapper from "@/components/utility/MaxWidthWrapper";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="antialiased">
      <div className="flex flex-col min-h-screen">
        <UserNavbarWrapper />
        <PageWrapper>
          <MaxWidthWrapper className="flex-1">{children}</MaxWidthWrapper>
        </PageWrapper>
        <Footer />
      </div>
      <Toaster />
    </div>
  );
}
