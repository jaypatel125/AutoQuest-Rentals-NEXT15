"use client";
import { Separator } from "@/components/ui/separator";
import ProfileName from "../../components/account/profile-name";
import ProfileEmail from "../../components/account/profile-email";
import useUserStore from "@/context/useUserStore";
import ProfilePassword from "../../components/account/profile-password";
import { Button } from "@/components/ui/button";
import { authClient } from "./../../../auth-client";
import MaxWidthWrapper from "@/components/utility/MaxWidthWrapper";

export default function SettingsProfilePage() {
  const { currentUser, logoutUser } = useUserStore();

  const handleDeleteAccount = async () => {
    if (currentUser) {
      const confirm = window.confirm(
        "Are you sure you want to delete your account?"
      );
      if (confirm) {
        await authClient.deleteUser({
          callbackURL: "/signin",
        });
        logoutUser();
      }
    }
  };

  if (!currentUser) {
    return null;
  }

  return (
    <MaxWidthWrapper>
      <div className="space-y-6">
        <div>
          <h3 className="text-lg">Profile</h3>
          <p className="text-sm text-muted-foreground">
            Update your profile information to personalize your shopping
            experience.
          </p>
        </div>
        <Separator />
        <div className="flex flex-col gap-y-8 w-full">
          <ProfileName currentUser={currentUser!} />
          <Separator />
          <ProfileEmail currentUser={currentUser!} />
          <Separator />
          <ProfilePassword />
          <Separator />
          <div className="">
            <Button
              className="text-red-500"
              variant={"outline"}
              onClick={handleDeleteAccount}
            >
              Delete Account
            </Button>
          </div>
        </div>
      </div>
    </MaxWidthWrapper>
  );
}
