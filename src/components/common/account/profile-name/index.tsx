"use client";
import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import AccountInfo from "../AccountInfo";
import { authClient, IUser } from "../../../../../auth-client";
import { z } from "zod";
import { getNameSchema } from "@/lib/zod";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

const profileFormSchema = z.object({
  username: getNameSchema().optional(),
});

const ProfileName = ({ currentUser }: { currentUser: IUser }) => {
  const [successState, setSuccessState] = useState(false);
  const [errorState, setErrorState] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const router = useRouter();
  const { toast } = useToast();

  const hasChanges = name.trim() !== currentUser?.name;

  useEffect(() => {
    if (currentUser?.name) {
      setName(currentUser.name);
    }
  }, [currentUser]);

  const validateName = (name: string) => {
    try {
      profileFormSchema.parse({ username: name });
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

  const updateCustomerName = async () => {
    setLoading(true);
    setErrorState(null);
    try {
      const validationError = validateName(name);
      if (validationError) {
        setErrorState(validationError);
        return;
      }

      await authClient.updateUser({ name });
      setSuccessState(true);
      toast({
        title: "Success",
        description: "Name updated successfully.",
      });
      router.refresh();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("Error updating name:", error);
      toast({
        title: "Error",
        description:
          error.message || "An unexpected error occurred while updating name.",
      });
      setErrorState(error.toString());
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (hasChanges) {
      updateCustomerName();
    }
  };

  const clearState = () => {
    setSuccessState(false);
    setErrorState(null);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-4">
      <AccountInfo
        label="Name"
        currentInfo={currentUser?.name || ""}
        isSuccess={successState}
        isError={!!errorState}
        clearState={clearState}
        data-testid="account-name-editor"
        isLoading={loading}
      >
        <div className="space-y-4">
          <Input
            name="name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={loading}
            data-testid="name-input"
            className="w-full"
          />
          {errorState && <p className="text-red-500 text-sm">{errorState}</p>}
        </div>
      </AccountInfo>
    </form>
  );
};

export default ProfileName;
