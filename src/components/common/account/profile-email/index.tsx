"use client";
import React, { useState } from "react";
import { Mail } from "lucide-react";
import { authClient, IUser } from "../../../../../auth-client";
import AccountInfo from "../AccountInfo";
import { Input } from "@/components/ui/input";
import { getEmailSchema } from "@/lib/zod";
import { useToast } from "@/hooks/use-toast";

const ProfileEmail = ({ currentUser }: { currentUser: IUser }) => {
  const [successState, setSuccessState] = useState(false);
  const [errorState, setErrorState] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const { toast } = useToast();

  const hasChanges =
    email.trim().toLowerCase() !== currentUser?.email?.toLowerCase();

  const updateCustomerEmail = async () => {
    setErrorState(null);
    const parsed = getEmailSchema().safeParse(email);
    if (!parsed.success) {
      setErrorState(parsed.error.issues[0]?.message ?? "Invalid email");
      return;
    }

    setLoading(true);
    try {
      const { error } = await authClient.changeEmail({
        newEmail: parsed.data,
        callbackURL: "/account",
      });
      if (error) throw new Error(error.message || "Could not update email");

      setSuccessState(true);
      setEmail("");
      toast({
        title: "Check your inbox",
        description: `We sent a link to ${currentUser.email} to approve the change.`,
      });
    } catch (error) {
      const message =
        (error as Error).message ||
        "An unexpected error occurred while updating email.";
      toast({ title: "Error", description: message, variant: "destructive" });
      setErrorState(message);
    } finally {
      setLoading(false);
    }
  };

  const clearState = () => {
    setSuccessState(false);
    setErrorState(null);
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (hasChanges) {
          updateCustomerEmail();
        }
      }}
      className="w-full"
    >
      <AccountInfo
        label="Email"
        icon={<Mail className="size-5" />}
        currentInfo={currentUser.email}
        isSuccess={successState}
        isError={!!errorState}
        clearState={clearState}
        data-testid="account-email-editor"
        isLoading={loading}
      >
        <div className="space-y-2">
          <Input
            name="email"
            type="email"
            required
            value={email}
            placeholder="new@email.com"
            autoComplete="email"
            disabled={loading}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full"
            data-testid="email-input"
          />
          <p className="text-xs text-muted-foreground">
            For your security, we&apos;ll ask you to approve the change from
            your current inbox.
          </p>
          {errorState && (
            <p className="text-sm text-destructive">{errorState}</p>
          )}
        </div>
      </AccountInfo>
    </form>
  );
};

export default ProfileEmail;
