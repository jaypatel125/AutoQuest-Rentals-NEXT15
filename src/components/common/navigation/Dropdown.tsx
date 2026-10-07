"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
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
      className={`inline-flex size-7 shrink-0 items-center justify-center rounded-full bg-muted text-[11px] font-medium text-foreground ${className}`}
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
          className="flex cursor-pointer items-center gap-2 rounded-full py-1 pr-2 pl-1 text-sm transition-colors hover:bg-accent"
          aria-label="Open account menu"
        >
          <Avatar name={user.name} />
          <span className="hidden max-w-[9rem] truncate sm:inline">
            {user.name}
          </span>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-60" align="end" sideOffset={8}>
        <DropdownMenuLabel className="py-2 font-normal">
          <p className="truncate text-sm font-medium">{user.name}</p>
          <p className="truncate text-xs text-muted-foreground">{user.email}</p>
          <p className="mt-1 text-xs text-muted-foreground tabular-nums">
            {isAdmin
              ? "Admin"
              : `${(user.reward_points ?? 0).toLocaleString()} pts`}
          </p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {isAdmin ? (
          <>
            <DropdownMenuGroup>
              {ADMIN_NAV.map(({ href, label }) => (
                <DropdownMenuItem key={href} asChild>
                  <Link href={href}>{label}</Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              {ADMIN_QUICK_ADD.map(({ href, label }) => (
                <DropdownMenuItem key={href} asChild>
                  <Link href={href}>{label}</Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
          </>
        ) : (
          <DropdownMenuGroup>
            <DropdownMenuItem asChild>
              <Link href="/bookings">My bookings</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/rewards">Rewards</Link>
            </DropdownMenuItem>
          </DropdownMenuGroup>
        )}

        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/account">Profile & security</Link>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleSignOut}>Sign out</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
