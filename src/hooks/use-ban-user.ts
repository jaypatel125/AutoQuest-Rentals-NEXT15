"use client";

import {
  useMutation,
  useQueryClient,
  InfiniteData,
} from "@tanstack/react-query";
import { authClient } from "../../auth-client";
import {
  adminCustomersKeys,
  type CustomersPage,
} from "@/app/(admin)/admin/manage-users/actions";

type BanArgs = {
  userId: string;
  banReason?: string;
  banExpiresIn?: number;
};

type UnbanArgs = {
  userId: string;
};

export function useUserBanMutations(opts?: {
  currentUserId?: string;
  onBanSuccess?: (args: BanArgs) => void;
  onUnbanSuccess?: (args: UnbanArgs) => void;
  onError?: (err: unknown) => void;
}) {
  const queryClient = useQueryClient();

  const banMutation = useMutation({
    mutationFn: async ({ userId, banReason, banExpiresIn }: BanArgs) => {
      if (opts?.currentUserId && userId === opts.currentUserId) {
        throw new Error("You cannot ban yourself.");
      }
      const { error } = await authClient.admin.banUser({
        userId,
        banReason,
        banExpiresIn,
      });
      if (error)
        throw new Error(
          typeof error === "string" ? error : "Failed to ban user"
        );
      return { userId, banReason, banExpiresIn };
    },

    onMutate: async ({ userId, banReason, banExpiresIn }) => {
      await queryClient.cancelQueries({
        queryKey: adminCustomersKeys.all,
      });

      const prev = queryClient.getQueriesData<InfiniteData<CustomersPage>>({
        queryKey: adminCustomersKeys.all,
      });

      const bannedUntil =
        typeof banExpiresIn === "number"
          ? new Date(Date.now() + banExpiresIn * 1000).toISOString()
          : null;

      prev.forEach(([key, old]) => {
        if (!old) return;
        queryClient.setQueryData<InfiniteData<CustomersPage>>(key, {
          ...old,
          pages: old.pages.map((p) => ({
            ...p,
            customers: p.customers.map((c) =>
              c.id === userId
                ? {
                    ...c,
                    isBanned: true,
                    bannedUntil,
                    bannedReason: banReason ?? c.banReason,
                  }
                : c
            ),
          })),
        });
      });

      return { prev };
    },

    onError: (err, _vars, ctx) => {
      ctx?.prev?.forEach(([key, old]) => queryClient.setQueryData(key, old));
      opts?.onError?.(err);
    },

    onSuccess: (_res, vars) => {
      queryClient.invalidateQueries({
        queryKey: adminCustomersKeys.all,
        exact: false,
      });
      opts?.onBanSuccess?.(vars);
    },
  });

  const unbanMutation = useMutation({
    mutationFn: async ({ userId }: UnbanArgs) => {
      const { error } = await authClient.admin.unbanUser({
        userId,
      });
      if (error)
        throw new Error(
          typeof error === "string" ? error : "Failed to unban user"
        );
      return { userId };
    },

    onMutate: async ({ userId }) => {
      await queryClient.cancelQueries({
        queryKey: adminCustomersKeys.all,
      });

      const prev = queryClient.getQueriesData<InfiniteData<CustomersPage>>({
        queryKey: adminCustomersKeys.all,
      });

      prev.forEach(([key, old]) => {
        if (!old) return;
        queryClient.setQueryData<InfiniteData<CustomersPage>>(key, {
          ...old,
          pages: old.pages.map((p) => ({
            ...p,
            customers: p.customers.map((c) =>
              c.id === userId
                ? {
                    ...c,
                    isBanned: false,
                    bannedUntil: null,
                    bannedReason: null,
                  }
                : c
            ),
          })),
        });
      });

      return { prev };
    },

    onError: (err, _vars, ctx) => {
      ctx?.prev?.forEach(([key, old]) => queryClient.setQueryData(key, old));
      opts?.onError?.(err);
    },

    onSuccess: (_res, vars) => {
      queryClient.invalidateQueries({
        queryKey: adminCustomersKeys.all,
        exact: false,
      });
      opts?.onUnbanSuccess?.(vars);
    },
  });

  const banUser = (args: BanArgs) => banMutation.mutateAsync(args);
  const unbanUser = (args: UnbanArgs) => unbanMutation.mutateAsync(args);

  return {
    banUser,
    unbanUser,
    isPending: banMutation.isPending || unbanMutation.isPending,
    banError: banMutation.error as Error | null,
    unbanError: unbanMutation.error as Error | null,
  };
}
