"use client";

import Link from "next/link";
import MaxWidthWrapper from "../../utility/MaxWidthWrapper";
import { ISession, IUser } from "../../../../auth-client";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "../../ui/button";
import { Dropdown } from "./Dropdown";
import { isAuthRoutes } from "@/lib/utils";
import Image from "next/image";

const Navbar = ({
  user,
  session,
}: {
  session: ISession | null;
  user: IUser | null | undefined;
}) => {
  const router = useRouter();
  const pathname = usePathname();
  let renderNavbar: boolean = true;

  if (isAuthRoutes(pathname)) {
    renderNavbar = false;
  }

  return (
    renderNavbar && (
      <div className="sticky top-0 inset-x-0 z-40">
        <div
          className={`bg-background/80 dark:bg-dark-background/80 backdrop-blur-md transition-colors duration-200`}
        >
          <header className="relative h-16 mx-auto my-auto border-b w-full duration-200">
            <MaxWidthWrapper className="h-16">
              <nav className="text-sm flex items-center justify-between w-full h-full">
                <div className="flex items-center gap-4">
                  <div className="flex items-center h-full">
                    <Link href="/">
                      <Image
                        src="/logo-2.png"
                        width={160}
                        height={60}
                        alt="AutoQuest logo"
                      />
                    </Link>
                  </div>
                </div>

                <div className="flex items-center h-full flex-1 basis-0 justify-end gap-5">
                  {user && user.role !== "admin" && (
                    <div className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-3 py-1.5 rounded-full text-sm font-medium hidden md:block">
                      <span>{user.reward_points} pts</span>
                    </div>
                  )}
                  {!user || !session ? (
                    <div>
                      <Button
                        variant="outline"
                        iconType="sign-in"
                        onClick={() => router.push("/signin")}
                      >
                        Sign In
                      </Button>
                    </div>
                  ) : (
                    <div>{user && <Dropdown user={user} />}</div>
                  )}
                </div>
              </nav>
            </MaxWidthWrapper>
          </header>
        </div>
      </div>
    )
  );
};

export default Navbar;
