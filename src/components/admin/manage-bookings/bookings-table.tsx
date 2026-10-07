"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ColumnDef,
  flexRender,
  Table as TableType,
} from "@tanstack/react-table";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateBookingStatus } from "@/app/(admin)/admin/manage-bookings/actions";
import { ADMIN_TRANSITIONS } from "@/lib/cancellation";
import { StatusBadge } from "@/components/vehicles/badges";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatDate } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

export type Booking = {
  id: string;
  user_id: string;
  car_id: string;
  start_date: string;
  end_date: string;
  total_price: number;
  status: string;
  created_at: string;
  name: string;
  email: string;
  vehicle_brand: string;
  vehicle_model: string;
};

// -- Component for status updates
function BookingStatusCell({
  bookingId,
  currentStatus,
}: {
  bookingId: string;
  currentStatus: string;
}) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { mutate, isPending } = useMutation({
    mutationFn: (newStatus: string) =>
      updateBookingStatus(bookingId, newStatus),
    onSuccess: (data) => {
      toast({
        title: "Status Updated",
        description:
          typeof data?.refund === "number"
            ? `Booking cancelled. Refund: $${data.refund.toFixed(2)}${data.refundedAutomatically ? "" : " (process manually in Stripe)"}.`
            : "The booking status has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["get-bookings"] });
    },
    onError: (err: Error) => {
      toast({
        title: "Could not update status",
        description: err.message,
        variant: "destructive",
      });
    },
  });

  const allowed = ADMIN_TRANSITIONS[currentStatus] ?? [];
  if (allowed.length === 0) {
    return <StatusBadge status={currentStatus} />;
  }

  return (
    <Select
      value={currentStatus}
      onValueChange={(newStatus) => {
        if (
          newStatus === "Cancelled" &&
          !window.confirm(
            "Cancel this booking? The customer will be refunded in full and their points reversed."
          )
        ) {
          return;
        }
        mutate(newStatus);
      }}
      disabled={isPending}
    >
      <SelectTrigger size="sm" className="w-36 rounded-full">
        <SelectValue placeholder="Select status" />
      </SelectTrigger>
      <SelectContent>
        {[currentStatus, ...allowed].map((s) => (
          <SelectItem key={s} value={s}>
            {s === "Cancelled" && s !== currentStatus ? "Cancel & refund" : s}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

// -- Table columns
const columns: ColumnDef<Booking>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Customer <ArrowUpDown className="ml-2 size-4" />
      </Button>
    ),
  },
  {
    accessorKey: "email",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Email <ArrowUpDown className="ml-2 size-4" />
      </Button>
    ),
  },
  {
    accessorFn: (row) => `${row.vehicle_brand} ${row.vehicle_model}`,
    id: "vehicle",
    header: "Vehicle",
    cell: ({ row }) => (
      <div>
        {row.original.vehicle_brand} {row.original.vehicle_model}
      </div>
    ),
  },

  {
    accessorKey: "start_date",
    header: "Start Date",
    cell: ({ row }) => formatDate(row.getValue("start_date")),
  },
  {
    accessorKey: "end_date",
    header: "End Date",
    cell: ({ row }) => formatDate(row.getValue("end_date")),
  },
  {
    accessorKey: "total_price",
    header: "Total Price ($)",
    cell: ({ row }) => `$${Number(row.getValue("total_price")).toFixed(2)}`,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <BookingStatusCell
        bookingId={row.original.id}
        currentStatus={row.original.status}
      />
    ),
  },
];

function BookingsTable({ table }: { table: TableType<Booking> }) {
  return (
    <>
      <div className="overflow-x-auto rounded-2xl border bg-card shadow-sm">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id}>
                {hg.headers.map((header) => (
                  <TableHead key={header.id}>
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
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
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
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredRowModel().rows.length} bookings
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            iconType="left-arrow"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            iconType="right-arrow"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </>
  );
}

BookingsTable.columns = columns;

export default BookingsTable;
