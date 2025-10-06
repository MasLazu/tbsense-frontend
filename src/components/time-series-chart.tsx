"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import type { ChartConfig } from "@/components/ui/chart";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

export interface TimelineDataPoint {
  time: string; // ISO datetime
  [key: string]: string | number | null; // Allow flexible data keys and nulls to indicate gaps
}

export interface TimelineSeriesConfig {
  dataKey: string;
  label?: string;
  strokeColor?: string;
  gradientId?: string;
  fillOpacity?: {
    start: number;
    end: number;
  };
}

export interface IntervalOption {
  value: string;
  label: string;
}

export interface LimitOption {
  value: number;
  label: string;
}

export interface TimelineChartProps<T = TimelineDataPoint> {
  data?: T[];
  isLoading?: boolean;
  // Limit selector (optional)
  showLimitSelector?: boolean;
  limitOptions?: LimitOption[];
  currentLimit?: number;
  onLimitChange?: (limit: number) => void;
  // Single series props (backward compatibility)
  dataKey?: string;
  dataLabel?: string;
  gradientId?: string;
  strokeColor?: string;
  fillOpacity?: {
    start: number;
    end: number;
  };
  // Multi-series props
  series?: TimelineSeriesConfig[];
  // Common props
  className?: string;
  height?: number;
  showIntervalSelector?: boolean;
  intervalOptions?: IntervalOption[];
  currentInterval?: string; // Current interval value (required if showIntervalSelector is true)
  onIntervalChange?: (interval: string) => void;
  title?: string;
  emptyMessage?: string;
  xAxisFormatter?: (value: string) => string;
  tooltipLabelFormatter?: (value: string) => string;
  // tooltipMode controls whether the tooltip shows the full time (default) or day-only
  tooltipMode?: "time" | "day";
}

const defaultIntervalOptions: IntervalOption[] = [
  { value: "00:05:00", label: "5 minutes" },
  { value: "00:15:00", label: "15 minutes" },
  { value: "00:30:00", label: "30 minutes" },
  { value: "01:00:00", label: "1 hour" },
  { value: "06:00:00", label: "6 hours" },
  { value: "24:00:00", label: "24 hours" },
];

const defaultLimitOptions: LimitOption[] = [
  { value: 3, label: "3" },
  { value: 5, label: "5" },
  { value: 10, label: "10" },
];

const defaultXAxisFormatter = (value: string) => {
  const date = new Date(value);
  return date.toLocaleDateString(undefined, {
    month: "short",
    year: "numeric",
  });
};

const defaultTooltipFormatter = (value: string) => {
  return new Date(value).toLocaleString();
};

export function TimelineChart({
  data,
  isLoading = false,
  dataKey,
  dataLabel,
  className,
  showIntervalSelector = false,
  intervalOptions = defaultIntervalOptions,
  showLimitSelector = false,
  limitOptions = defaultLimitOptions,
  currentLimit,
  onLimitChange,
  onIntervalChange,
  currentInterval,
  title,
  emptyMessage = "No data",
  xAxisFormatter = defaultXAxisFormatter,
  tooltipLabelFormatter = defaultTooltipFormatter,
  tooltipMode = "time",
  gradientId = "fillTimeline",
  strokeColor = "var(--chart-1)",
  fillOpacity = { start: 0.9, end: 0.05 },
  series,
}: TimelineChartProps) {
  // Determine if we're using multi-series or single series mode
  const isMultiSeries = series && series.length > 0;

  // Build chart config for single or multi-series
  const chartConfig: ChartConfig = React.useMemo(() => {
    if (isMultiSeries) {
      const config: ChartConfig = {};
      series.forEach((s) => {
        config[s.dataKey] = {
          label: s.label || s.dataKey,
          color: s.strokeColor || "var(--chart-1)",
        };
      });
      return config;
    } else {
      return {
        [dataKey!]: {
          label: dataLabel || dataKey!,
          color: strokeColor,
        },
      };
    }
  }, [isMultiSeries, series, dataKey, dataLabel, strokeColor]);

  const hasData = data && data.length > 0;

  return (
    <Card className={cn("@container/card p-3 gap-3", className)}>
      <CardHeader className="p-0 gap-0">
        <div className="flex items-center justify-between w-full">
          <CardTitle>{title || "Timeline Chart"}</CardTitle>
          <div className="flex items-center gap-2">
            {showLimitSelector && (
              <Select
                value={String(currentLimit)}
                onValueChange={(v) => onLimitChange?.(Number(v))}
              >
                <SelectTrigger size="sm" className="w-28">
                  <SelectValue placeholder="Limit" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {(limitOptions || defaultLimitOptions).map((option) => (
                    <SelectItem key={option.value} value={String(option.value)}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {showIntervalSelector && (
              <div>
                <Select
                  value={currentInterval}
                  onValueChange={onIntervalChange}
                >
                  <SelectTrigger size="sm" className="w-36">
                    <SelectValue placeholder="Interval" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {intervalOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {isLoading ? (
          <div className="w-full rounded">
            <Skeleton className="w-full h-64" />
          </div>
        ) : !hasData ? (
          <div className="w-full h-64 grid place-items-center">
            <span className="text-sm text-muted-foreground">
              {emptyMessage}
            </span>
          </div>
        ) : (
          <ChartContainer
            config={chartConfig}
            className="aspect-auto h-[250px] w-full"
          >
            <AreaChart data={data}>
              <defs>
                {isMultiSeries ? (
                  series.map((s) => (
                    <linearGradient
                      key={s.gradientId || `gradient-${s.dataKey}`}
                      id={s.gradientId || `gradient-${s.dataKey}`}
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor={s.strokeColor || "var(--chart-1)"}
                        stopOpacity={s.fillOpacity?.start || 0.9}
                      />
                      <stop
                        offset="95%"
                        stopColor={s.strokeColor || "var(--chart-1)"}
                        stopOpacity={s.fillOpacity?.end || 0.05}
                      />
                    </linearGradient>
                  ))
                ) : (
                  <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor={strokeColor}
                      stopOpacity={fillOpacity.start}
                    />
                    <stop
                      offset="95%"
                      stopColor={strokeColor}
                      stopOpacity={fillOpacity.end}
                    />
                  </linearGradient>
                )}
              </defs>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="time"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={32}
                tickFormatter={xAxisFormatter}
              />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    labelFormatter={
                      tooltipMode === "day"
                        ? (val: string) => {
                            try {
                              const d = new Date(val);
                              return d.toLocaleDateString(undefined, {
                                weekday: "short",
                                month: "short",
                                day: "numeric",
                              });
                            } catch (e) {
                              return String(val);
                            }
                          }
                        : tooltipLabelFormatter
                    }
                    indicator="dot"
                  />
                }
              />
              {isMultiSeries
                ? series.map((s) => (
                    <Area
                      key={s.dataKey}
                      dataKey={s.dataKey}
                      type="natural"
                      fill={`url(#${s.gradientId || `gradient-${s.dataKey}`})`}
                      stroke={s.strokeColor || "var(--chart-1)"}
                      strokeWidth={2}
                      connectNulls={false}
                    />
                  ))
                : dataKey && (
                    <Area
                      dataKey={dataKey}
                      type="natural"
                      fill={`url(#${gradientId})`}
                      stroke={strokeColor}
                      connectNulls={false}
                    />
                  )}
            </AreaChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
