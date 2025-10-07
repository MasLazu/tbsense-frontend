import React from "react";
import { PaginationTable, type Column } from "./pagination-table";
import type { PaginationController } from "@/types/pagination";
import { usePlantationsPaginated } from "@/hooks/use-plantations";
import type { PlantationDto } from "@/services/plantations-service";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

/**
 * Example: Custom hook to create a pagination controller from React Query
 */
function usePlantationsPaginationController(): PaginationController<PlantationDto> {
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);
  const [sortKey, setSortKey] = React.useState<keyof PlantationDto | null>(
    null
  );
  const [sortDirection, setSortDirection] = React.useState<
    "asc" | "desc" | null
  >(null);
  const [search, setSearch] = React.useState<string>("");

  // Build pagination request
  const paginationRequest = React.useMemo(() => {
    const filters = [];

    // Add search filter if search term exists
    if (search) {
      filters.push({
        field: "name",
        operator: "contains",
        value: search,
      });
    }

    const orderBy =
      sortKey && sortDirection
        ? [{ field: String(sortKey), desc: sortDirection === "desc" }]
        : [];

    return {
      page,
      pageSize,
      filters,
      orderBy,
    };
  }, [page, pageSize, search, sortKey, sortDirection]);

  // Fetch data using React Query
  const { data, isLoading } = usePlantationsPaginated(paginationRequest);

  const setSort = React.useCallback(
    (key: keyof PlantationDto | null, direction: "asc" | "desc" | null) => {
      setSortKey(key);
      setSortDirection(direction);
      setPage(1); // Reset to first page on sort
    },
    []
  );

  return {
    data: data?.items ?? [],
    totalItems: data?.totalCount ?? 0,
    loading: isLoading,
    page,
    pageSize,
    setPage,
    setPageSize: (size: number) => {
      setPageSize(size);
      setPage(1); // Reset to first page on page size change
    },
    sortKey,
    sortDirection,
    setSort,
    search,
    setSearch: (value: string) => {
      setSearch(value);
      setPage(1); // Reset to first page on search
    },
  };
}

/**
 * Example: Plantations Table Component
 */
export function PlantationsTableExample() {
  const controller = usePlantationsPaginationController();

  // Define columns
  const columns: Column<PlantationDto>[] = [
    {
      key: "name",
      label: "Name",
      sortable: true,
    },
    {
      key: "description",
      label: "Description",
      render: (value) => value || "-",
    },
    {
      key: "landAreaHectares",
      label: "Land Area (ha)",
      sortable: true,
      render: (value) => Number(value).toFixed(2),
    },
    {
      key: "plantedDate",
      label: "Planted Date",
      sortable: true,
      render: (value) => new Date(value as string).toLocaleDateString(),
    },
    {
      key: "createdAt",
      label: "Created At",
      sortable: true,
      render: (value) => new Date(value as string).toLocaleDateString(),
    },
  ];

  return (
    <div className="container mx-auto py-10">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Plantations</h1>
        <p className="text-muted-foreground">Manage and view all plantations</p>
      </div>

      <PaginationTable
        columns={columns}
        controller={controller}
        searchable={true}
        searchPlaceholder="Search plantations..."
        pageSizeOptions={[10, 20, 30, 50]}
        actions={
          <Button size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Add Plantation
          </Button>
        }
        expandable={{
          render: (row) => (
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="font-semibold">ID:</span> {row.id}
                </div>
                <div>
                  <span className="font-semibold">Description:</span>{" "}
                  {row.description || "No description"}
                </div>
                <div>
                  <span className="font-semibold">Updated At:</span>{" "}
                  {row.updatedAt
                    ? new Date(row.updatedAt).toLocaleString()
                    : "Never"}
                </div>
              </div>
            </div>
          ),
          getRowId: (row) => row.id,
        }}
      />
    </div>
  );
}

/**
 * Example: Simple Table Without Expandable Rows
 */
export function SimplePlantationsTable() {
  const controller = usePlantationsPaginationController();

  const columns: Column<PlantationDto>[] = [
    {
      key: "name",
      label: "Plantation Name",
      sortable: true,
    },
    {
      key: "landAreaHectares",
      label: "Area",
      sortable: true,
      render: (value) => `${Number(value).toFixed(2)} ha`,
    },
    {
      key: "plantedDate",
      label: "Date",
      sortable: true,
      render: (value) => new Date(value as string).toLocaleDateString(),
    },
  ];

  return (
    <PaginationTable
      columns={columns}
      controller={controller}
      searchable={true}
      searchPlaceholder="Search..."
    />
  );
}
