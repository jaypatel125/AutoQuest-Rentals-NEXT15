"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { authClient } from "../../auth-client";
import { adminCustomersKeys } from "@/app/(admin)/admin/manage-users/actions";

export type UserRole = "admin" | "user";

type SetRoleArgs = {
  userId: string;
  role: UserRole;
};

type ToggleArgs = {
  userId: string;
  currentRole: UserRole;
};

export function useUserRoleMutations(opts?: {
  currentUserId?: string;
  onSuccess?: (args: SetRoleArgs) => void;
  onError?: (err: unknown, args: SetRoleArgs) => void;
}) {
  const queryClient = useQueryClient();

  const setRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: SetRoleArgs) => {
      if (
        opts?.currentUserId &&
        userId === opts.currentUserId &&
        role !== "admin"
      ) {
        throw new Error("You cannot change your own role.");
      }

      const { data, error } = await authClient.admin.setRole({
        userId,
        role,
      });
      if (error) {
        throw new Error(
          typeof error === "string" ? error : "Failed to set role"
        );
      }
      return data;
    },
    onSuccess: (_result, variables) => {
      queryClient.invalidateQueries({
        queryKey: adminCustomersKeys.all,
        exact: false,
      });
      opts?.onSuccess?.(variables);
    },

    onError: (err, variables) => {
      opts?.onError?.(err, variables);
    },
  });

  const toggleUserRole = async ({ userId, currentRole }: ToggleArgs) => {
    const nextRole: UserRole = currentRole === "admin" ? "user" : "admin";
    await setRoleMutation.mutateAsync({ userId, role: nextRole });
    return nextRole;
  };

  const setUserRole = async (args: SetRoleArgs) => {
    await setRoleMutation.mutateAsync(args);
    return args.role;
  };

  return {
    setUserRole,
    toggleUserRole,
    isPending: setRoleMutation.isPending,
    error: setRoleMutation.error as Error | null,
  };
}
