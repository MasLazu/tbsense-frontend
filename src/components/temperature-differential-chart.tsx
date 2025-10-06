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
  ReferenceLine,
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

interface TemperatureDifferentialChartProps {
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

export function TemperatureDifferentialChart({
  className,
  interval: controlledInterval,
  onIntervalChange,
  showIntervalSelector = true,
}: TemperatureDifferentialChartProps) {
  const { params } = useTimeRange();
  const [internalInterval, setInternalInterval] =
    React.useState<string>("hourly");

  const interval = controlledInterval ?? internalInterval;

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

    return data.dataPoints.map((point) => ({
      timestamp: point.timestamp,
      date: format(new Date(point.timestamp), "MMM dd, HH:mm"),
      differential: point.airTemperature - point.soilTemperature,
    }));
  }, [data]);

  const avgDifferential = React.useMemo(() => {
    if (chartData.length === 0) return 0;
    const total = chartData.reduce((sum, item) => sum + item.differential, 0);
    return total / chartData.length;
  }, [chartData]);

  const chartConfig = {
    differential: {
      label: "Temperature Differential",
      color: "var(--chart-4)",
    },
  };

  if (error) {
    return (
      <ErrorChartCell
        title="Temperature Differential"
        error={error.message || "Failed to load differential data"}
      />
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="space-y-1">
          <CardTitle>Temperature Differential</CardTitle>
          <p className="text-sm text-muted-foreground">
            Air - Soil temperature (Avg: {avgDifferential.toFixed(2)}°C)
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
            <Skeleton className="h-[250px] w-full" />
            <div className="flex justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
        ) : chartData.length === 0 ? (
          <div className="flex h-[250px] items-center justify-center text-muted-foreground">
            No data available for the selected time range
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient
                    id="differentialGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="5%"
                      stopColor="var(--chart-4)"
                      stopOpacity={0.8}
                    />
                    <stop
                      offset="95%"
                      stopColor="var(--chart-4)"
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
                      formatter={(value) => [
                        `${Number(value).toFixed(2)}°C`,
                        "Differential",
                      ]}
                    />
                  }
                />
                <ReferenceLine
                  y={0}
                  stroke="var(--muted-foreground)"
                  strokeDasharray="3 3"
                />
                <Area
                  type="monotone"
                  dataKey="differential"
                  stroke="var(--chart-4)"
                  strokeWidth={2}
                  fill="url(#differentialGradient)"
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
