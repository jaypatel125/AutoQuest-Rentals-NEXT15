"use client";
import React, { useEffect, useState } from "react";
import { authClient, IUser } from "../../../../auth-client";
import AccountInfo from "../AccountInfo";
import { Input } from "@/components/ui/input";
import useUserStore from "@/context/useUserStore";
import { z } from "zod";
import { getEmailSchema } from "@/lib/zod";
import { useRouter } from "next/navigation";

const profileFormSchema = z.object({
  email: getEmailSchema().optional(),
});

const ProfileEmail = ({ currentUser }: { currentUser: IUser }) => {
  const [successState, setSuccessState] = useState(false);
  const [errorState, setErrorState] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [email, setEmail] = useState("");

  const setCurrentUser = useUserStore((state) => state.setCurrentUser);

  const hasChanges = email.trim() !== currentUser?.email;

  useEffect(() => {
    if (currentUser?.email) {
      setEmail(currentUser.email);
    }
  }, [currentUser]);

  const validateEmail = (email: string) => {
    try {
      profileFormSchema.parse({ email });
      return null;
    } catch (error) {
      if (error instanceof z.ZodError) {
        return error.message;
      }
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

      setCurrentUser({ ...currentUser, email });
      setSuccessState(true);
      router.refresh();
    } catch (error: any) {
      console.error("Error updating email:", error);
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
      className="w-full overflow-visible space-y-4 md:space-y-6"
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
        <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4">
          <Input
            name="email"
            required
            value={email}
            disabled={loading}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full sm:w-auto flex-grow"
            data-testid="email-input"
          />
        </div>

        {errorState && (
          <p className="text-red-500 mt-2 text-sm">{errorState}</p>
        )}
      </AccountInfo>
    </form>
  );
};

export default ProfileEmail;
