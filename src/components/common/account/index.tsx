"use client";
import { Separator } from "@/components/ui/separator";
import ProfileName from "@/components/common/account/profile-name";
import ProfileEmail from "@/components/common/account/profile-email";
import ProfilePassword from "@/components/common/account/profile-password";
import { Button } from "@/components/ui/button";
import { authClient, IUser } from "../../../../auth-client";
import { useRouter } from "next/navigation";

export default function SettingsProfilePage({ user }: { user: IUser }) {
  const router = useRouter();

  const handleDeleteAccount = async () => {
    if (user) {
      const confirm = window.confirm(
        "Are you sure you want to delete your account?"
      );
      if (confirm) {
        await authClient.deleteUser({
          callbackURL: "/signin",
        });
        setTimeout(() => {
          router.push("/signin");
        }, 1000);
      }
    }
  };

  return (
    <div className="space-y-8">
      <ProfileName currentUser={user} />
      <Separator />
      <ProfileEmail currentUser={user} />
      <Separator />
      <ProfilePassword />
      <Separator />

      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-destructive">
            Danger Zone
          </h3>
          <p className="text-sm text-muted-foreground">
            Permanently delete your account and all associated data.
          </p>
        </div>
        <Button
          variant="outline"
          className="text-destructive border-destructive hover:bg-destructive hover:text-white"
          onClick={handleDeleteAccount}
        >
          Delete Account
        </Button>
      </div>
    </div>
  );
}
