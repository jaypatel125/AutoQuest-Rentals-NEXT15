"use client";
import { Separator } from "@/components/ui/separator";
import ProfileName from "@/components/common/account/profile-name";
import ProfileEmail from "@/components/common/account/profile-email";
import ProfilePassword from "@/components/common/account/profile-password";
import { Button } from "@/components/ui/button";
import { authClient, IUser } from "../../../../auth-client";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

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
    <div className="py-6 space-y-6">
      <Button
        variant="ghost"
        onClick={() => router.back()}
        className="gap-2 px-0"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </Button>

      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-xl font-bold tracking-tight">Profile Settings</h1>
          <p className="text-muted-foreground">
            Update your profile information to personalize your shopping
            experience.
          </p>
        </div>

        <Separator />

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
      </div>
    </div>
  );
}
