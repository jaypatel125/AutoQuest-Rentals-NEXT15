"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ADMIN_NAV, ADMIN_QUICK_ADD, isActive } from "./nav-items";

export function AdminSidebar() {
  const pathname = usePathname();

  const item = (href: string, label: string, exact?: boolean) => {
    const active = isActive(pathname, href, exact);
    return (
      <Link
        key={href}
        href={href}
        aria-current={active ? "page" : undefined}
        className={cn(
          "shrink-0 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground",
          active && "bg-muted text-foreground"
        )}
      >
        {label}
      </Link>
    );
  };

  return (
    <aside className="lg:w-48 lg:shrink-0">
      <nav
        aria-label="Admin"
        className="scrollbar-none -mx-5 flex gap-1 overflow-x-auto px-5 lg:sticky lg:top-24 lg:mx-0 lg:flex-col lg:overflow-visible lg:px-0"
      >
        <p className="hidden px-3 pb-2 text-xs text-muted-foreground lg:block">
          Manage
        </p>
        {ADMIN_NAV.map(({ href, label, exact }) => item(href, label, exact))}
        <p className="hidden px-3 pt-6 pb-2 text-xs text-muted-foreground lg:block">
          Add
        </p>
        {ADMIN_QUICK_ADD.map(({ href, label }) => item(href, label))}
      </nav>
    </aside>
  );
}
