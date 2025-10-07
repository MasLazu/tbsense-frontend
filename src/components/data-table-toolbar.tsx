import type { Table } from "@tanstack/react-table";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTableFacetedFilter } from "@/components/data-table-faceted-filter";

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
  children?: React.ReactNode;
  actions?: React.ReactNode;
}

export function DataTableToolbar<TData>({
  table,
  children,
  actions,
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0;

  return (
    <div className="flex items-center justify-between gap-2">
      <div className="flex flex-1 items-center space-x-2">
        {children}
        {table.getAllColumns().map((column) => {
          const meta = column.columnDef.meta as any;
          if (!meta?.options) return null;

          return (
            <DataTableFacetedFilter
              key={column.id}
              column={column}
              title={meta.label || column.id}
              options={meta.options}
              variant={meta.variant}
            />
          );
        })}
        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => table.resetColumnFilters()}
            className="h-8 px-2 lg:px-3"
          >
            Reset
            <X className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
      {actions && <div className="flex items-center space-x-2">{actions}</div>}
    </div>
  );
}
