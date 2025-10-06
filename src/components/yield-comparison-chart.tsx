"use client";

import * as React from "react";
import { Label, PolarRadiusAxis, RadialBar, RadialBarChart } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";
import { useTopPlantationsByYield } from "@/hooks/use-bar-charts";
import { useTimeRange } from "@/hooks/use-time-range";
import { ErrorChartCell } from "@/components/error-chart-cell";

interface YieldComparisonChartProps {
  className?: string;
  limit?: number;
}

const CHART_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

export function YieldComparisonChart({
  className,
  limit = 5,
}: YieldComparisonChartProps) {
  const { params } = useTimeRange();
  const { data, isLoading, error } = useTopPlantationsByYield({
    startDate: params.startTime,
    endDate: params.endTime,
    limit,
  });

  // Transform data for radial chart
  const chartData = React.useMemo(() => {
    if (!data?.items || data.items.length === 0) return [];

    // Create a single data point with all plantations as properties
    const dataPoint: Record<string, number> = {};

    data.items.forEach((plantation, index) => {
      dataPoint[`plantation${index}`] = plantation.totalYieldKg;
    });

    return [dataPoint];
  }, [data]);

  // Generate chart config dynamically
  const chartConfig = React.useMemo(() => {
    if (!data?.items || data.items.length === 0) return {};

    const config: ChartConfig = {};

    data.items.forEach((plantation, index) => {
      config[`plantation${index}`] = {
        label: plantation.plantationName,
        color: CHART_COLORS[index % CHART_COLORS.length],
      };
    });

    return config;
  }, [data]) satisfies ChartConfig;

  const totalYield = React.useMemo(() => {
    if (!data?.items) return 0;
    return data.items.reduce((sum, p) => sum + p.totalYieldKg, 0);
  }, [data]);

  // Convert kg to tons for display
  const totalYieldTons = React.useMemo(() => {
    return (totalYield / 1000).toFixed(2);
  }, [totalYield]);

  const topPerformer = React.useMemo(() => {
    if (!data?.items || data.items.length === 0) return null;
    return data.items[0];
  }, [data]);

  const growthPercentage = React.useMemo(() => {
    if (!data?.items || data.items.length < 2) return 0;
    const top = data.items[0].totalYieldKg;
    const second = data.items[1].totalYieldKg;
    return ((top - second) / second) * 100;
  }, [data]);

  if (error) {
    return (
      <ErrorChartCell
        title="Yield Comparison"
        error={error.message || "Failed to load yield comparison data"}
      />
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="items-center pb-0">
        <CardTitle>Yield Distribution</CardTitle>
        <CardDescription>
          Top {limit} plantations by total yield
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-1 items-center pb-0">
        {isLoading ? (
          <div className="mx-auto aspect-square w-full max-w-[250px] space-y-4">
            <Skeleton className="h-[250px] w-[250px] rounded-full" />
            <Skeleton className="h-4 w-32 mx-auto" />
          </div>
        ) : chartData.length === 0 || !data?.items ? (
          <div className="flex h-[250px] w-full items-center justify-center text-muted-foreground">
            No yield data available
          </div>
        ) : (
          <ChartContainer
            config={chartConfig}
            className="mx-auto aspect-square w-full max-w-[250px]"
          >
            <RadialBarChart
              data={chartData}
              startAngle={0}
              endAngle={360}
              innerRadius={60}
              outerRadius={110}
            >
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
                <Label
                  content={({ viewBox }) => {
                    if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                      return (
                        <text
                          x={viewBox.cx}
                          y={viewBox.cy}
                          textAnchor="middle"
                          dominantBaseline="middle"
                        >
                          <tspan
                            x={viewBox.cx}
                            y={viewBox.cy}
                            className="fill-foreground text-2xl font-bold"
                          >
                            {totalYieldTons}
                          </tspan>
                          <tspan
                            x={viewBox.cx}
                            y={(viewBox.cy || 0) + 24}
                            className="fill-muted-foreground"
                          >
                            Tons
                          </tspan>
                        </text>
                      );
                    }
                  }}
                />
              </PolarRadiusAxis>
              {data?.items.map((plantation, index) => (
                <RadialBar
                  key={plantation.plantationName}
                  dataKey={`plantation${index}`}
                  stackId="a"
                  cornerRadius={5}
                  fill={CHART_COLORS[index % CHART_COLORS.length]}
                  className="stroke-transparent stroke-2"
                />
              ))}
            </RadialBarChart>
          </ChartContainer>
        )}
      </CardContent>
      {!isLoading && data?.items && data.items.length > 0 && (
        <CardFooter className="flex-col gap-2 text-sm">
          <div className="flex items-center gap-2 leading-none font-medium">
            {topPerformer && (
              <>
                {topPerformer.plantationName} leads by{" "}
                {Math.abs(growthPercentage).toFixed(1)}%
              </>
            )}
          </div>
          <div className="text-muted-foreground leading-none">
            Showing top {data.items.length} plantation
            {data.items.length !== 1 ? "s" : ""} by yield
          </div>
        </CardFooter>
      )}
    </Card>
  );
}
