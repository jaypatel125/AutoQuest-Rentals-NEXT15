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
      await authClient.deleteUser({
        callbackURL: "/signin",
      });
      setTimeout(() => {
        router.push("/signin");
      }, 1000);
    }
  };

  const lastloginMethod = authClient.getLastUsedLoginMethod();

  return (
    <div className="space-y-8">
      <ProfileName currentUser={user} />
      <Separator />
      {lastloginMethod === "email" ? (
        <ProfileEmail currentUser={user} />
      ) : (
        <div className="text-muted-foreground text-sm">
          If you have signed in using a social provider (google), you cannot
          change your email.
        </div>
      )}
      <Separator />
      {lastloginMethod === "email" ? (
        <ProfilePassword />
      ) : (
        <div className="text-muted-foreground text-sm">
          If you have signed in using a social provider (google), you cannot
          change your password here. Use forgot password option on the signin
          page
        </div>
      )}

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
