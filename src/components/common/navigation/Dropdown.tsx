"use client";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  IoPersonCircleOutline,
  IoList,
  IoCarSportOutline,
  IoPeopleOutline,
  IoBusinessOutline,
  IoAddCircleOutline,
  IoLogOutOutline,
  IoSpeedometerOutline,
  IoMailOutline,
  IoDocumentTextOutline,
  IoChevronDown,
  IoGiftOutline,
  IoLogInOutline,
} from "react-icons/io5";

import { useRouter } from "next/navigation";
import { authClient, IUser } from "../../../../auth-client";

export function Dropdown({ user }: { user?: IUser | null }) {
  const router = useRouter();

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
      {user ? (
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="border rounded-4xl"
            iconType="down-arrow"
          >
            <div className="flex items-center gap-2">
              <IoPersonCircleOutline size={20} />
              {user && `${user.name}`}
            </div>
          </Button>
        </DropdownMenuTrigger>
      ) : (
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="flex items-center gap-2 border-none shadow-none"
          >
            {/* Small screens: show icon + text */}
            <div className="flex items-center gap-2 md:hidden">
              <IoPersonCircleOutline className="!w-7 !h-7" />
            </div>

            {/* Medium and larger: show only down arrow */}
            <IoChevronDown size={18} className="hidden md:block" />
          </Button>
        </DropdownMenuTrigger>
      )}

      {!user ? (
        // Not signed in state
        <DropdownMenuContent className="w-60" align="end">
          <div className="md:hidden">
            <DropdownMenuItem onClick={() => router.push("/signin")}>
              <IoLogInOutline size={18} className="mr-2 text-green-600" />
              <span className="text-green-600">Sign In</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </div>

          <DropdownMenuLabel>Quick Actions</DropdownMenuLabel>
          <DropdownMenuGroup>
            <DropdownMenuItem onClick={() => router.push("/select-vehicle")}>
              <IoCarSportOutline size={18} className="mr-2" />
              Start a Booking
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push("/contact")}>
              <IoMailOutline size={18} className="mr-2" />
              Email Support
            </DropdownMenuItem>
          </DropdownMenuGroup>

          <DropdownMenuSeparator />

          <DropdownMenuLabel>Information</DropdownMenuLabel>
          <DropdownMenuGroup>
            <DropdownMenuItem onClick={() => router.push("/terms")}>
              <IoDocumentTextOutline size={18} className="mr-2" />
              Terms & Conditions
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push("/rewards")}>
              <IoGiftOutline size={18} className="mr-2" />
              Rewards & Points
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      ) : user.role === "admin" ? (
        // Admin user state
        <DropdownMenuContent className="w-56" align="end">
          {/* Account Section */}
          <DropdownMenuGroup>
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => router.push("/account")}>
              <IoPersonCircleOutline size={18} className="mr-2" />
              Profile
            </DropdownMenuItem>
          </DropdownMenuGroup>

          <DropdownMenuSeparator />

          {/* Dashboard Section */}
          <DropdownMenuGroup>
            <DropdownMenuLabel>Dashboards</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => router.push("/admin/")}>
              <IoSpeedometerOutline size={18} className="mr-2" />
              Sales Overview
            </DropdownMenuItem>
          </DropdownMenuGroup>

          <DropdownMenuSeparator />

          {/* Management Section */}
          <DropdownMenuGroup>
            <DropdownMenuLabel>Management</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => router.push("/admin/manage-users")}
            >
              <IoPeopleOutline size={18} className="mr-2" />
              Users
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => router.push("/admin/manage-bookings")}
            >
              <IoList size={18} className="mr-2" />
              Bookings
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => router.push("/admin/manage-vehicles")}
            >
              <IoCarSportOutline size={18} className="mr-2" />
              Vehicles
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => router.push("/admin/manage-branches")}
            >
              <IoBusinessOutline size={18} className="mr-2" />
              Branches
            </DropdownMenuItem>
          </DropdownMenuGroup>

          <DropdownMenuSeparator />

          {/* Add New Section */}
          <DropdownMenuGroup>
            <DropdownMenuLabel>Add New</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => router.push("/admin/add-vehicle")}>
              <IoAddCircleOutline size={18} className="mr-2" />
              Vehicle
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push("/admin/add-branch")}>
              <IoAddCircleOutline size={18} className="mr-2" />
              Branch
            </DropdownMenuItem>
          </DropdownMenuGroup>

          <DropdownMenuSeparator />

          <DropdownMenuItem onClick={handleSignOut}>
            <IoLogOutOutline size={18} className="mr-2 text-red-600" />
            <span className="text-red-600">Log out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      ) : (
        // Regular user state
        <DropdownMenuContent className="w-60" align="end">
          {/* Account Overview */}
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
          {user && (
            <div className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-3 py-1.5 rounded-full text-sm font-medium md:hidden block">
              <span>{user.reward_points} pts</span>
            </div>
          )}

          <DropdownMenuGroup>
            <DropdownMenuItem onClick={() => router.push("/account")}>
              <IoPersonCircleOutline size={18} className="mr-2" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push("/bookings")}>
              <IoList size={18} className="mr-2" />
              My Bookings
            </DropdownMenuItem>
          </DropdownMenuGroup>

          <DropdownMenuSeparator />

          {/* Quick Actions */}
          <DropdownMenuLabel>Quick Actions</DropdownMenuLabel>
          <DropdownMenuGroup>
            <DropdownMenuItem onClick={() => router.push("/select-vehicle")}>
              <IoCarSportOutline size={18} className="mr-2" />
              Start a Booking
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push("/contact")}>
              <IoMailOutline size={18} className="mr-2" />
              Email Support
            </DropdownMenuItem>
          </DropdownMenuGroup>

          <DropdownMenuSeparator />

          {/* Legal & Info */}
          <DropdownMenuLabel>Information</DropdownMenuLabel>
          <DropdownMenuGroup>
            <DropdownMenuItem onClick={() => router.push("/terms")}>
              <IoDocumentTextOutline size={18} className="mr-2" />
              Terms & Conditions
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push("/rewards")}>
              <IoGiftOutline size={18} className="mr-2" />
              Rewards & Points
            </DropdownMenuItem>
          </DropdownMenuGroup>

          <DropdownMenuSeparator />

          {/* Sign Out */}
          <DropdownMenuItem onClick={handleSignOut}>
            <IoLogOutOutline size={18} className="mr-2 text-red-600" />
            <span className="text-red-600">Log out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      )}
    </DropdownMenu>
  );
}
