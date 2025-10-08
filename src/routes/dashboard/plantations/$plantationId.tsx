import * as React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Loader2,
  MapPin,
  Calendar,
  Trees,
  Package,
  Eye,
} from "lucide-react";
import {
  usePlantationBasicSummary,
  usePlantationHarvestSummary,
  usePlantationTreesSummary,
} from "@/hooks/use-plantation-dashboard";
import { TimeRangeProvider } from "@/components/time-range-provider";
import { useTimeRange } from "@/hooks/use-time-range";
import { PlantationAirTemperatureChart } from "@/components/plantation-air-temperature-chart";
import { PlantationSoilTemperatureChart } from "@/components/plantation-soil-temperature-chart";
import { PlantationSoilMoistureChart } from "@/components/plantation-soil-moisture-chart";
import { PlantationHarvestYieldChart } from "@/components/plantation-harvest-yield-chart";
import { PlantationHarvestCountChart } from "@/components/plantation-harvest-count-chart";
import { PaginationTable } from "@/components/pagination-table";
import type { PaginationController } from "@/types/pagination";
import { useTrees } from "@/hooks/use-trees";
import type { TreeDto } from "@/services/trees-service";

export const Route = createFileRoute("/dashboard/plantations/$plantationId")({
  component: RouteComponent,
});

/**
 * Custom hook to create a pagination controller for trees
 */
