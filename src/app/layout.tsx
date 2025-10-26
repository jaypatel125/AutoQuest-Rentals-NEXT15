import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { Toaster } from "@/components/ui/toaster";

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
          <main className="min-h-screen flex flex-col">
            <div className="flex-1">{children}</div>
          </main>
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
