"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Gift, ShieldCheck, Trash2 } from "lucide-react";
import ProfileName from "@/components/common/account/profile-name";
import ProfileEmail from "@/components/common/account/profile-email";
import ProfilePassword from "@/components/common/account/profile-password";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar } from "@/components/common/navigation/Dropdown";
import { useToast } from "@/hooks/use-toast";
import { authClient, IUser } from "../../../../auth-client";

export default function SettingsProfilePage({ user }: { user: IUser }) {
  const router = useRouter();
  const { toast } = useToast();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Social-only accounts have no password to change or email to edit here.
  const { data: accounts } = useQuery({
    queryKey: ["linked-accounts"],
    queryFn: async () => (await authClient.listAccounts()).data ?? [],
  });
  const hasPassword = accounts
    ? accounts.some((a) => a.providerId === "credential")
    : true;

  const handleDeleteAccount = async () => {
    setDeleting(true);
    const { error } = await authClient.deleteUser({ callbackURL: "/" });
    setDeleting(false);
    if (error) {
      toast({
        title: "Could not delete account",
        description: error.message,
        variant: "destructive",
      });
      return;
    }
    setConfirmOpen(false);
    toast({
      title: "Account deleted",
      description: "We're sorry to see you go.",
    });
    router.push("/");
    router.refresh();
  };

  const isAdmin = user.role === "admin";

  return (
    <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
      <aside className="h-fit space-y-5 rounded-3xl border bg-card p-6 text-center lg:sticky lg:top-24">
        <Avatar name={user.name} className="mx-auto size-20 text-2xl" />
        <div>
          <p className="font-display text-xl font-bold">{user.name}</p>
          <p className="text-sm text-muted-foreground">{user.email}</p>
        </div>
        <div className="flex justify-center gap-2">
          {isAdmin ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground">
              <ShieldCheck className="size-3.5" /> Administrator
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground">
              <Gift className="size-3.5" />{" "}
              {(user.reward_points ?? 0).toLocaleString()} points
            </span>
          )}
        </div>
        <Separator />
        <p className="text-xs text-muted-foreground">
          Member since {format(new Date(user.createdAt), "MMMM yyyy")}
        </p>
      </aside>

      <div className="space-y-6">
        <section className="rounded-3xl border bg-card p-6">
          <h2 className="mb-1 text-lg font-bold">Personal information</h2>
          <p className="mb-6 text-sm text-muted-foreground">
            Update your profile information to personalize your experience.
          </p>
          <div className="space-y-6">
            <ProfileName currentUser={user} />
            <Separator />
            {hasPassword ? (
              <ProfileEmail currentUser={user} />
            ) : (
              <p className="text-sm text-muted-foreground">
                You signed in with Google, so your email is managed by your
                Google account.
              </p>
            )}
          </div>
        </section>

        <section className="rounded-3xl border bg-card p-6">
          <h2 className="mb-1 text-lg font-bold">Security</h2>
          <p className="mb-6 text-sm text-muted-foreground">
            Changing your password signs you out on your other devices.
          </p>
          {hasPassword ? (
            <ProfilePassword />
          ) : (
            <p className="text-sm text-muted-foreground">
              You signed in with Google. To add a password, use the forgot
              password option on the sign-in page.
            </p>
          )}
        </section>

        {!isAdmin && (
          <section className="rounded-3xl border border-destructive/30 bg-card p-6">
            <h2 className="mb-1 text-lg font-bold text-destructive">
              Danger Zone
            </h2>
            <p className="mb-4 text-sm text-muted-foreground">
              Permanently delete your account and all associated data. Cancel
              any upcoming bookings first.
            </p>
            <Button
              variant="outline"
              className="border-destructive/40 text-destructive hover:bg-destructive hover:text-white"
              onClick={() => setConfirmOpen(true)}
            >
              <Trash2 /> Delete Account
            </Button>
          </section>
        )}
      </div>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete your account?</DialogTitle>
            <DialogDescription>
              This permanently removes your profile, booking history, and{" "}
              {(user.reward_points ?? 0).toLocaleString()} reward points. This
              can&apos;t be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>
              Keep my account
            </Button>
            <Button
              variant="destructive"
              loading={deleting}
              onClick={handleDeleteAccount}
            >
              Delete permanently
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
