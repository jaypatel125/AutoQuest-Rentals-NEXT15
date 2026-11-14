"use client";

import * as React from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useRouter } from "next/navigation";
import { useUserBanMutations } from "@/hooks/use-ban-user";
import { CustomersItem } from "@/app/api/admin/all-users/route";
import Loader from "@/components/utility/Loader";
import { useAdminAccess } from "@/components/admin/AdminAccess";
import { type AppRole, primaryRole, ROLE_LABELS } from "@/lib/roles";
import { cn } from "@/lib/utils";

const ROLE_BADGE: Record<AppRole, string> = {
  admin: "bg-accent text-accent-foreground ring-primary/15",
  reviewer: "bg-amber-soft text-amber-900 ring-amber/30 dark:text-amber-100",
  user: "bg-secondary text-foreground/70 ring-border",
};

const ROLE_ACTIONS: { role: AppRole; label: string }[] = [
  { role: "admin", label: "Make admin" },
  { role: "reviewer", label: "Make reviewer (read-only admin)" },
  { role: "user", label: "Make customer" },
];

export function CustomersTable({
  rows,
  loading,
  hasNextPage,
  onLoadMore,
  onSetRole,
  currentUserId,
}: {
  rows: CustomersItem[];
  loading?: boolean;
  hasNextPage?: boolean;
  onLoadMore?: () => void;
  onSetRole?: (id: string, role: AppRole) => Promise<void>;
  currentUserId: string;
}) {
  const router = useRouter();
  const { readOnly } = useAdminAccess();
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const { banUser, unbanUser, isPending } = useUserBanMutations({
    currentUserId: currentUserId,
  });

  const columns = React.useMemo<ColumnDef<CustomersItem>[]>(
    () => [
      {
        accessorKey: "name",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className=""
          >
            Customer
            <ArrowUpDown className="ml-1 size-3.5 text-muted-foreground" />
          </Button>
        ),
        cell: ({ row }) => (
          <div className="font-medium">{row.original.name}</div>
        ),
      },
      {
        accessorKey: "email",
        header: "Email",
        cell: ({ row }) => (
          <div className="text-muted-foreground">
            {row.original.email ?? "—"}
          </div>
        ),
      },
      {
        accessorKey: "bookingsCount",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="px-0 text-center w-full"
          >
            Bookings
            <ArrowUpDown className="ml-1 size-3.5 text-muted-foreground" />
          </Button>
        ),
        cell: ({ row }) => (
          <div className="text-center">{row.original.bookingsCount}</div>
        ),
        meta: { align: "center" },
      },
      {
        accessorKey: "revenue",
        header: ({ column }) => (
          <div className="text-center">
            <Button
              variant="ghost"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
              className="px-0"
            >
              Revenue
              <ArrowUpDown className="ml-1 size-3.5 text-muted-foreground" />
            </Button>
          </div>
        ),
        cell: ({ row }) => {
          const value = row.original.revenue ?? 0;
          return (
            <div className="text-center font-medium">
              {value.toLocaleString(undefined, {
                style: "currency",
                currency: "USD",
              })}
            </div>
          );
        },
      },
      {
        accessorKey: "createdAt",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="px-0"
          >
            Joined
            <ArrowUpDown className="ml-1 size-3.5 text-muted-foreground" />
          </Button>
        ),
        cell: ({ row }) => (
          <div className="text-muted-foreground">
            {new Date(row.original.createdAt).toLocaleDateString()}
          </div>
        ),
      },
      {
        accessorKey: "lastBookedAt",
        header: "Last booked",
        cell: ({ row }) => (
          <div className="text-muted-foreground">
            {row.original.lastBookedAt
              ? new Date(row.original.lastBookedAt).toLocaleDateString()
              : "—"}
          </div>
        ),
      },
      {
        accessorKey: "role",
        header: "Role",
        cell: ({ row }) => {
          const role = primaryRole(row.original.role);
          return (
            <span
              className={cn(
                "inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset",
                ROLE_BADGE[role]
              )}
            >
              {ROLE_LABELS[role]}
              {row.original.demo && " · public demo"}
            </span>
          );
        },
      },
      {
        id: "actions",
        enableHiding: false,
        cell: ({ row }) => {
          const customer = row.original;
          const isSelf = currentUserId && currentUserId === customer.id;
          // Reviewers only get the read actions.
          const canManage = !readOnly && !isSelf;
          // The public demo login always stays a reviewer.
          const canSetRole = canManage && !!onSetRole && !customer.demo;
          const currentRole = primaryRole(customer.role);

          return (
            <DropdownMenu>
              {!isSelf ? (
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">Open menu</span>
                    <MoreHorizontal />
                  </Button>
                </DropdownMenuTrigger>
              ) : (
                <div className="h-8 w-8 p-0"></div>
              )}
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                {!row.original.banned &&
                  canManage &&
                  !customer.banReason?.includes("Admin-initiated") && (
                    <DropdownMenuItem
                      onClick={() =>
                        banUser({
                          userId: row.original.id,
                          banReason: "Spamming",
                          banExpiresIn: 60 * 60 * 24 * 7,
                        })
                      }
                      disabled={isPending}
                    >
                      Ban for 7 days
                    </DropdownMenuItem>
                  )}

                {row.original.banned &&
                  canManage &&
                  !customer.banReason?.includes("Admin-initiated") && (
                    <DropdownMenuItem
                      onClick={() =>
                        unbanUser({
                          userId: row.original.id,
                        })
                      }
                      disabled={isPending}
                    >
                      Unban
                    </DropdownMenuItem>
                  )}

                <DropdownMenuItem
                  onClick={() =>
                    router.push(
                      `/admin/manage-bookings?userId=${encodeURIComponent(
                        customer.id
                      )}`
                    )
                  }
                >
                  View bookings
                </DropdownMenuItem>

                {canSetRole &&
                  !customer.banReason?.includes("Admin-initiated") && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
                        Role: {ROLE_LABELS[currentRole]}
                      </DropdownMenuLabel>
                      {ROLE_ACTIONS.filter((a) => a.role !== currentRole).map(
                        (action) => (
                          <DropdownMenuItem
                            key={action.role}
                            className={cn(
                              currentRole === "admin" &&
                                "text-destructive focus:text-destructive"
                            )}
                            onClick={() => onSetRole!(customer.id, action.role)}
                          >
                            {action.label}
                          </DropdownMenuItem>
                        )
                      )}
                    </>
                  )}
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    [router, currentUserId, onSetRole, readOnly, banUser, isPending, unbanUser]
  );

  const table = useReactTable({
    data: rows,
    columns,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: { sorting, columnVisibility, rowSelection },
  });

  const visibleCols = table.getVisibleLeafColumns().length;

  if (loading) {
    return <Loader title="Loading customers" />;
  }

  return (
    <div className="w-full">
      <div className="overflow-x-auto rounded-2xl border bg-card shadow-card">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="whitespace-nowrap">
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {rows.length > 0 ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={
                        cell.column.id === "revenue" ||
                        cell.column.id === "bookingsCount"
                          ? "text-right"
                          : undefined
                      }
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={visibleCols}
                  className="h-24 text-center text-sm text-muted-foreground"
                >
                  No customers found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {hasNextPage && (
        <div className="flex justify-end py-4">
          <Button
            onClick={onLoadMore}
            disabled={loading}
            variant="outline"
            size="sm"
          >
            Load more
          </Button>
        </div>
      )}
    </div>
  );
}
