import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import UserNavbarWrapper from "@/components/nav/UseNavbarWrapper";
import { Providers } from "./providers";
import Footer from "@/components/Footer";
import { Toaster } from "@/components/ui/toaster";
import MaxWidthWrapper from "@/components/utility/MaxWidthWrapper";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

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
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="antialiased">
        <Providers>
          <UserNavbarWrapper />

          <main className="min-h-screen flex flex-col">
            <MaxWidthWrapper className="flex-1 mt-6">
              {children}
            </MaxWidthWrapper>
          </main>

          <Toaster />
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
