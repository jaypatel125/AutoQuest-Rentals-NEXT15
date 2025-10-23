"use client";
import React, { useState } from "react";
import { authClient, IUser } from "../../../../../auth-client";
import AccountInfo from "../AccountInfo";
import { Input } from "@/components/ui/input";
import { z } from "zod";
import { getEmailSchema } from "@/lib/zod";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

const profileFormSchema = z.object({
  email: getEmailSchema().optional(),
});

const ProfileEmail = ({ currentUser }: { currentUser: IUser }) => {
  const [successState, setSuccessState] = useState(false);
  const [errorState, setErrorState] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const router = useRouter();
  const { toast } = useToast();

  const hasChanges = email.trim() !== currentUser?.email;

  const validateEmail = (email: string) => {
    try {
      profileFormSchema.parse({ email });

      return null;
    } catch (error) {
      if (error instanceof z.ZodError) {
        return error.message;
      }
      toast({
        title: "Error",
        description:
          (error as Error).message ||
          "An unexpected error occurred during validation.",
      });
      return "An unexpected error occurred.";
    }
  };

  const updateCustomerEmail = async () => {
    setLoading(true);
    setErrorState(null);
    try {
      const validationError = validateEmail(email);
      if (validationError) {
        setErrorState(validationError);
        return;
      }

      await authClient.changeEmail({
        newEmail: email,
        callbackURL: `${process.env.NEXT_PUBLIC_APP_URL}/account/profile`,
      });

      setSuccessState(true);
      toast({
        title: "Success",
        description: "Email updated successfully.",
      });
      router.refresh();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("Error updating email:", error);
      toast({
        title: "Error",
        description:
          error.message || "An unexpected error occurred while updating email.",
      });

      setErrorState(error.toString());
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
      className="w-full space-y-4"
    >
      <AccountInfo
        label="Email"
        currentInfo={currentUser.email}
        isSuccess={successState}
        isError={!!errorState}
        clearState={clearState}
        data-testid="account-email-editor"
        isLoading={loading}
      >
        <div className="space-y-4">
          <Input
            name="email"
            required
            value={email}
            disabled={loading}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full"
            data-testid="email-input"
          />
          {errorState && <p className="text-red-500 text-sm">{errorState}</p>}
        </div>
      </AccountInfo>
    </form>
  );
};

export default ProfileEmail;
