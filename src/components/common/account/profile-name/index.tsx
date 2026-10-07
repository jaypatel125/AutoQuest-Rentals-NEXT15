"use client";
import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import AccountInfo from "../AccountInfo";
import { authClient, IUser } from "../../../../../auth-client";
import { getNameSchema } from "@/lib/zod";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

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

  const updateCustomerName = async () => {
    setErrorState(null);
    const parsed = getNameSchema().safeParse(name);
    if (!parsed.success) {
      setErrorState(parsed.error.issues[0]?.message ?? "Invalid name");
      return;
    }

    setLoading(true);
    try {
      const { error } =
        (await authClient.updateUser({ name: parsed.data })) ?? {};
      if (error) throw new Error(error.message || "Could not update name");
      setSuccessState(true);
      toast({
        title: "Success",
        description: "Name updated successfully.",
      });
      router.refresh();
    } catch (error) {
      const message =
        (error as Error).message ||
        "An unexpected error occurred while updating name.";
      toast({ title: "Error", description: message, variant: "destructive" });
      setErrorState(message);
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
    <form onSubmit={handleSubmit} className="w-full">
      <AccountInfo
        label="Name"
        currentInfo={currentUser?.name || ""}
        isSuccess={successState}
        isError={!!errorState}
        clearState={clearState}
        data-testid="account-name-editor"
        isLoading={loading}
      >
        <div className="space-y-2">
          <Input
            name="name"
            required
            value={name}
            maxLength={50}
            autoComplete="name"
            onChange={(e) => setName(e.target.value)}
            disabled={loading}
            data-testid="name-input"
            className="w-full"
          />
          {errorState && (
            <p className="text-sm text-destructive">{errorState}</p>
          )}
        </div>
      </AccountInfo>
    </form>
  );
};

export default ProfileName;
