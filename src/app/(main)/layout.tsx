import Footer from "@/components/Footer";
import UserNavbarWrapper from "@/components/common/navigation/UseNavbarWrapper";
import { PageWrapper } from "@/components/utility/page-wrapper";
import { CompareBar } from "@/components/vehicles/CompareBar";

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen flex-col">
      <UserNavbarWrapper />
      <main id="main" className="flex flex-1 flex-col">
        <PageWrapper>{children}</PageWrapper>
      </main>
      <Footer />
      <CompareBar />
    </div>
  );
}
