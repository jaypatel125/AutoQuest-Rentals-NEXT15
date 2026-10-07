"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CalendarCheck,
  ChevronDown,
  Gift,
  LogOut,
  UserRound,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ADMIN_NAV, ADMIN_QUICK_ADD } from "@/components/layout/nav-items";
import { authClient, IUser } from "../../../../auth-client";

export function initials(name?: string | null) {
  return (
    (name ?? "")
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "?"
  );
}

export function Avatar({
  name,
  className = "",
}: {
  name?: string | null;
  className?: string;
}) {
  return (
    <span
      aria-hidden
      className={`inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 text-xs font-bold text-white ${className}`}
    >
      {initials(name)}
    </span>
  );
}

/** Account menu for signed-in users (customers and admins). */
export function Dropdown({ user }: { user: IUser }) {
  const router = useRouter();
  const isAdmin = user.role === "admin";

  const handleSignOut = async () => {
    try {
      await authClient.signOut({
        fetchOptions: {
          onSuccess: () => {
            router.push("/");
            router.refresh();
          },
        },
      });
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex cursor-pointer items-center gap-2 rounded-full border bg-card py-1 pr-2.5 pl-1 text-sm font-medium shadow-xs transition-colors hover:bg-accent"
          aria-label="Open account menu"
        >
          <Avatar name={user.name} />
          <span className="hidden max-w-[9rem] truncate sm:inline">
            {user.name}
          </span>
          <ChevronDown className="size-4 text-muted-foreground" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-64" align="end" sideOffset={8}>
        <DropdownMenuLabel className="flex items-center gap-3 py-2">
          <Avatar name={user.name} className="size-10 text-sm" />
          <div className="min-w-0">
            <p className="truncate font-semibold">{user.name}</p>
            <p className="truncate text-xs font-normal text-muted-foreground">
              {user.email}
            </p>
            <p className="mt-0.5 text-xs font-semibold text-primary">
              {isAdmin
                ? "Admin"
                : `${(user.reward_points ?? 0).toLocaleString()} pts`}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {isAdmin ? (
          <>
            <DropdownMenuGroup>
              {ADMIN_NAV.map(({ href, label, icon: Icon }) => (
                <DropdownMenuItem key={href} asChild>
                  <Link href={href}>
                    <Icon /> {label}
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              {ADMIN_QUICK_ADD.map(({ href, label, icon: Icon }) => (
                <DropdownMenuItem key={href} asChild>
                  <Link href={href}>
                    <Icon /> {label}
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
          </>
        ) : (
          <DropdownMenuGroup>
            <DropdownMenuItem asChild>
              <Link href="/bookings">
                <CalendarCheck /> My bookings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/rewards">
                <Gift /> Rewards
              </Link>
            </DropdownMenuItem>
          </DropdownMenuGroup>
        )}

        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/account">
            <UserRound /> Profile & security
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem variant="destructive" onClick={handleSignOut}>
          <LogOut /> Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
