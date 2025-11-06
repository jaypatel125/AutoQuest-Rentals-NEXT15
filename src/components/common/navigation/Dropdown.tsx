import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { RiArrowDropDownLine } from "react-icons/ri";
import { useRouter } from "next/navigation";
import { authClient, IUser } from "../../../../auth-client";

export function Dropdown({ user }: { user: IUser }) {
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
      <DropdownMenuTrigger asChild>
        <Button variant="outline">
          Hi, {user?.name} <RiArrowDropDownLine />
        </Button>
      </DropdownMenuTrigger>
      {user.role === "admin" ? (
        <DropdownMenuContent className="w-56" align="end">
          {/* Account Section */}
          <DropdownMenuGroup>
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => router.push("/account")}>
              Profile
            </DropdownMenuItem>
          </DropdownMenuGroup>

          <DropdownMenuSeparator />

          {/* Dashboard Section */}
          <DropdownMenuGroup>
            <DropdownMenuLabel>Dashboards</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => router.push("/admin/")}>
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
              Users
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => router.push("/admin/manage-bookings")}
            >
              Bookings
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => router.push("/admin/manage-vehicles")}
            >
              Vehicles
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => router.push("/admin/manage-branches")}
            >
              Branches
            </DropdownMenuItem>
          </DropdownMenuGroup>

          <DropdownMenuSeparator />

          {/* Add New Section */}
          <DropdownMenuGroup>
            <DropdownMenuLabel>Add New</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => router.push("/admin/add-vehicle")}>
              Vehicle
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push("/admin/add-branch")}>
              Branch
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleSignOut}>Log out</DropdownMenuItem>
        </DropdownMenuContent>
      ) : (
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
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push("/bookings")}>
              My Bookings
            </DropdownMenuItem>
          </DropdownMenuGroup>

          <DropdownMenuSeparator />

          {/* Quick Actions */}
          <DropdownMenuLabel>Quick Actions</DropdownMenuLabel>
          <DropdownMenuGroup>
            <DropdownMenuItem onClick={() => router.push("/select-vehicle")}>
              Start a Booking
            </DropdownMenuItem>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>Contact Support</DropdownMenuSubTrigger>
              <DropdownMenuPortal>
                <DropdownMenuSubContent>
                  <DropdownMenuItem onClick={() => router.push("/contact")}>
                    Email Support
                  </DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuPortal>
            </DropdownMenuSub>
          </DropdownMenuGroup>

          <DropdownMenuSeparator />

          {/* Legal & Info */}
          <DropdownMenuLabel>Information</DropdownMenuLabel>
          <DropdownMenuGroup>
            <DropdownMenuItem onClick={() => router.push("/terms")}>
              Terms & Conditions
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push("/rewards")}>
              Rewards & Points
            </DropdownMenuItem>
          </DropdownMenuGroup>

          <DropdownMenuSeparator />

          {/* Sign Out */}
          <DropdownMenuItem onClick={handleSignOut}>Log out</DropdownMenuItem>
        </DropdownMenuContent>
      )}
    </DropdownMenu>
  );
}
