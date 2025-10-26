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

      <DropdownMenuContent className="w-56" align="end">
        {/* Account Section */}
        <DropdownMenuGroup>
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => router.push("/account")}>
            Profile
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleSignOut}>Log out</DropdownMenuItem>
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
          <DropdownMenuItem onClick={() => router.push("/admin/manage-users")}>
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
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
