"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useEnvironmentalTimeseries } from "@/hooks/use-timeseries";
import { useTimeRange } from "@/hooks/use-time-range";
import { ErrorChartCell } from "@/components/error-chart-cell";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";

interface DayNightTemperatureComparisonProps {
  className?: string;
}

export function DayNightTemperatureComparison({
  className,
}: DayNightTemperatureComparisonProps) {
  const { params } = useTimeRange();
  const { data, isLoading, error } = useEnvironmentalTimeseries({
    startDate: params.startTime,
    endDate: params.endTime,
    interval: "hourly",
  });

  const chartData = React.useMemo(() => {
    if (!data?.dataPoints) return null;

    const dayReadings: number[] = [];
    const nightReadings: number[] = [];
    const daySoilReadings: number[] = [];
    const nightSoilReadings: number[] = [];

    data.dataPoints.forEach((point) => {
      const hour = new Date(point.timestamp).getHours();
      const isDay = hour >= 6 && hour < 18;

      if (isDay) {
        dayReadings.push(point.airTemperature);
        daySoilReadings.push(point.soilTemperature);
      } else {
        nightReadings.push(point.airTemperature);
        nightSoilReadings.push(point.soilTemperature);
      }
    });

    const avgDay =
      dayReadings.length > 0
        ? dayReadings.reduce((a, b) => a + b, 0) / dayReadings.length
        : 0;
    const avgNight =
      nightReadings.length > 0
        ? nightReadings.reduce((a, b) => a + b, 0) / nightReadings.length
        : 0;
    const avgDaySoil =
      daySoilReadings.length > 0
        ? daySoilReadings.reduce((a, b) => a + b, 0) / daySoilReadings.length
        : 0;
    const avgNightSoil =
      nightSoilReadings.length > 0
        ? nightSoilReadings.reduce((a, b) => a + b, 0) /
          nightSoilReadings.length
        : 0;

    return [
      {
        period: "Day (6AM-6PM)",
        airTemp: avgDay,
        soilTemp: avgDaySoil,
      },
      {
        period: "Night (6PM-6AM)",
        airTemp: avgNight,
        soilTemp: avgNightSoil,
      },
    ];
  }, [data]);

  const chartConfig = {
    airTemp: {
      label: "Air Temperature",
      color: "var(--chart-1)",
    },
    soilTemp: {
      label: "Soil Temperature",
      color: "var(--chart-3)",
    },
  };

  if (error) {
    return (
      <ErrorChartCell
        title="Day/Night Temperature Comparison"
        error={error.message || "Failed to load comparison data"}
      />
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Day/Night Temperature Comparison</CardTitle>
        <p className="text-sm text-muted-foreground">
          Average temperatures during daytime vs nighttime
        </p>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-[250px] w-full" />
          </div>
        ) : !chartData || chartData.length === 0 ? (
          <div className="flex h-[250px] items-center justify-center text-muted-foreground">
            No data available for the selected time range
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="period"
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
                  tickFormatter={(value) => `${value}°C`}
                />
                <Tooltip
                  content={
                    <ChartTooltipContent
                      formatter={(value, name) => {
                        const label =
                          name === "airTemp"
                            ? "Air Temperature"
                            : "Soil Temperature";
                        return [`${Number(value).toFixed(1)}°C`, label];
                      }}
                    />
                  }
                />
                <Legend />
                <Bar
                  dataKey="airTemp"
                  fill="var(--chart-1)"
                  name="Air Temp"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="soilTemp"
                  fill="var(--chart-3)"
                  name="Soil Temp"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
