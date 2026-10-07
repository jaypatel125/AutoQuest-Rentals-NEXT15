"use client";

import * as React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
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
import Link from "next/link";
import { CarWithBranch } from "@/app/(admin)/admin/manage-vehicles/actions";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { VehicleImage } from "@/components/vehicles/VehicleImage";
import { bodyTypeLabel } from "@/lib/vehicles";
import { formatPrice } from "@/lib/utils";

interface VehicleOverviewTableProps {
  vehicles: CarWithBranch[];
  branchId: string;
}

export default function VehicleOverviewTable({
  vehicles,
  branchId,
}: VehicleOverviewTableProps) {
  const columns: ColumnDef<CarWithBranch>[] = [
    {
      id: "photo",
      header: "",
      enableHiding: false,
      cell: ({ row }) => (
        <div className="w-20 overflow-hidden rounded-lg border">
          <VehicleImage
            src={row.original.image}
            brand={row.original.brand}
            model={row.original.model}
            bodyType={row.original.body_type}
            sizes="80px"
          />
        </div>
      ),
    },
    {
      accessorFn: (row) => `${row.brand} ${row.model}`,
      id: "vehicle",
      header: ({ column }) => (
        <Button
          variant="ghost"
          className="hover:bg-transparent"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Vehicle{" "}
          <ArrowUpDown className="ml-1 size-3.5 text-muted-foreground" />
        </Button>
      ),
      cell: ({ row }) => (
        <div>
          <p className="font-semibold">{`${row.original.brand} ${row.original.model}`}</p>
          <p className="text-xs text-muted-foreground">
            {bodyTypeLabel(row.original.body_type)} · {row.original.fuel_type}
          </p>
        </div>
      ),
    },
    {
      accessorKey: "branch_name",
      header: "Branch",
      cell: ({ row }) => <div>{row.getValue("branch_name")}</div>,
    },
    {
      accessorKey: "branch_city",
      header: "City",
      cell: ({ row }) => <div>{row.getValue("branch_city")}</div>,
    },
    {
      accessorKey: "price_per_day",
      header: "Price/Day",
      cell: ({ row }) => (
        <div className="font-medium">
          {formatPrice(Number(row.getValue("price_per_day")))}
        </div>
      ),
    },
    {
      accessorKey: "available",
      header: "Status",
      cell: ({ row }) => {
        const available = row.getValue("available") as boolean;
        return (
          <span
            className={
              available
                ? "inline-flex items-center gap-1.5 text-sm [&>span]:text-eco"
                : "inline-flex items-center gap-1.5 text-sm text-muted-foreground"
            }
          >
            <span className="size-1.5 rounded-full bg-current" />
            {available ? "Available" : "Unavailable"}
          </span>
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const vehicleId = row.original.id;
        return (
          <Link href={`/admin/manage-vehicles/${vehicleId}`}>
            <Button variant="outline" size="sm">
              Edit
            </Button>
          </Link>
        );
      },
    },
  ];
  const params = useSearchParams();
  const pathName = usePathname();
  const router = useRouter();
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [globalFilter, setGlobalFilter] = React.useState("");

  const handleClearFilter = () => {
    const newParams = new URLSearchParams(params.toString());
    newParams.delete("branchId");
    router.push(`${pathName}?${newParams.toString()}`);
  };

  const table = useReactTable({
    data: vehicles || [],
    columns,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between py-4">
        <div className="flex gap-4">
          <Input
            placeholder="Search by brand, model, branch, or city..."
            value={globalFilter ?? ""}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="md:min-w-md"
          />
          {branchId && (
            <Button variant="outline" onClick={handleClearFilter}>
              Clear Filter
            </Button>
          )}
        </div>
        <div className="flex gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="ml-auto">
                Columns
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                    className="capitalize"
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            onClick={() => {
              router.push("/admin/add-vehicle");
            }}
          >
            Add Vehicle
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto border-y">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
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
                  No vehicles found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredRowModel().rows.length} vehicles
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
