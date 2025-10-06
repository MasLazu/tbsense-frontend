"use client";

import * as React from "react";
import {
  TimelineChart,
  type IntervalOption,
  type TimelineDataPoint,
} from "@/components/time-series-chart";
import { useHarvestTimeseries } from "@/hooks/use-timeseries";
import { useTimeRange } from "@/hooks/use-time-range";
import { ErrorChartCell } from "@/components/error-chart-cell";
import type { HarvestTimeseriesResponse } from "@/services/global-timeseries-service";

type HarvestMetricKey =
  | "totalYieldKg"
  | "harvestCount"
  | "averageYieldPerHarvest";

type HarvestTimeseriesChartBaseProps = {
  /** Optional className applied to the underlying `TimelineChart` card */
  className?: string;
  /** Provide a controlled interval value so multiple charts stay in sync */
  interval?: string;
  /** Called when the interval selector changes */
  onIntervalChange?: (interval: string) => void;
  /** Custom list of interval options for the selector */
  intervalOptions?: IntervalOption[];
  /** Whether to render the interval selector (defaults to `true`) */
  showIntervalSelector?: boolean;
};

type HarvestTimeseriesChartDefinition = {
  metric: HarvestMetricKey;
  title: string;
  dataLabel: string;
  emptyMessage: string;
  gradientId: string;
  strokeColor: string;
};

const DEFAULT_INTERVAL = "24:00:00";

const HARVEST_CHARTS: HarvestTimeseriesChartDefinition[] = [
  {
    metric: "totalYieldKg",
    title: "Total Yield",
    dataLabel: "Total Yield (kg)",
    emptyMessage: "No harvest yield recorded for this range",
    gradientId: "harvest-total-yield",
    strokeColor: "var(--chart-1)",
  },
  {
    metric: "harvestCount",
    title: "Harvest Count",
    dataLabel: "Harvest Count",
    emptyMessage: "No harvest events recorded for this range",
    gradientId: "harvest-count",
    strokeColor: "var(--chart-2)",
  },
  {
    metric: "averageYieldPerHarvest",
    title: "Avg Yield per Harvest",
    dataLabel: "Average Yield (kg)",
    emptyMessage: "No average harvest yield available",
    gradientId: "harvest-average-yield",
    strokeColor: "var(--chart-3)",
  },
];

function useHarvestTimeseriesData(interval: string) {
  const { params } = useTimeRange();

  const queryParams = React.useMemo(
    () => ({
      startDate: params.startTime,
      endDate: params.endTime,
      interval,
    }),
    [params, interval]
  );

  const query = useHarvestTimeseries(queryParams);

  const timelineData = React.useMemo(() => {
    return (
      query.data?.dataPoints.map((point) => ({
        time: point.timestamp,
        totalYieldKg:
          typeof point.totalYieldKg === "number" ? point.totalYieldKg : null,
        harvestCount:
          typeof point.harvestCount === "number" ? point.harvestCount : null,
        averageYieldPerHarvest:
          typeof point.averageYieldPerHarvest === "number"
            ? point.averageYieldPerHarvest
            : null,
      })) ?? []
    );
  }, [query.data]);

  return {
    ...query,
    timelineData,
  } as const;
}

function createXAxisFormatter(interval: string) {
  const intervalMinutes = parseIntervalMinutes(interval);

  if (Number.isNaN(intervalMinutes)) {
    return (value: string) => value;
  }

  if (intervalMinutes >= 1440) {
    return (value: string) => {
      const date = new Date(value);
      if (Number.isNaN(date.valueOf())) return value;
      return date.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      });
    };
  }

  return (value: string) => {
    const date = new Date(value);
    if (Number.isNaN(date.valueOf())) return value;
    return date.toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };
}

const tooltipLabelFormatter = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.valueOf())) return value;
  return date.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

function parseIntervalMinutes(interval: string) {
  const parts = interval.split(":").map((part) => Number(part));
  if (parts.length !== 3 || parts.some((value) => Number.isNaN(value))) {
    return Number.NaN;
  }

  const [hours, minutes, seconds] = parts;
  return hours * 60 + minutes + Math.floor(seconds / 60);
}

