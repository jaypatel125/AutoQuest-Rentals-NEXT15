"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Leaf, Mail, MapPin, Phone } from "lucide-react";
import MaxWidthWrapper from "./utility/MaxWidthWrapper";
import { isAuthRoutes } from "@/lib/utils";
import { Logo } from "@/components/brand/Logo";
import { CAR_PHOTOS } from "@/lib/car-photos";

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
      ...(Object.keys(CAR_PHOTOS).length
        ? [{ href: "/terms#photo-credits", label: "Photo credits" }]
        : []),
    ],
  },
];

export default function Footer({
  reviewerDemo = false,
}: {
  reviewerDemo?: boolean;
}) {
  const pathname = usePathname();
  if (isAuthRoutes(pathname)) {
    return null;
  }
  return (
    <footer className="mt-auto border-t bg-sand">
      <MaxWidthWrapper className="py-14">
        <div className="grid gap-10 md:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div className="space-y-5">
            <Logo />
            <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
              Electric, hybrid, and gas rentals across Canada. Every EV trip
              earns double points and leaves less behind.
            </p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2.5">
                <Mail className="size-4 text-primary" />
                autoquest.rental@gmail.com
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="size-4 text-primary" />
                +1 (123) 456-7890
              </li>
              <li className="flex items-center gap-2.5">
                <MapPin className="size-4 text-primary" />
                123 Main Street, Toronto, ON
              </li>
            </ul>
          </div>
          {COLUMNS.map((col) => ({
            ...col,
            links:
              reviewerDemo && col.title === "Support"
                ? [
                    ...col.links,
                    {
                      href: "/signin?demo=reviewer",
                      label: "Admin demo (read-only)",
                    },
                  ]
                : col.links,
          })).map((col) => (
            <div key={col.title}>
              <h3 className="mb-4 font-display text-sm font-bold">
                {col.title}
              </h3>
              <ul className="space-y-2.5 text-sm">
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
        <div className="mt-12 flex flex-col items-start justify-between gap-4 border-t pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center">
          <p>© {new Date().getFullYear()} AutoQuest. All rights reserved.</p>
          <p className="inline-flex items-center gap-1.5">
            <Leaf className="size-3.5 text-eco" />
            Drive electric, earn 2x points.
          </p>
        </div>
      </MaxWidthWrapper>
    </footer>
  );
}
