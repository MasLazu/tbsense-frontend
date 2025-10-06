"use client";

import * as React from "react";
import { Skeleton } from "./ui/skeleton";
import {
  useLandAreaSummary,
  usePlantationsSummary,
  useTreesSummary,
  useHarvestSummary,
} from "../hooks/use-global-summary";
import { useTimeRange } from "@/hooks/use-time-range";
import { Sparkles } from "lucide-react";
import { ErrorChartCell } from "./error-chart-cell";

type MetricsChartProps = {
  params?: {
    startDate?: string;
    endDate?: string;
  };
  className?: string;
};

export default function GlobalSummaryChart({
  params,
  className,
}: MetricsChartProps) {
  const { params: timeParams } = useTimeRange();
  const apiParams = timeParams
    ? { startDate: timeParams.startTime, endDate: timeParams.endTime }
    : undefined;
  const {
    data: landArea,
    isLoading: landLoading,
    isError: landError,
    error: landErrorObj,
    refetch: refetchLand,
  } = useLandAreaSummary(apiParams ?? params);

  const {
    data: plantations,
    isLoading: plantLoading,
    isError: plantError,
    error: plantErrorObj,
    refetch: refetchPlantations,
  } = usePlantationsSummary(apiParams ?? params);

  const {
    data: trees,
    isLoading: treesLoading,
    isError: treesError,
    error: treesErrorObj,
    refetch: refetchTrees,
  } = useTreesSummary(apiParams ?? params);

  const {
    data: harvest,
    isLoading: harvestLoading,
    isError: harvestError,
    error: harvestErrorObj,
    refetch: refetchHarvest,
  } = useHarvestSummary(apiParams ?? params);

  const formatNumber = React.useCallback((value: number | undefined) => {
    if (value === undefined || value === null) return "—";
    return new Intl.NumberFormat().format(Math.round(value * 100) / 100);
  }, []);
  const card = (
    label: string,
    value: string | number,
    subtitle?: string,
    loading = false
  ) => (
    <div className="relative rounded-lg border p-6 shadow-sm bg-card text-card-foreground border-border flex flex-col justify-between">
      <div className="absolute top-4 right-4 text-muted-foreground">
        <Sparkles size={18} className="opacity-20" />
      </div>

      <div className="text-base text-muted-foreground">{label}</div>

      <div className="mt-3 flex items-baseline gap-3">
        <div className="text-4xl font-extrabold tabular-nums">
          {loading ? <Skeleton className="h-10 w-40" /> : value}
        </div>
        {subtitle && (
          <div className="text-sm text-muted-foreground">{subtitle}</div>
        )}
      </div>
    </div>
  );

  return (
    <div className={`${className ?? ""}`}>
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {/* Land Area card or error */}
        {landError ? (
          <ErrorChartCell
            title="Total Hectares"
            error={(landErrorObj as any)?.message}
            onRetry={refetchLand}
          />
        ) : (
          card(
            "Total Hectares",
            landLoading ? "" : formatNumber(landArea?.totalHectares),
            landLoading
              ? undefined
              : `Utilized ${formatNumber(landArea?.utilized)}`,
            landLoading
          )
        )}

        {/* Plantations card or error */}
        {plantError ? (
          <ErrorChartCell
            title="Active Plantations"
            error={(plantErrorObj as any)?.message}
            onRetry={refetchPlantations}
          />
        ) : (
          card(
            "Active Plantations",
            plantLoading ? "" : formatNumber(plantations?.active),
            plantLoading ? undefined : `of ${formatNumber(plantations?.total)}`,
            plantLoading
          )
        )}

        {/* Trees card or error */}
        {treesError ? (
          <ErrorChartCell
            title="Total Trees"
            error={(treesErrorObj as any)?.message}
            onRetry={refetchTrees}
          />
        ) : (
          card(
            "Total Trees",
            treesLoading ? "" : formatNumber(trees?.total),
            treesLoading
              ? undefined
              : `Avg ${formatNumber(trees?.averagePerHectare)} / hectare`,
            treesLoading
          )
        )}

        {/* Harvest card or error */}
        {harvestError ? (
          <ErrorChartCell
            title="Total Yield (Kg)"
            error={(harvestErrorObj as any)?.message}
            onRetry={refetchHarvest}
          />
        ) : (
          card(
            "Total Yield (Kg)",
            harvestLoading ? "" : formatNumber(harvest?.totalYieldKg),
            harvestLoading
              ? undefined
              : `Avg ${formatNumber(harvest?.averageYieldPerHectare)} / ha`,
            harvestLoading
          )
        )}
      </div>
    </div>
  );
}
