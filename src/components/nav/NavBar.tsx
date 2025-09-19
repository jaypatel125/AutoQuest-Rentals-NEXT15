"use client";

import Link from "next/link";
import MaxWidthWrapper from "../utility/MaxWidthWrapper";
import { ISession, IUser } from "../../../auth-client";
import { useIsMobile } from "@/hooks/useIsMobile";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import useUserStore from "@/lib/store/useUserStore";
import { Button } from "../ui/button";
import { Dropdown } from "./Dropdown";

const Navbar = ({
  session,
  user,
}: {
  session: ISession | null;
  user: IUser | null | undefined;
}) => {
  const { setCurrentUser, setSession } = useUserStore();

  useEffect(() => {
    if (session) {
      setSession(session);
    }
    if (user) {
      setCurrentUser(user);
    }
  }, [session, user, setCurrentUser, setSession]);

  // console.log("user in nav", user);
  // console.log("session in nav", session);

  const router = useRouter();

  const isMobile = useIsMobile();

  const renderSignInTag = !user && !isMobile;

  return (
    <div className="sticky top-0 inset-x-0 z-40">
      <div
        className={`bg-background/80 dark:bg-dark-background/80 backdrop-blur-md transition-colors duration-200`}
      >
        <header className="relative h-16 mx-auto border-b duration-200">
          <MaxWidthWrapper>
            <nav className="text-sm flex items-center justify-between w-full h-full">
              <div className="flex items-center gap-4">
                <div className="flex items-center h-full">
                  <Link href="/">
                    <p className="text-3xl font-extrabold tracking-tight text-primary underline">
                      Auto<span className="text-blue-600">Quest</span>
                    </p>
                  </Link>
                </div>
              </div>

              <div className="flex items-center h-full flex-1 basis-0 justify-end">
                <div className="hidden small:flex items-center gap-x-6 h-full">
                  {process.env.NEXT_PUBLIC_FEATURE_SEARCH_ENABLED && (
                    <Link
                      className="hover:text-muted-foreground"
                      href="/search"
                      data-testid="nav-search-link"
                    >
                      Search
                    </Link>
                  )}
                  <Link
                    className="hover:text-muted-foreground"
                    href="/account"
                    data-testid="nav-account-link"
                  >
                    Account
                  </Link>
                </div>
                {renderSignInTag ? (
                  <div>
                    <Button
                      variant="outline"
                      onClick={() => router.push("/signin")}
                      className="text-sm hover:text-muted-foreground cursor-pointer"
                    >
                      Sign In
                    </Button>
                  </div>
                ) : (
                  <div>{user && <Dropdown />}</div>
                )}
              </div>
            </nav>
          </MaxWidthWrapper>
        </header>
      </div>
    </div>
  );
};

export default Navbar;
