"use client";

import Link from "next/link";
import MaxWidthWrapper from "../../utility/MaxWidthWrapper";
import { ISession, IUser } from "../../../../auth-client";
import { useParams, useRouter } from "next/navigation";
import { Button } from "../../ui/button";
import { Dropdown } from "./Dropdown";

const Navbar = ({
  user,
}: {
  session: ISession | null;
  user: IUser | null | undefined;
}) => {
  const router = useRouter();
  const params = useParams();
  const renderSignInTag = !user;

  if (params && (params.slug === "signin" || params.slug === "signup")) {
  }

  return (
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
                    <p className="text-3xl font-extrabold tracking-tight text-primary underline">
                      Auto<span className="text-blue-600">Quest</span>
                    </p>
                  </Link>
                </div>
              </div>

              <div className="flex items-center h-full flex-1 basis-0 justify-end gap-5">
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
                  <div>{user && <Dropdown user={user} />}</div>
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
