"use client";

import { useState, type ReactNode } from "react";
import {
  type ColumnDef,
  type SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ChevronLeft, ChevronRight, Search, ArrowUpDown } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  searchPlaceholder?: string;
  toolbar?: ReactNode;
  pageSize?: number;
  emptyMessage?: string;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  searchPlaceholder = "Search…",
  toolbar,
  pageSize = 8,
  emptyMessage = "No results.",
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");

  const table = useReactTable({
    data,
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize } },
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-xs flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder={searchPlaceholder}
            className="h-10 w-full rounded-xl border border-border bg-muted/30 pl-9 pr-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary/40 focus:bg-background"
          />
        </div>
        {toolbar}
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((hg) => (
                <TableRow key={hg.id} className="border-border hover:bg-transparent">
                  {hg.headers.map((header) => {
                    const canSort = header.column.getCanSort();
                    return (
                      <TableHead key={header.id} className="whitespace-nowrap text-xs uppercase tracking-wide text-muted-foreground">
                        {header.isPlaceholder ? null : canSort ? (
                          <button
                            onClick={header.column.getToggleSortingHandler()}
                            className="inline-flex items-center gap-1 hover:text-foreground"
                          >
                            {flexRender(header.column.columnDef.header, header.getContext())}
                            <ArrowUpDown className="h-3 w-3 opacity-50" />
                          </button>
                        ) : (
                          flexRender(header.column.columnDef.header, header.getContext())
                        )}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id} className="border-border transition-colors hover:bg-muted/40">
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="py-3">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-28 text-center text-sm text-muted-foreground">
                    {emptyMessage}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {table.getPageCount() > 1 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()} ·{" "}
            {table.getFilteredRowModel().rows.length} records
          </span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="h-8 gap-1" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
              <ChevronLeft className="h-4 w-4" /> Prev
            </Button>
            <Button variant="outline" size="sm" className="h-8 gap-1" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
              Next <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export function SortHeader({ children }: { children: ReactNode }) {
  return <span className={cn("font-medium")}>{children}</span>;
}
