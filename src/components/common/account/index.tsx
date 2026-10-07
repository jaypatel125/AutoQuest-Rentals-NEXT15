"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import ProfileName from "@/components/common/account/profile-name";
import ProfileEmail from "@/components/common/account/profile-email";
import ProfilePassword from "@/components/common/account/profile-password";
import { Button } from "@/components/ui/button";
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
    <div className="grid gap-12 lg:grid-cols-[240px_1fr] lg:gap-16">
      <aside className="h-fit space-y-4 lg:sticky lg:top-24">
        <Avatar name={user.name} className="size-14 text-base" />
        <div>
          <p className="font-medium">{user.name}</p>
          <p className="text-sm text-muted-foreground">{user.email}</p>
        </div>
        <dl className="space-y-1 border-t pt-4 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted-foreground">
              {isAdmin ? "Role" : "Points"}
            </dt>
            <dd className="tabular-nums">
              {isAdmin
                ? "Administrator"
                : `${(user.reward_points ?? 0).toLocaleString()} points`}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Member since</dt>
            <dd>{format(new Date(user.createdAt), "MMM yyyy")}</dd>
          </div>
        </dl>
      </aside>

      <div className="divide-y">
        <section className="grid gap-6 pb-12 md:grid-cols-[200px_1fr]">
          <div>
            <h2 className="font-medium">Personal information</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Your name and email address.
            </p>
          </div>
          <div className="space-y-8">
            <ProfileName currentUser={user} />
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

        <section className="grid gap-6 py-12 md:grid-cols-[200px_1fr]">
          <div>
            <h2 className="font-medium">Security</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Changing your password signs you out on your other devices.
            </p>
          </div>
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
          <section className="grid gap-6 pt-12 md:grid-cols-[200px_1fr]">
            <div>
              <h2 className="font-medium">Delete account</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Permanently delete your account and all associated data.
              </p>
            </div>
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Cancel any upcoming bookings first.
              </p>
              <Button
                variant="outline"
                className="text-destructive hover:bg-destructive/5 hover:text-destructive"
                onClick={() => setConfirmOpen(true)}
              >
                Delete Account
              </Button>
            </div>
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