function HarvestTimeseriesChartCard({
  title,
  data,
  isLoading,
  isError,
  error,
  onRetry,
  dataKey,
  dataLabel,
  emptyMessage,
  showIntervalSelector,
  interval,
  onIntervalChange,
  intervalOptions,
  strokeColor,
  gradientId,
  className,
}: {
  title: string;
  data: TimelineDataPoint[];
  isLoading: boolean;
  isError: boolean;
  error: unknown;
  onRetry: () => void;
  dataKey: HarvestMetricKey;
  dataLabel: string;
  emptyMessage: string;
  showIntervalSelector: boolean;
  interval: string;
  onIntervalChange: (value: string) => void;
  intervalOptions?: IntervalOption[];
  strokeColor: string;
  gradientId: string;
  className?: string;
}) {
  if (isError) {
    return (
      <ErrorChartCell
        title={title}
        error={
          error instanceof Error ? error.message : "Failed to load harvest data"
        }
        onRetry={onRetry}
      />
    );
  }

  return (
    <TimelineChart
      className={className}
      title={title}
      data={data}
      isLoading={isLoading}
      dataKey={dataKey}
      dataLabel={dataLabel}
      emptyMessage={emptyMessage}
      showIntervalSelector={showIntervalSelector}
      intervalOptions={intervalOptions}
      currentInterval={interval}
      onIntervalChange={onIntervalChange}
      gradientId={gradientId}
      strokeColor={strokeColor}
      tooltipMode="time"
      tooltipLabelFormatter={tooltipLabelFormatter}
      xAxisFormatter={createXAxisFormatter(interval)}
    />
  );
}

function HarvestTimeseriesSingleChart({
  definition,
  className,
  interval: controlledInterval,
  onIntervalChange,
  intervalOptions,
  showIntervalSelector = true,
}: {
  definition: HarvestTimeseriesChartDefinition;
} & HarvestTimeseriesChartBaseProps) {
  const { metric, title, dataLabel, emptyMessage, gradientId, strokeColor } =
    definition;

  const [internalInterval, setInternalInterval] = React.useState(
    controlledInterval ?? DEFAULT_INTERVAL
  );

  React.useEffect(() => {
    if (controlledInterval) {
      setInternalInterval(controlledInterval);
    }
  }, [controlledInterval]);

  const interval = controlledInterval ?? internalInterval;

  const { timelineData, isLoading, isError, error, refetch } =
    useHarvestTimeseriesData(interval);

  const handleIntervalChange = React.useCallback(
    (value: string) => {
      if (onIntervalChange) {
        onIntervalChange(value);
      }
      if (!controlledInterval) {
        setInternalInterval(value);
      }
    },
    [onIntervalChange, controlledInterval]
  );

  return (
    <HarvestTimeseriesChartCard
      title={title}
      data={timelineData}
      isLoading={isLoading}
      isError={isError}
      error={error}
      onRetry={refetch}
      dataKey={metric}
      dataLabel={dataLabel}
      emptyMessage={emptyMessage}
      showIntervalSelector={showIntervalSelector}
      interval={interval}
      onIntervalChange={handleIntervalChange}
      intervalOptions={intervalOptions}
      strokeColor={strokeColor}
      gradientId={gradientId}
      className={className}
    />
  );
}

export function HarvestTotalYieldChart(props: HarvestTimeseriesChartBaseProps) {
  return (
    <HarvestTimeseriesSingleChart definition={HARVEST_CHARTS[0]} {...props} />
  );
}

export function HarvestCountChart(props: HarvestTimeseriesChartBaseProps) {
  return (
    <HarvestTimeseriesSingleChart definition={HARVEST_CHARTS[1]} {...props} />
  );
}

export function HarvestAverageYieldChart(
  props: HarvestTimeseriesChartBaseProps
) {
  return (
    <HarvestTimeseriesSingleChart definition={HARVEST_CHARTS[2]} {...props} />
  );
}

export type { HarvestTimeseriesChartBaseProps, HarvestTimeseriesResponse };
