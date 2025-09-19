"use client";

import Link from "next/link";
import { Dispatch, SetStateAction } from "react";
import { useIsMobile } from "@/hooks/useIsMobile";
import { useRouter } from "next/navigation";
import { authClient, IUser } from "../../../auth-client";
import useUserStore from "@/lib/store/useUserStore";
import { Switch } from "../ui/switch";
import { Sheet, SheetClose, SheetContent, SheetTrigger } from "../ui/sheet";
import { IoMenu } from "react-icons/io5";

interface SideMenuProps {
  setDialogOpen: Dispatch<SetStateAction<boolean>>;
  user: IUser | null | undefined;
}

const SideMenu = ({ setDialogOpen, user }: SideMenuProps) => {
  const { logoutUser } = useUserStore();
  const isMobile = useIsMobile();
  const router = useRouter();

  const getGreeting = (userData: IUser | null | undefined) => {
    const currentHour = new Date().getHours();
    const userName = userData?.name || "";

    let greeting = "";

    if (currentHour >= 5 && currentHour < 12) {
      greeting = "Good Morning";
    } else if (currentHour >= 12 && currentHour < 17) {
      greeting = "Good Afternoon";
    } else {
      greeting = "Good Evening";
    }

    return userName ? `${greeting}, ${userName}!` : `${greeting}!`;
  };

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
    } finally {
      logoutUser();
    }
  };

  const SideMenuItems = [
    { label: "Home", href: "/" },
    { label: "Store", href: "/products/category/all" },
    ...(user?.role === "admin"
      ? [{ label: "Dashboard", href: "/dashboard" }]
      : []),
    ...(user?.role === "seller" || user?.role === "admin"
      ? [{ label: " Seller Dashboard", href: "/seller-dashboard" }]
      : []),
    { label: "Account", href: "/account" },
    { label: "Cart", href: "/cart" },
    ...(user
      ? [{ label: "Sign out", action: handleSignOut }]
      : isMobile
      ? [{ label: "Sign In", action: () => setDialogOpen(true) }]
      : []),
  ];

  return (
    <Sheet>
      <SheetTrigger className="group flex items-center hover:text-muted-foreground ">
        <IoMenu size={28} />
      </SheetTrigger>
      <SheetContent
        side={"left"}
        className="flex w-full flex-col sm:max-w-lg z-[1000000] h-full"
      >
        <div className="flex flex-col h-full justify-between p-6">
          <div className="flex flex-col justify-center flex-grow">
            <h2 className="text-3xl font-semibold mb-10">
              {getGreeting(user)}
            </h2>
            <ul className="flex flex-col gap-4">
              {SideMenuItems.map((item, index) => (
                <li key={index}>
                  {item.href ? (
                    <SheetClose asChild>
                      <Link
                        href={item.href}
                        className="text-xl font-medium hover:text-muted-foreground"
                      >
                        {item.label}
                      </Link>
                    </SheetClose>
                  ) : (
                    <SheetClose asChild>
                      <button
                        className="text-xl font-medium hover:text-muted-foreground"
                        onClick={item.action}
                      >
                        {item.label}
                      </button>
                    </SheetClose>
                  )}
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-6 border-t pt-4">
            <p className="text-sm flex items-center justify-between">
              <span>
                © {new Date().getFullYear()} Polaris , Inc. All rights reserved.
              </span>
              <Switch id="airplane-mode" />
            </p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default SideMenu;
