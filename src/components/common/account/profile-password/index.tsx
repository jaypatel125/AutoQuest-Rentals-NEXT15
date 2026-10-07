"use client";
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AccountInfo from "../AccountInfo";
import { authClient } from "../../../../../auth-client";
import { getPasswordSchema } from "@/lib/zod";
import { useToast } from "@/hooks/use-toast";

const ProfilePassword = () => {
  const [successState, setSuccessState] = useState(false);
  const [errorState, setErrorState] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const { toast } = useToast();

  const updateCustomerPassword = async () => {
    setLoading(true);
    setErrorState(null);
    try {
      const { error } =
        (await authClient.changePassword({
          newPassword: newPassword,
          currentPassword: currentPassword,
          revokeOtherSessions: true,
        })) ?? {};
      if (error) throw new Error(error.message || "Could not update password");
      setSuccessState(true);
      setCurrentPassword("");
      setNewPassword("");
      toast({
        title: "Success",
        description: "Password updated. Other devices have been signed out.",
      });
    } catch (error) {
      const message =
        (error as Error).message ||
        "An unexpected error occurred while updating password.";
      toast({ title: "Error", description: message, variant: "destructive" });
      setErrorState(message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    const parsed = getPasswordSchema("password").safeParse(newPassword);
    if (!parsed.success) {
      setErrorState(parsed.error.issues[0]?.message ?? "Invalid password");
      return;
    }
    if (newPassword === currentPassword) {
      setErrorState("Choose a password different from your current one.");
      return;
    }

    updateCustomerPassword();
  };

  const clearState = () => {
    setSuccessState(false);
    setErrorState(null);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <AccountInfo
        label="Password"
        currentInfo={"The password is not shown for security reasons."}
        isSuccess={successState}
        isError={!!errorState}
        clearState={clearState}
        data-testid="account-password-editor"
        isLoading={loading}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="current-password">Current Password</Label>
            <Input
              id="current-password"
              name="current-password"
              type="password"
              autoComplete="current-password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              disabled={loading}
              data-testid="current-password-input"
              className="w-full"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-password">New Password</Label>
            <Input
              id="new-password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              disabled={loading}
              data-testid="new-password-input"
              className="w-full"
            />
          </div>
          {errorState && (
            <p className="text-sm text-destructive sm:col-span-2">
              {errorState}
            </p>
          )}
        </div>
      </AccountInfo>
    </form>
  );
};

export default ProfilePassword;
