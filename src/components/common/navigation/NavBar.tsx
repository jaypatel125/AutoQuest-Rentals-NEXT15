"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { CalendarCheck, Gift, Menu } from "lucide-react";
import MaxWidthWrapper from "../../utility/MaxWidthWrapper";
import { ISession, IUser } from "../../../../auth-client";
import { Dropdown } from "./Dropdown";
import { cn, isAuthRoutes } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/brand/Logo";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { CUSTOMER_NAV, isActive } from "@/components/layout/nav-items";
import { canViewAdmin } from "@/lib/roles";

const Navbar = ({
  user,
}: {
  session?: ISession | null;
  user: IUser | null | undefined;
}) => {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  if (isAuthRoutes(pathname)) return null;

  // Admins and reviewers both use the admin shell.
  const isAdmin = canViewAdmin(user?.role);
  // Admins navigate with the sidebar in the admin shell.
  const links = isAdmin ? [] : CUSTOMER_NAV;

  return (
    <header className="sticky top-0 inset-x-0 z-40 border-b border-border/70 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/70">
      <MaxWidthWrapper
        className={cn(
          "flex h-[4.25rem] items-center justify-between gap-4",
          isAdmin && "max-w-[88rem]"
        )}
      >
        <div className="flex items-center gap-8">
          <Logo href={isAdmin ? "/admin" : "/"} />
          <nav aria-label="Main" className="hidden items-center gap-1 lg:flex">
            {links.map((link) => {
              const active = isActive(pathname, link.href, link.exact);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "rounded-full px-3.5 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground",
                    active && "bg-secondary text-foreground"
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          {user && !isAdmin && (
            <Link
              href="/rewards"
              className="hidden items-center gap-1.5 rounded-full bg-amber-soft px-3 py-1.5 text-sm font-semibold text-amber-900 transition-colors hover:bg-amber/30 sm:inline-flex dark:text-amber-100"
              title="Your reward points"
            >
              <Gift className="size-4" />
              <span>{(user.reward_points ?? 0).toLocaleString()} pts</span>
            </Link>
          )}
          <ThemeToggle />
          {user ? (
            <Dropdown user={user} />
          ) : (
            <div className="hidden items-center gap-2 sm:flex">
              <Button
                asChild
                variant="ghost"
                size="sm"
                className="rounded-full"
              >
                <Link href="/signin">Sign in</Link>
              </Button>
              <Button asChild size="sm" className="rounded-full px-4">
                <Link href="/signup">Create account</Link>
              </Button>
            </div>
          )}

          {!isAdmin && (
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full lg:hidden"
                  aria-label="Open menu"
                >
                  <Menu className="size-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[82%] max-w-sm gap-0 p-0">
                <SheetHeader className="border-b p-5">
                  <SheetTitle asChild>
                    <div>
                      <Logo href={isAdmin ? "/admin" : "/"} />
                    </div>
                  </SheetTitle>
                </SheetHeader>
                <nav aria-label="Mobile" className="flex flex-col gap-1 p-3">
                  {links.map(({ href, label, icon: Icon, exact }) => {
                    const active = isActive(pathname, href, exact);
                    return (
                      <Link
                        key={href}
                        href={href}
                        onClick={() => setOpen(false)}
                        className={cn(
                          "flex items-center gap-3 rounded-xl px-3 py-3 text-[15px] font-medium transition-colors hover:bg-secondary",
                          active && "bg-secondary"
                        )}
                      >
                        <Icon className="size-5 text-primary" /> {label}
                      </Link>
                    );
                  })}
                  {user && !isAdmin && (
                    <Link
                      href="/bookings"
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-3 rounded-xl px-3 py-3 text-[15px] font-medium hover:bg-secondary"
                    >
                      <CalendarCheck className="size-5 text-primary" />
                      My bookings
                      <span className="ml-auto rounded-full bg-amber-soft px-2 py-0.5 text-xs font-semibold text-amber-900 dark:text-amber-100">
                        {(user.reward_points ?? 0).toLocaleString()} pts
                      </span>
                    </Link>
                  )}
                </nav>
                {!user && (
                  <div className="mt-auto grid gap-2 border-t p-5">
                    <Button
                      asChild
                      variant="outline"
                      onClick={() => setOpen(false)}
                    >
                      <Link href="/signin">Sign in</Link>
                    </Button>
                    <Button asChild onClick={() => setOpen(false)}>
                      <Link href="/signup">Create account</Link>
                    </Button>
                  </div>
                )}
              </SheetContent>
            </Sheet>
          )}
        </div>
      </MaxWidthWrapper>
    </header>
  );
};

export default Navbar;
