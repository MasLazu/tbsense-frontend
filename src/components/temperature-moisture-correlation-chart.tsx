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

interface TemperatureMoistureCorrelationChartProps {
  className?: string;
  interval?: string;
  onIntervalChange?: (interval: string) => void;
  showIntervalSelector?: boolean;
  temperatureType?: "air" | "soil";
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

export function TemperatureMoistureCorrelationChart({
  className,
  interval: controlledInterval,
  onIntervalChange,
  showIntervalSelector = true,
  temperatureType = "air",
}: TemperatureMoistureCorrelationChartProps) {
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
      temperature:
        temperatureType === "air"
          ? point.airTemperature
          : point.soilTemperature,
      moisture: point.soilMoisture,
    }));
  }, [data, temperatureType]);

  const chartConfig = {
    temperature: {
      label: temperatureType === "air" ? "Air Temperature" : "Soil Temperature",
      color: temperatureType === "air" ? "var(--chart-1)" : "var(--chart-3)",
    },
    moisture: {
      label: "Soil Moisture",
      color: "var(--chart-5)",
    },
  };

  if (error) {
    return (
      <ErrorChartCell
        title="Temperature vs Moisture Correlation"
        error={error.message || "Failed to load correlation data"}
      />
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="space-y-1">
          <CardTitle>Temperature vs Moisture Correlation</CardTitle>
          <p className="text-sm text-muted-foreground">
            Relationship between {temperatureType === "air" ? "air" : "soil"}{" "}
            temperature and soil moisture
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
              <ComposedChart data={chartData}>
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
                  yAxisId="left"
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                  className="text-muted-foreground"
                  tickFormatter={(value) => `${value}°C`}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
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
                      formatter={(value, name) => {
                        if (name === "temperature") {
                          return [
                            `${Number(value).toFixed(1)}°C`,
                            chartConfig.temperature.label,
                          ];
                        }
                        return [
                          `${Number(value).toFixed(1)}%`,
                          "Soil Moisture",
                        ];
                      }}
                    />
                  }
                />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="temperature"
                  stroke={chartConfig.temperature.color}
                  strokeWidth={2}
                  dot={false}
                  name="temperature"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="moisture"
                  stroke={chartConfig.moisture.color}
                  strokeWidth={2}
                  dot={false}
                  name="moisture"
                />
              </ComposedChart>
            </ResponsiveContainer>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
