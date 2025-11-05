import Footer from "@/components/Footer";
import UserNavbarWrapper from "@/components/common/navigation/UseNavbarWrapper";
import { Toaster } from "@/components/ui/toaster";
import MaxWidthWrapper from "@/components/utility/MaxWidthWrapper";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="antialiased">
      <div className="min-h-screen flex flex-col">
        <UserNavbarWrapper />
        <MaxWidthWrapper className="flex-1">{children}</MaxWidthWrapper>
        <Footer />
      </div>
      <Toaster />
    </div>
  );
}
