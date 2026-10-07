import {
  Building2,
  CalendarCheck,
  CarFront,
  Gift,
  LayoutDashboard,
  LifeBuoy,
  Plus,
  Scale,
  Users,
} from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: typeof CarFront;
  exact?: boolean;
}

export const CUSTOMER_NAV: NavItem[] = [
  { href: "/select-vehicle", label: "Browse cars", icon: CarFront },
  { href: "/compare", label: "Compare", icon: Scale },
  { href: "/rewards", label: "Rewards", icon: Gift },
  { href: "/contact", label: "Help", icon: LifeBuoy },
];

export const ADMIN_NAV: NavItem[] = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/manage-bookings", label: "Bookings", icon: CalendarCheck },
  { href: "/admin/manage-vehicles", label: "Vehicles", icon: CarFront },
  { href: "/admin/manage-branches", label: "Branches", icon: Building2 },
  { href: "/admin/manage-users", label: "Customers", icon: Users },
];

export const ADMIN_QUICK_ADD: NavItem[] = [
  { href: "/admin/add-vehicle", label: "Add vehicle", icon: Plus },
  { href: "/admin/add-branch", label: "Add branch", icon: Plus },
];

export function isActive(pathname: string, href: string, exact = false) {
  if (exact) return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}
