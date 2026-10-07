"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import MaxWidthWrapper from "./utility/MaxWidthWrapper";
import { isAuthRoutes } from "@/lib/utils";

const COLUMNS = [
  {
    title: "Explore",
    links: [
      { href: "/select-vehicle", label: "Browse cars" },
      {
        href: "/select-vehicle?fuelTypes=Electric",
        label: "Electric vehicles",
      },
      { href: "/compare", label: "Compare vehicles" },
      { href: "/rewards", label: "Rewards program" },
    ],
  },
  {
    title: "Your trips",
    links: [
      { href: "/bookings", label: "My bookings" },
      { href: "/account", label: "Account settings" },
      { href: "/signup", label: "Create an account" },
    ],
  },
  {
    title: "Support",
    links: [
      { href: "/contact", label: "Contact us" },
      { href: "/terms", label: "Rental terms" },
      { href: "/terms#cancellations", label: "Cancellation policy" },
    ],
  },
];

export default function Footer() {
  const pathname = usePathname();
  if (isAuthRoutes(pathname)) {
    return null;
  }
  return (
    <footer className="mt-auto border-t">
      <MaxWidthWrapper className="py-14">
        <div className="grid gap-10 md:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div className="space-y-3 text-sm">
            <p className="font-medium">AutoQuest</p>
            <p className="max-w-xs leading-relaxed text-muted-foreground">
              Electric, hybrid, and gas rentals across Canada.
            </p>
            <ul className="space-y-1 text-muted-foreground">
              <li>autoquest.rental@gmail.com</li>
              <li>+1 (123) 456-7890</li>
              <li>123 Main Street, Toronto, ON</li>
            </ul>
          </div>
          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h3 className="mb-3 text-sm font-medium">{col.title}</h3>
              <ul className="space-y-2 text-sm">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <p className="mt-14 text-xs text-muted-foreground">
          © {new Date().getFullYear()} AutoQuest
        </p>
      </MaxWidthWrapper>
    </footer>
  );
}
