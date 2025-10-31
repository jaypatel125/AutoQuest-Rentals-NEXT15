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
import { Checkbox } from "@/components/ui/checkbox";
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
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { adminCustomersKeys, adminSafeDeleteUser } from "../actions";

export function CustomersTable({
  rows,
  loading,
  hasNextPage,
  onLoadMore,
  onToggleAdmin,
  currentUserId,
}: {
  rows: CustomersItem[];
  loading?: boolean;
  hasNextPage?: boolean;
  onLoadMore?: () => void;
  onToggleAdmin: (id: string, makeAdmin: boolean) => Promise<void>;
  currentUserId: string;
}) {
  const router = useRouter();
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const { banUser, unbanUser, isPending } = useUserBanMutations({
    currentUserId: currentUserId,
  });
  const qc = useQueryClient();
  const deleteMutation = useMutation({
    mutationFn: ({ userId }: { userId: string }) =>
      adminSafeDeleteUser({ userId }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: adminCustomersKeys.all });
    },
  });

  const columns = React.useMemo<ColumnDef<CustomersItem>[]>(
    () => [
      {
        id: "select",
        header: ({ table }) => (
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && "indeterminate")
            }
            onCheckedChange={(value) =>
              table.toggleAllPageRowsSelected(!!value)
            }
            aria-label="Select all"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
          />
        ),
        enableSorting: false,
        enableHiding: false,
        size: 28,
      },
      {
        accessorKey: "name",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="px-0"
          >
            Customer
            <ArrowUpDown className="ml-2 size-4" />
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
            <ArrowUpDown className="ml-2 size-4" />
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
              <ArrowUpDown className="ml-2 size-4" />
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
            <ArrowUpDown className="ml-2 size-4" />
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
        cell: ({ row }) => (
          <div className=" font-medium">{row.original.role}</div>
        ),
      },
      {
        id: "actions",
        enableHiding: false,
        cell: ({ row }) => {
          const customer = row.original;
          const isSelf = currentUserId && currentUserId === customer.id;
          const canToggleRole = !!onToggleAdmin && !isSelf;

          return (
            <DropdownMenu>
              {!isSelf && (
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">Open menu</span>
                    <MoreHorizontal />
                  </Button>
                </DropdownMenuTrigger>
              )}
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                {!row.original.banned &&
                  !isSelf &&
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
                      )}&userName=${encodeURIComponent(customer.name)}`
                    )
                  }
                >
                  View bookings
                </DropdownMenuItem>

                {canToggleRole &&
                  !customer.banReason?.includes("Admin-initiated") && (
                    <>
                      <DropdownMenuSeparator />
                      {customer.role === "admin" ? (
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => onToggleAdmin!(customer.id, false)}
                        >
                          Remove admin
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem
                          onClick={() => onToggleAdmin!(customer.id, true)}
                        >
                          Make admin
                        </DropdownMenuItem>
                      )}
                    </>
                  )}
                {!isSelf &&
                  !customer.banReason?.includes("Admin-initiated") && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        disabled={deleteMutation.isPending}
                        onClick={() =>
                          deleteMutation.mutate({
                            userId: customer.id,
                          })
                        }
                        className="text-red-600"
                      >
                        Delete user
                      </DropdownMenuItem>
                    </>
                  )}
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    [
      router,
      currentUserId,
      onToggleAdmin,
      banUser,
      isPending,
      unbanUser,
      deleteMutation,
    ]
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

  return (
    <div className="w-full">
      <div className="overflow-hidden rounded-md border">
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
