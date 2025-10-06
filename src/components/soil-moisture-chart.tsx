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
  AreaChart,
  CartesianGrid,
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

interface SoilMoistureChartProps {
  className?: string;
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

export function SoilMoistureChart({
  className,
  interval: controlledInterval,
  onIntervalChange,
  showIntervalSelector = true,
}: SoilMoistureChartProps) {
  const { params } = useTimeRange();
  const [internalInterval, setInternalInterval] =
    React.useState<string>("hourly");

  const interval = controlledInterval ?? internalInterval;

  const { data, isLoading, error } = useEnvironmentalTimeseries({
    startDate: params.startTime,
    endDate: params.endTime,
    interval,
  });

  // Debug logging
  React.useEffect(() => {
    console.log("[Soil Moisture] Query params:", {
      startDate: params.startTime,
      endDate: params.endTime,
      interval,
      controlledInterval,
      internalInterval,
    });
  }, [
    params.startTime,
    params.endTime,
    interval,
    controlledInterval,
    internalInterval,
  ]);

  React.useEffect(() => {
    console.log("[Soil Moisture] Raw data received:", {
      hasData: !!data,
      dataPointsCount: data?.dataPoints?.length,
      data,
    });
  }, [data]);

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
      moisture: point.soilMoisture,
      sampleCount: point.sampleCount,
    }));

    console.log(
      "[Soil Moisture] Data points:",
      transformed.length,
      transformed
    );
    return transformed;
  }, [data]);

  const chartConfig = {
    moisture: {
      label: "Soil Moisture",
      color: "var(--chart-5)", // Blue
    },
  };

  if (error) {
    return (
      <ErrorChartCell
        title="Soil Moisture"
        error={error.message || "Failed to load soil moisture data"}
      />
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="space-y-1">
          <CardTitle>Soil Moisture Levels</CardTitle>
          <p className="text-sm text-muted-foreground">
            Moisture percentage over time
          </p>
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
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient
                    id="moistureGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="5%"
                      stopColor="var(--chart-5)"
                      stopOpacity={0.8}
                    />
                    <stop
                      offset="95%"
                      stopColor="var(--chart-5)"
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
                  tickFormatter={(value) => `${value}%`}
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
                      formatter={(value) => [
                        `${Number(value).toFixed(1)}%`,
                        "Soil Moisture",
                      ]}
                    />
                  }
                />
                <Area
                  type="monotone"
                  dataKey="moisture"
                  stroke="var(--chart-5)"
                  strokeWidth={2}
                  fill="url(#moistureGradient)"
                  isAnimationActive={true}
                  animationDuration={1000}
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
