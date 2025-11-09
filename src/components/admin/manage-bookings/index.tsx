"use client";

import React, { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getAllBookings } from "@/app/(admin)/admin/manage-bookings/actions";
import Loader from "@/components/utility/Loader";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import BookingsTable from "@/components/admin/manage-bookings/bookings-table";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import Error from "@/components/utility/Error";

export default function BookingsOverview() {
  const params = useSearchParams();
  const pathName = usePathname();
  const userId = params.get("userId") || "";
  const router = useRouter();
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  const { data, isLoading, isError } = useQuery({
    queryKey: ["get-bookings"],
    queryFn: getAllBookings,
    retry: true,
    retryDelay: 500,
  });

  const filteredData = useMemo(() => {
    if (!data) return [];
    return data.filter((booking) => booking.user_id === userId);
  }, [data, userId]);

  const handleClearFilter = () => {
    const newParams = new URLSearchParams(params.toString());
    newParams.delete("userId");
    router.push(`${pathName}?${newParams.toString()}`);
  };

  const table = useReactTable({
    data: (userId ? filteredData : data) || [],
    columns: BookingsTable.columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: { sorting, columnFilters, columnVisibility, rowSelection },
  });

  if (isLoading) {
    return <Loader title="Loading bookings" />;
  }

  if (isError)
    return <Error error="Failed to load bookings. Please try again." />;

  return (
    <>
      <div className="flex items-center py-4">
        <div className="flex gap-4">
          {" "}
          <Input
            placeholder="Filter by email..."
            value={(table.getColumn("email")?.getFilterValue() as string) ?? ""}
            onChange={(e) =>
              table.getColumn("email")?.setFilterValue(e.target.value)
            }
            className="max-w-sm"
          />
          {userId && (
            <Button
              iconType="close"
              variant="outline"
              onClick={handleClearFilter}
            >
              Clear Filter
            </Button>
          )}
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Columns <ChevronDown />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Toggle Columns</DropdownMenuLabel>
            {table
              .getAllColumns()
              .filter((col) => col.getCanHide())
              .map((col) => (
                <DropdownMenuCheckboxItem
                  key={col.id}
                  className="capitalize"
                  checked={col.getIsVisible()}
                  onCheckedChange={(v) => col.toggleVisibility(!!v)}
                >
                  {col.id}
                </DropdownMenuCheckboxItem>
              ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <BookingsTable table={table} />
    </>
  );
}