function useTreesPaginationController(
  plantationId: string
): PaginationController<TreeDto> {
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);
  const [sortKey, setSortKey] = React.useState<keyof TreeDto | null>(null);
  const [sortDirection, setSortDirection] = React.useState<
    "asc" | "desc" | null
  >(null);
  const [search, setSearch] = React.useState<string>("");

  // Build pagination request
  const paginationRequest = React.useMemo(() => {
    const filters = [];

    // Filter by plantationId
    filters.push({
      field: "plantationId",
      operator: "=",
      value: plantationId,
    });

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
  }, [page, pageSize, plantationId, sortKey, sortDirection]);

  // Fetch data using React Query
  const { data, isLoading } = useTrees(paginationRequest);

  const setSort = React.useCallback(
    (key: keyof TreeDto | null, direction: "asc" | "desc" | null) => {
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

function RouteComponent() {
  const { plantationId } = Route.useParams();
  const { params } = useTimeRange();

  // Fetch summaries
  const { data: basicSummary, isLoading: isLoadingBasic } =
    usePlantationBasicSummary(plantationId);
  const { data: harvestSummary, isLoading: isLoadingHarvest } =
    usePlantationHarvestSummary(plantationId, {
      startDate: params.startTime,
      endDate: params.endTime,
    });
  const { data: treesSummary, isLoading: isLoadingTrees } =
    usePlantationTreesSummary(plantationId);

  // Trees pagination controller
  const treesController = useTreesPaginationController(plantationId);

  const isLoading = isLoadingBasic || isLoadingHarvest || isLoadingTrees;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/dashboard/plantations">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold tracking-tight">
              {basicSummary?.plantationName || "Plantation Dashboard"}
            </h1>
            <p className="text-muted-foreground">
              Detailed analytics and insights for this plantation
            </p>
          </div>
        </div>
        <TimeRangeProvider
          invalidateKeys={[["plantation-dashboard", plantationId]]}
        />
      </div>

      {/* Basic Info Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Land Area</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {basicSummary?.landAreaHectares?.toFixed(2) || "0.00"}
            </div>
            <p className="text-xs text-muted-foreground">hectares</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Planted Date</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {basicSummary?.plantedDate
                ? new Date(basicSummary.plantedDate).toLocaleDateString(
                    "en-US",
                    { year: "numeric", month: "short", day: "numeric" }
                  )
                : "-"}
            </div>
            <p className="text-xs text-muted-foreground">establishment</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Trees</CardTitle>
            <Trees className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {basicSummary?.treeCount?.toLocaleString() || "0"}
            </div>
            <p className="text-xs text-muted-foreground">
              {basicSummary?.activeTreeCount || 0} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Yield</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {harvestSummary?.totalYieldKg
                ? (harvestSummary.totalYieldKg / 1000).toFixed(2)
                : "0.00"}
            </div>
            <p className="text-xs text-muted-foreground">
              tons ({harvestSummary?.harvestCount || 0} harvests)
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Harvest Summary Section */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Harvest Performance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="text-sm text-muted-foreground">
                Average per Harvest
              </div>
              <div className="text-2xl font-bold">
                {harvestSummary?.averageYieldPerHarvest?.toFixed(2) || "0.00"}{" "}
                kg
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">
                Total Harvests
              </div>
              <div className="text-2xl font-bold">
                {harvestSummary?.harvestCount || 0}
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Last Harvest</div>
              <div className="text-sm font-medium">
                {harvestSummary?.lastHarvestDate
                  ? new Date(harvestSummary.lastHarvestDate).toLocaleDateString(
                      "en-US",
                      { year: "numeric", month: "short", day: "numeric" }
                    )
                  : "No harvests yet"}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tree Statistics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="text-sm text-muted-foreground">Total Trees</div>
              <div className="text-2xl font-bold">
                {treesSummary?.totalTrees || 0}
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Active Trees</div>
              <div className="text-2xl font-bold">
                {treesSummary?.activeTrees || 0}
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Average Age</div>
              <div className="text-sm font-medium">
                {treesSummary?.averageAge?.toFixed(1) || "0.0"} years
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="text-sm text-muted-foreground">
                Recently Planted
              </div>
              <div className="text-2xl font-bold">
                {treesSummary?.recentlyPlantedCount || 0}
              </div>
              <div className="text-xs text-muted-foreground">
                trees in last 30 days
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Activity Rate</div>
              <div className="text-sm font-medium">
                {treesSummary && treesSummary.totalTrees > 0
                  ? (
                      (treesSummary.activeTrees / treesSummary.totalTrees) *
                      100
                    ).toFixed(1)
                  : "0.0"}
                %
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Environmental Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <PlantationAirTemperatureChart
          plantationId={plantationId}
          interval="hourly"
        />
        <PlantationSoilTemperatureChart
          plantationId={plantationId}
          interval="hourly"
        />
      </div>

      <PlantationSoilMoistureChart
        plantationId={plantationId}
        interval="hourly"
      />

      {/* Harvest Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <PlantationHarvestYieldChart
          plantationId={plantationId}
          interval="hourly"
        />
        <PlantationHarvestCountChart
          plantationId={plantationId}
          interval="hourly"
        />
      </div>

      {/* Trees Table */}
      <div className="flex flex-col gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Trees</h2>
          <p className="text-muted-foreground">
            Manage and view all trees in this plantation
          </p>
        </div>

        <PaginationTable
          columns={[
            {
              key: "id",
              label: "Tree ID",
              render: (value) => (
                <div className="font-mono text-sm">{value as string}</div>
              ),
            },
            {
              key: "longitude",
              label: "Longitude",
              sortable: true,
              render: (value) => (
                <div className="font-mono text-sm">
                  {(value as number).toFixed(6)}
                </div>
              ),
            },
            {
              key: "latitude",
              label: "Latitude",
              sortable: true,
              render: (value) => (
                <div className="font-mono text-sm">
                  {(value as number).toFixed(6)}
                </div>
              ),
            },
            {
              key: "createdAt",
              label: "Created",
              sortable: true,
              render: (value) => (
                <div className="text-sm text-muted-foreground">
                  {new Date(value as string).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </div>
              ),
            },
            {
              key: "id",
              label: "Actions",
              render: (_, row) => (
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    asChild
                  >
                    <Link
                      to="/dashboard/plantations/$plantationId/trees/$treeId"
                      params={{
                        plantationId: row.plantationId,
                        treeId: row.id,
                      }}
                    >
                      <Eye className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              ),
            },
          ]}
          controller={treesController}
          searchable={false}
          pageSizeOptions={[10, 20, 30, 50]}
        />
      </div>
    </div>
  );
}
