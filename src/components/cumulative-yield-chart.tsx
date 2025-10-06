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
import { useCumulativeYield } from "@/hooks/use-area-charts";
import { useTimeRange } from "@/hooks/use-time-range";
import { ErrorChartCell } from "@/components/error-chart-cell";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";

interface CumulativeYieldChartProps {
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
  { label: "Hourly", value: "01:00:00" },
  { label: "Daily", value: "24:00:00" },
  { label: "Weekly", value: "168:00:00" },
  { label: "Monthly", value: "720:00:00" },
];

export function CumulativeYieldChart({
  className,
  interval: controlledInterval,
  onIntervalChange,
  showIntervalSelector = true,
}: CumulativeYieldChartProps) {
  const { params } = useTimeRange();
  const [internalInterval, setInternalInterval] =
    React.useState<string>("24:00:00");

  // Use controlled interval if provided, otherwise use internal state
  const interval = controlledInterval ?? internalInterval;

  const { data, isLoading, error } = useCumulativeYield({
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
      timestamp: point.date,
      date: format(new Date(point.date), "MMM dd, HH:mm"),
      cumulativeYield: point.cumulativeValue,
    }));
  }, [data]);

  const chartConfig = {
    cumulativeYield: {
      label: "Cumulative Yield (kg)",
      color: "var(--chart-1)",
    },
  };

  if (error) {
    return (
      <ErrorChartCell
        title="Cumulative Yield Over Time"
        error={error.message || "Failed to load cumulative yield data"}
      />
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="space-y-1">
          <CardTitle>Cumulative Yield Over Time</CardTitle>
          <p className="text-sm text-muted-foreground">
            Total accumulated harvest yield (kg)
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
                    id="cumulativeYieldGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="5%"
                      stopColor="var(--chart-1)"
                      stopOpacity={0.8}
                    />
                    <stop
                      offset="95%"
                      stopColor="var(--chart-1)"
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
                />
                <YAxis
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                  className="text-muted-foreground"
                  tickFormatter={(value) => `${value.toLocaleString()} kg`}
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
                        `${Number(value).toLocaleString()} kg`,
                        "Cumulative Yield",
                      ]}
                    />
                  }
                />
                <Area
                  type="monotone"
                  dataKey="cumulativeYield"
                  stroke="var(--chart-1)"
                  strokeWidth={2}
                  fill="url(#cumulativeYieldGradient)"
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
