import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Plus_Jakarta_Sans } from "next/font/google";
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

const display = Plus_Jakarta_Sans({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
});

const appUrl =
  process.env.NEXT_PUBLIC_APP_URL || "https://jay-capstone.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: {
    default: "AutoQuest | Electric & Eco-Friendly Car Rentals",
    template: "%s | AutoQuest",
  },
  description:
    "Rent electric, hybrid, and gas vehicles across Canada. Compare cars, see each trip's carbon footprint, and earn double reward points when you drive electric.",
  applicationName: "AutoQuest",
  openGraph: {
    type: "website",
    siteName: "AutoQuest",
    title: "AutoQuest | Electric & Eco-Friendly Car Rentals",
    description:
      "Find, book, and drive green. Earn 2x reward points on every electric rental.",
  },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fbfdfc" },
    { media: "(prefers-color-scheme: dark)", color: "#0d1117" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${display.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-screen antialiased">
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
