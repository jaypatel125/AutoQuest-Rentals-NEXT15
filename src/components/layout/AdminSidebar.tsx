"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  ADMIN_NAV,
  ADMIN_QUICK_ADD,
  isActive,
  type NavItem,
} from "./nav-items";

export function AdminSidebar() {
  const pathname = usePathname();

  const item = (
    href: string,
    label: string,
    Icon: NavItem["icon"],
    exact?: boolean
  ) => {
    const active = isActive(pathname, href, exact);
    return (
      <Link
        key={href}
        href={href}
        aria-current={active ? "page" : undefined}
        className={cn(
          "flex shrink-0 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-card hover:text-foreground",
          active && "bg-card text-foreground shadow-sm ring-1 ring-border"
        )}
      >
        <Icon className={cn("size-[18px]", active && "text-primary")} />
        {label}
      </Link>
    );
  };

  return (
    <aside className="lg:w-56 lg:shrink-0">
      <nav
        aria-label="Admin"
        className="scrollbar-none -mx-4 flex gap-1 overflow-x-auto px-4 lg:sticky lg:top-24 lg:mx-0 lg:flex-col lg:overflow-visible lg:px-0"
      >
        <p className="hidden px-3 pb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground lg:block">
          Manage
        </p>
        {ADMIN_NAV.map(({ href, label, icon, exact }) =>
          item(href, label, icon, exact)
        )}
        <p className="hidden px-3 pt-5 pb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground lg:block">
          Quick add
        </p>
        {ADMIN_QUICK_ADD.map(({ href, label, icon }) =>
          item(href, label, icon)
        )}
      </nav>
    </aside>
  );
}
