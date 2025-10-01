"use client";
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import AccountInfo from "../AccountInfo";
import { authClient } from "../../../../auth-client";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";

const profileFormSchema = z.object({
  password: z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .optional(),
});

const ProfilePassword = () => {
  const [successState, setSuccessState] = useState(false);
  const [errorState, setErrorState] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const { toast } = useToast();

  const validatePassword = (newPassword: string) => {
    try {
      profileFormSchema.parse({ password: newPassword });
      return null;
    } catch (error) {
      if (error instanceof z.ZodError) {
        return error.message;
      }
      return "An unexpected error occurred.";
    }
  };

  const updateCustomerPassword = async () => {
    setLoading(true);
    setErrorState(null);
    try {
      await authClient.changePassword({
        newPassword: newPassword,
        currentPassword: currentPassword,
        revokeOtherSessions: true,
      });
      setSuccessState(true);
      toast({
        title: "Success",
        description: "Password updated successfully.",
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("Error updating password:", error);
      toast({
        title: "Error",
        description:
          error.message ||
          "An unexpected error occurred while updating password.",
      });
      setErrorState(error.toString());
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    const validationError = validatePassword(newPassword);
    if (validationError) {
      setErrorState(validationError);
      return;
    }

    updateCustomerPassword();
  };

  const clearState = () => {
    setSuccessState(false);
    setErrorState(null);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-4">
      <AccountInfo
        label="Password"
        currentInfo={"The password is not shown for security reasons."}
        isSuccess={successState}
        isError={!!errorState}
        clearState={clearState}
        data-testid="account-password-editor"
        isLoading={loading}
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Current Password</p>
            <Input
              name="current-password"
              type="password"
              required
              onChange={(e) => setCurrentPassword(e.target.value)}
              disabled={loading}
              data-testid="current-password-input"
              className="w-full"
            />
          </div>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">New Password</p>
            <Input
              name="password"
              type="password"
              required
              onChange={(e) => setNewPassword(e.target.value)}
              disabled={loading}
              data-testid="new-password-input"
              className="w-full"
            />
          </div>
          {errorState && <p className="text-red-500 text-sm">{errorState}</p>}
        </div>
      </AccountInfo>
    </form>
  );
};

export default ProfilePassword;
