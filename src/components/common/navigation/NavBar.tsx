"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu } from "lucide-react";
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

const Navbar = ({
  user,
}: {
  session?: ISession | null;
  user: IUser | null | undefined;
}) => {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  if (isAuthRoutes(pathname)) return null;

  const isAdmin = user?.role === "admin";
  // Admins navigate with the sidebar in the admin shell.
  const links = isAdmin ? [] : CUSTOMER_NAV;

  return (
    <header className="sticky top-0 inset-x-0 z-40 border-b bg-background/95 supports-[backdrop-filter]:bg-background/80 supports-[backdrop-filter]:backdrop-blur">
      <MaxWidthWrapper
        className={cn(
          "flex h-16 items-center justify-between gap-4",
          isAdmin && "max-w-7xl"
        )}
      >
        <div className="flex items-center gap-10">
          <Logo href={isAdmin ? "/admin" : "/"} />
          <nav aria-label="Main" className="hidden items-center gap-7 lg:flex">
            {links.map((link) => {
              const active = isActive(pathname, link.href, link.exact);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "text-sm text-muted-foreground transition-colors hover:text-foreground",
                    active && "text-foreground"
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-1.5">
          {user && !isAdmin && (
            <Link
              href="/rewards"
              className="mr-2 hidden text-sm text-muted-foreground tabular-nums transition-colors hover:text-foreground sm:inline"
              title="Your reward points"
            >
              {(user.reward_points ?? 0).toLocaleString()} pts
            </Link>
          )}
          <ThemeToggle />
          {user ? (
            <Dropdown user={user} />
          ) : (
            <div className="hidden items-center gap-1.5 sm:flex">
              <Button asChild variant="ghost" size="sm">
                <Link href="/signin">Sign in</Link>
              </Button>
              <Button asChild size="sm">
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
                  className="lg:hidden"
                  aria-label="Open menu"
                >
                  <Menu className="size-5" strokeWidth={1.5} />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[82%] max-w-sm gap-0 p-0">
                <SheetHeader className="h-16 justify-center border-b px-6">
                  <SheetTitle asChild>
                    <div>
                      <Logo href={isAdmin ? "/admin" : "/"} />
                    </div>
                  </SheetTitle>
                </SheetHeader>
                <nav aria-label="Mobile" className="flex flex-col px-6 py-4">
                  {links.map(({ href, label, exact }) => {
                    const active = isActive(pathname, href, exact);
                    return (
                      <Link
                        key={href}
                        href={href}
                        onClick={() => setOpen(false)}
                        className={cn(
                          "border-b py-3.5 text-[15px] text-muted-foreground transition-colors hover:text-foreground",
                          active && "text-foreground"
                        )}
                      >
                        {label}
                      </Link>
                    );
                  })}
                  {user && !isAdmin && (
                    <Link
                      href="/bookings"
                      onClick={() => setOpen(false)}
                      className="flex items-center border-b py-3.5 text-[15px] text-muted-foreground hover:text-foreground"
                    >
                      My bookings
                      <span className="ml-auto text-sm tabular-nums">
                        {(user.reward_points ?? 0).toLocaleString()} pts
                      </span>
                    </Link>
                  )}
                </nav>
                {!user && (
                  <div className="mt-auto grid gap-2 border-t p-6">
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
