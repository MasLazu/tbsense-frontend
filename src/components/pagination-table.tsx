import React from "react";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
  type ColumnFiltersState,
  type PaginationState,
} from "@tanstack/react-table";
import { Search, ChevronDown, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import type { PaginationController } from "@/types/pagination";
import { DataTableToolbar } from "./data-table-toolbar";
import { DataTableColumnHeader } from "./data-table-column-header";
import { DataTablePagination } from "./data-table-pagination";
import { useDebouncedCallback } from "@/hooks/use-debounced-callback";

export interface Column<T> {
  key: keyof T;
  label: string;
  sortable?: boolean;
  render?: (value: T[keyof T], row: T) => React.ReactNode;
  filter?: {
    label?: string;
    type?: "single" | "multi";
    options: Array<{ label: string; value: string }>;
    toValue?: (value: string) => unknown;
  };
}

export interface PaginationTableProps<T> {
  columns: Column<T>[];
  searchable?: boolean;
  searchPlaceholder?: string;
  controller: PaginationController<T>;
  pageSizeOptions?: number[];
  actions?: React.ReactNode;
  expandable?: {
    render: (row: T) => React.ReactNode;
    getRowId?: (row: T) => string;
  };
}

export function PaginationTable<T extends Record<string, any>>({
  columns,
  searchable = true,
  searchPlaceholder = "Search...",
  controller,
  pageSizeOptions,
  actions,
  expandable,
}: PaginationTableProps<T>) {
  const [localSearchValue, setLocalSearchValue] = React.useState(
    controller.search ?? ""
  );
  const [expandedRows, setExpandedRows] = React.useState<Set<string>>(
    new Set()
  );

  const toggleRowExpansion = React.useCallback(
    (row: T) => {
      if (!expandable) return;

      const rowId = expandable.getRowId
        ? expandable.getRowId(row)
        : String((row as any).id || "");
      setExpandedRows((prev) => {
        const newExpanded = new Set(prev);
        if (newExpanded.has(rowId)) {
          newExpanded.delete(rowId);
        } else {
          newExpanded.add(rowId);
        }
        return newExpanded;
      });
    },
    [expandable]
  );

  const isRowExpanded = React.useCallback(
    (row: T) => {
      if (!expandable) return false;
      const rowId = expandable.getRowId
        ? expandable.getRowId(row)
        : String((row as any).id || "");
      return expandedRows.has(rowId);
    },
    [expandable, expandedRows]
  );

  const isUserInputRef = React.useRef(false);
  const searchInputRef = React.useRef<HTMLInputElement>(null);
  const wasFocusedRef = React.useRef(false);

  const debouncedSearch = useDebouncedCallback((value: string) => {
    isUserInputRef.current = false;
    controller.setSearch?.(value);
  }, 500);

  React.useEffect(() => {
    if (!isUserInputRef.current && controller.search !== localSearchValue) {
      setLocalSearchValue(controller.search ?? "");
    }
  }, [controller.search, localSearchValue]);

  React.useEffect(() => {
    if (wasFocusedRef.current && searchInputRef.current) {
      searchInputRef.current.focus();
      const length = searchInputRef.current.value.length;
      searchInputRef.current.setSelectionRange(length, length);
    }
  });

  const handleSearchChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      isUserInputRef.current = true;
      setLocalSearchValue(value);
      debouncedSearch(value);
    },
    [debouncedSearch]
  );

  const handleSearchFocus = React.useCallback(() => {
    wasFocusedRef.current = true;
  }, []);

  const handleSearchBlur = React.useCallback(() => {
    wasFocusedRef.current = false;
  }, []);

  const tanColumns: ColumnDef<T, any>[] = [
    // Add expand column if expandable
    ...(expandable
      ? [
          {
            id: "expand",
            header: "",
            size: 40,
            enableSorting: false,
            enableColumnFilter: false,
            cell: ({ row }: any) => {
              const isExpanded = isRowExpanded(row.original);
              return (
                <div className="flex items-center justify-center">
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </div>
              );
            },
          },
        ]
      : []),
    // Regular columns
    ...columns.map((c) => ({
      accessorKey: String(c.key),
      id: String(c.key),
      header: ({ column }: any) => (
        <DataTableColumnHeader column={column as any} title={c.label} />
      ),
      enableSorting: Boolean(c.sortable),
      enableColumnFilter: Boolean(c.filter),
      meta: {
        label: c.label,
        placeholder: c.label,
        options: c.filter?.options,
        variant: c.filter
          ? c.filter.type === "multi"
            ? ("multiSelect" as const)
            : ("select" as const)
          : undefined,
      },
      cell: ({ getValue, row }: any) =>
        c.render
          ? c.render(getValue(), row.original)
          : String(getValue() ?? ""),
    })),
  ] as ColumnDef<T, any>[];

  const sorting: SortingState =
    controller.sortKey && controller.sortDirection
      ? [
          {
            id: String(controller.sortKey),
            desc: controller.sortDirection === "desc",
          },
        ]
      : [];

  const onSortingChange = (
    updater: SortingState | ((old: SortingState) => SortingState)
  ) => {
    if (!controller.setSort) return;
    const next = typeof updater === "function" ? updater(sorting) : updater;
    const first = next[0];
    if (!first) return controller.setSort(null as any, null);
    controller.setSort(first.id as keyof T, first.desc ? "desc" : "asc");
  };

  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );

  const table = useReactTable({
    data: controller.data,
    columns: tanColumns,
    state: {
      sorting,
      pagination: {
        pageIndex: controller.page - 1,
        pageSize: controller.pageSize,
      },
      columnFilters,
    },
    pageCount: Math.max(
      1,
      Math.ceil(controller.totalItems / controller.pageSize)
    ),
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
    onSortingChange,
    onPaginationChange: (updater) => {
      const prev: PaginationState = {
        pageIndex: controller.page - 1,
        pageSize: controller.pageSize,
      };
      const next = typeof updater === "function" ? updater(prev) : updater;
      if (next.pageSize !== prev.pageSize) {
        controller.setPageSize(next.pageSize);
      }
      if (next.pageIndex !== prev.pageIndex) {
        controller.setPage(next.pageIndex + 1);
      }
    },
    onColumnFiltersChange: (updater) => {
      setColumnFilters((prev) => {
        const next = typeof updater === "function" ? updater(prev) : updater;
        if (controller.setFilters) {
          const byId = new Map<string, (typeof columns)[number]>();
          columns.forEach((col) => byId.set(String(col.key), col));
          const mapped = next
            .filter(
              (f) => f.value !== undefined && f.value !== null && f.value !== ""
            )
            .map((f) => {
              const col = byId.get(f.id as string);
              const toValue = col?.filter?.toValue;
              const vals = Array.isArray(f.value)
                ? f.value
                : [f.value as string];
              const out = toValue ? vals.map((v) => toValue(String(v))) : vals;
              return {
                key: (col?.key ?? (f.id as any)) as keyof T,
                value: out.length === 1 ? out[0] : out,
                operator: Array.isArray(out)
                  ? ("in" as const)
                  : ("eq" as const),
              };
            });
          controller.setFilters(mapped as any);
          controller.setPage(1);
        }
        return next;
      });
    },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  return (
    <div className="w-full">
      <div className="mb-4">
        <DataTableToolbar table={table} actions={actions}>
          {searchable && (
            <div className="relative w-full sm:max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                ref={searchInputRef}
                placeholder={searchPlaceholder}
                value={localSearchValue}
                onChange={handleSearchChange}
                onFocus={handleSearchFocus}
                onBlur={handleSearchBlur}
                className="pl-10 h-9"
              />
            </div>
          )}
        </DataTableToolbar>
      </div>

      {controller.loading ? (
        <div className="flex w-full flex-col gap-4 overflow-auto">
          <div className="overflow-hidden rounded-md border">
            <Table>
              <TableHeader className="bg-muted">
                <TableRow>
                  {columns.map((_, index) => (
                    <TableHead key={index}>
                      <Skeleton className="h-6 w-full max-w-[120px]" />
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.from({ length: controller.pageSize || 10 }).map(
                  (_, index) => (
                    <TableRow key={index}>
                      {columns.map((_, colIndex) => (
                        <TableCell key={colIndex}>
                          <Skeleton className="h-6 w-full" />
                        </TableCell>
                      ))}
                    </TableRow>
                  )
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination skeleton */}
          <div className="flex items-center justify-between px-2 pt-4">
            <div className="flex items-center space-x-4">
              <Skeleton className="h-8 w-32" />
            </div>
            <div className="flex items-center space-x-4">
              <Skeleton className="h-6 w-24" />
              <div className="flex items-center space-x-3">
                <Skeleton className="h-6 w-8" />
                <Skeleton className="h-6 w-8" />
                <Skeleton className="h-6 w-8" />
                <Skeleton className="h-6 w-8" />
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="rounded-md border">
            <Table>
              <TableHeader className="bg-muted">
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => {
                      return (
                        <TableHead key={header.id} colSpan={header.colSpan}>
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                        </TableHead>
                      );
                    })}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => {
                    const isExpanded = isRowExpanded(row.original);
                    return (
                      <React.Fragment key={row.id}>
                        <TableRow
                          data-state={row.getIsSelected() && "selected"}
                          className={
                            expandable ? "cursor-pointer hover:bg-muted/50" : ""
                          }
                          onClick={
                            expandable
                              ? () => toggleRowExpansion(row.original)
                              : undefined
                          }
                        >
                          {row.getVisibleCells().map((cell) => (
                            <TableCell key={cell.id}>
                              {flexRender(
                                cell.column.columnDef.cell,
                                cell.getContext()
                              )}
                            </TableCell>
                          ))}
                        </TableRow>
                        {expandable && isExpanded && (
                          <TableRow>
                            <TableCell
                              colSpan={columns.length + (expandable ? 1 : 0)}
                              className="p-0 border-b-0"
                            >
                              <div className="px-6 py-4 bg-muted/10 border-l-2 border-primary/20">
                                {expandable.render(row.original)}
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </React.Fragment>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length + (expandable ? 1 : 0)}
                      className="h-24 text-center"
                    >
                      No results.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <div className="mt-4">
            <DataTablePagination
              table={table}
              totalItems={controller.totalItems}
              pageSizeOptions={pageSizeOptions}
            />
          </div>
        </div>
      )}
    </div>
  );
}
