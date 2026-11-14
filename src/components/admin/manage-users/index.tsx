"use client";

import * as React from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import {
  adminCustomersKeys,
  type CustomersPage,
  fetchAdminCustomersPage,
} from "../../../app/(admin)/admin/manage-users/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CustomersTable } from "@/components/admin/manage-users/customers-table";
import { useUserRoleMutations } from "@/hooks/use-toggle-role";
import { useAdminAccess } from "@/components/admin/AdminAccess";
import { useToast } from "@/hooks/use-toast";
import { ROLE_LABELS } from "@/lib/roles";
import { IUser } from "../../../../auth-client";
import { CustomersItem } from "@/app/api/admin/all-users/route";
import Error from "@/components/utility/Error";

export default function CustomersOverview({ user }: { user: IUser }) {
  const [q, setQ] = React.useState<string>("");
  const { readOnly } = useAdminAccess();
  const { toast } = useToast();
  const { setUserRole } = useUserRoleMutations({
    currentUserId: user.id,
    onSuccess: ({ role }) =>
      toast({ title: `Role changed to ${ROLE_LABELS[role]}` }),
    onError: (err) =>
      toast({
        title: "Could not change role",
        description: (err as Error).message,
        variant: "destructive",
      }),
  });
  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = useInfiniteQuery<CustomersPage>({
    queryKey: adminCustomersKeys.list(q),
    queryFn: ({ pageParam, signal }) =>
      fetchAdminCustomersPage({
        cursor: (pageParam as string | null) ?? null,
        limit: 15,
        q,
        signal,
      }),
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    staleTime: 30_000,
    refetchOnWindowFocus: false,
    initialPageParam: null,
  });

  const customers: CustomersItem[] = React.useMemo(
    () =>
      data?.pages.flatMap((p) =>
        p.customers.map((c) => ({
          id: c.id,
          name: c.name,
          email: c.email,
          bookingsCount: c.bookingsCount,
          revenue: c.revenue,
          createdAt: c.createdAt,
          lastBookedAt: c.lastBookedAt,
          role: c.role,
          banned: c.banned,
          banReason: c.banReason,
          banExpires: c.banExpires,
          demo: c.demo,
        }))
      ) ?? [],
    [data]
  );

  if (isError) {
    return <Error error="An error occurred while fetching customers." />;
  }

  return (
    <div>
      <div className="space-y-8">
        <div className="flex items-center gap-2">
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={
              readOnly ? "Search by name…" : "Search name, username, or email…"
            }
            className="w-full max-w-sm"
          />
          <Button onClick={() => refetch()} variant="outline">
            Search
          </Button>
        </div>

        <CustomersTable
          rows={customers}
          loading={isLoading || isFetchingNextPage}
          hasNextPage={!!hasNextPage}
          onLoadMore={() => fetchNextPage()}
          onSetRole={async (id, role) => {
            await setUserRole({ userId: id, role }).catch(() => undefined);
          }}
          currentUserId={user.id}
        />
      </div>
    </div>
  );
}
