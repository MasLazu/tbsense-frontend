import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { useYieldDistribution } from "@/hooks/use-histograms";
import { useTimeRange } from "@/hooks/use-time-range";
import { format } from "date-fns";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

interface YieldDistributionChartProps {
  binCount: number;
}

export function YieldDistributionChart({
  binCount,
}: YieldDistributionChartProps) {
  const { startTime, endTime } = useTimeRange();

  const { data, isLoading, error } = useYieldDistribution({
    binCount,
    startDate: startTime
      ? format(new Date(startTime), "yyyy-MM-dd")
      : undefined,
    endDate: endTime ? format(new Date(endTime), "yyyy-MM-dd") : undefined,
  });

  const chartData =
    data?.bins.map((bin) => ({
      range: `${bin.rangeStart.toFixed(1)}-${bin.rangeEnd.toFixed(1)}`,
      count: bin.count,
    })) || [];

  // Calculate statistics
  const totalCount = data?.bins.reduce((sum, bin) => sum + bin.count, 0) || 0;
  const mean = data?.average?.toFixed(2) || "0";

  const chartConfig = {
    count: {
      label: "Harvests",
      color: "hsl(var(--chart-5))",
    },
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Yield Distribution</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center">
          <p className="text-muted-foreground">Loading...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Yield Distribution</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center">
          <p className="text-destructive">Failed to load data</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Yield Distribution</CardTitle>
        <p className="text-sm text-muted-foreground mt-1">
          Mean: {mean} kg • Total: {totalCount} harvests
        </p>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <BarChart
            data={chartData}
            margin={{ bottom: 80, left: 10, right: 10 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="range"
              angle={-45}
              textAnchor="end"
              height={80}
              interval="preserveStartEnd"
              tick={{ fontSize: 12 }}
              label={{
                value: "Yield (kg)",
                position: "insideBottom",
                offset: -70,
              }}
            />
            <YAxis
              label={{
                value: "Number of Harvests",
                angle: -90,
                position: "insideLeft",
              }}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatter={(value, name) => {
                    if (name === "count") {
                      return [`${value} harvests`, "Count"];
                    }
                    return [value, name];
                  }}
                />
              }
            />
            <Bar dataKey="count" fill="var(--chart-5)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
