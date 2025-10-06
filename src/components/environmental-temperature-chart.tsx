"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Area,
  CartesianGrid,
  Line,
  ComposedChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { format } from "date-fns";
import { useEnvironmentalTimeseries } from "@/hooks/use-timeseries";
import { useTimeRange } from "@/hooks/use-time-range";
import { ErrorChartCell } from "@/components/error-chart-cell";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";

interface EnvironmentalTemperatureChartProps {
  className?: string;
  type: "air" | "soil";
  interval?: string;
  onIntervalChange?: (interval: string) => void;
  showIntervalSelector?: boolean;
}

type IntervalOption = {
  label: string;
  value: string;
};

const intervalOptions: IntervalOption[] = [
  { label: "Hourly", value: "hourly" },
  { label: "Daily", value: "daily" },
  { label: "Weekly", value: "weekly" },
  { label: "Monthly", value: "monthly" },
];

const CHART_CONFIG = {
  air: {
    title: "Air Temperature",
    description: "Temperature trends with min/max ranges",
    avgKey: "airTemperature",
    minKey: "minAirTemperature",
    maxKey: "maxAirTemperature",
    avgLabel: "Avg Air Temp",
    minLabel: "Min Air Temp",
    maxLabel: "Max Air Temp",
    lineColor: "var(--chart-1)", // Orange
    areaColor: "var(--chart-2)", // Lighter orange
    gradientId: "airTempGradient",
  },
  soil: {
    title: "Soil Temperature",
    description: "Temperature trends with min/max ranges",
    avgKey: "soilTemperature",
    minKey: "minSoilTemperature",
    maxKey: "maxSoilTemperature",
    avgLabel: "Avg Soil Temp",
    minLabel: "Min Soil Temp",
    maxLabel: "Max Soil Temp",
    lineColor: "var(--chart-3)", // Brown/Amber
    areaColor: "var(--chart-4)", // Lighter brown
    gradientId: "soilTempGradient",
  },
};

export function EnvironmentalTemperatureChart({
  className,
  type,
  interval: controlledInterval,
  onIntervalChange,
  showIntervalSelector = true,
}: EnvironmentalTemperatureChartProps) {
  const { params } = useTimeRange();
  const [internalInterval, setInternalInterval] =
    React.useState<string>("hourly");

  const interval = controlledInterval ?? internalInterval;
  const config = CHART_CONFIG[type];

  const { data, isLoading, error } = useEnvironmentalTimeseries({
    startDate: params.startTime,
    endDate: params.endTime,
    interval,
  });

  const handleIntervalChange = React.useCallback(
    (value: string) => {
      if (onIntervalChange) {
        onIntervalChange(value);
      } else {
        setInternalInterval(value);
      }
    },
    [onIntervalChange]
  );

  const chartData = React.useMemo(() => {
    if (!data?.dataPoints) return [];

    const transformed = data.dataPoints.map((point) => ({
      timestamp: point.timestamp,
      date: format(new Date(point.timestamp), "MMM dd, HH:mm"),
      avg: point[config.avgKey as keyof typeof point] as number,
      min: point[config.minKey as keyof typeof point] as number,
      max: point[config.maxKey as keyof typeof point] as number,
      sampleCount: point.sampleCount,
    }));

    console.log(
      `[${type} Temperature] Data points:`,
      transformed.length,
      transformed
    );
    return transformed;
  }, [data, config, type]);

  const chartConfig = {
    avg: {
      label: config.avgLabel,
      color: config.lineColor,
    },
    min: {
      label: config.minLabel,
      color: config.areaColor,
    },
    max: {
      label: config.maxLabel,
      color: config.areaColor,
    },
  };

  if (error) {
    return (
      <ErrorChartCell
        title={config.title}
        error={error.message || "Failed to load temperature data"}
      />
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="space-y-1">
          <CardTitle>{config.title}</CardTitle>
          <p className="text-sm text-muted-foreground">{config.description}</p>
        </div>
        {showIntervalSelector && (
          <Select value={interval} onValueChange={handleIntervalChange}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Select interval" />
            </SelectTrigger>
            <SelectContent>
              {intervalOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-[300px] w-full" />
            <div className="flex justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
        ) : chartData.length === 0 ? (
          <div className="flex h-[300px] items-center justify-center text-muted-foreground">
            No data available for the selected time range
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData}>
                <defs>
                  <linearGradient
                    id={config.gradientId}
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="5%"
                      stopColor={config.areaColor}
                      stopOpacity={0.3}
                    />
                    <stop
                      offset="95%"
                      stopColor={config.areaColor}
                      stopOpacity={0.1}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                  className="text-muted-foreground"
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  interval="preserveStartEnd"
                />
                <YAxis
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                  className="text-muted-foreground"
                  tickFormatter={(value) => `${value}°C`}
                />
                <Tooltip
                  content={
                    <ChartTooltipContent
                      labelFormatter={(_, payload) => {
                        if (payload?.[0]?.payload?.timestamp) {
                          return format(
                            new Date(payload[0].payload.timestamp),
                            "MMM dd, yyyy HH:mm"
                          );
                        }
                        return "";
                      }}
                      formatter={(value, name) => {
                        const label =
                          name === "avg"
                            ? config.avgLabel
                            : name === "min"
                            ? config.minLabel
                            : config.maxLabel;
                        return [`${Number(value).toFixed(1)}°C`, label];
                      }}
                    />
                  }
                />
                {/* Shaded area for min-max range */}
                <Area
                  type="monotone"
                  dataKey="max"
                  stroke="none"
                  fill={`url(#${config.gradientId})`}
                  isAnimationActive={true}
                  animationDuration={1000}
                />
                <Area
                  type="monotone"
                  dataKey="min"
                  stroke="none"
                  fill="white"
                  fillOpacity={1}
                  isAnimationActive={true}
                  animationDuration={1000}
                />
                {/* Average temperature line */}
                <Line
                  type="monotone"
                  dataKey="avg"
                  stroke={config.lineColor}
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={true}
                  animationDuration={1000}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
