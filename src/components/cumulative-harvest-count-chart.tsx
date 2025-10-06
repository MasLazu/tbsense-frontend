import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { useCumulativeHarvestCount } from "@/hooks/use-area-charts";
import { useTimeRange } from "@/hooks/use-time-range";
import { format } from "date-fns";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";

interface CumulativeHarvestCountChartProps {
  interval: string;
}

export function CumulativeHarvestCountChart({
  interval,
}: CumulativeHarvestCountChartProps) {
  const { startTime, endTime } = useTimeRange();

  const { data, isLoading, error } = useCumulativeHarvestCount({
    startDate: startTime
      ? format(new Date(startTime), "yyyy-MM-dd")
      : undefined,
    endDate: endTime ? format(new Date(endTime), "yyyy-MM-dd") : undefined,
    interval,
  });

  const chartData =
    data?.dataPoints.map((point) => ({
      date: format(new Date(point.date), "MMM dd"),
      count: point.cumulativeValue,
    })) || [];

  const chartConfig = {
    count: {
      label: "Cumulative Harvests",
      color: "var(--chart-4)",
    },
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Cumulative Harvest Count</CardTitle>
        </CardHeader>
        <CardContent className="h-[400px] flex items-center justify-center">
          <p className="text-muted-foreground">Loading...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Cumulative Harvest Count</CardTitle>
        </CardHeader>
        <CardContent className="h-[400px] flex items-center justify-center">
          <p className="text-destructive">Failed to load data</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cumulative Harvest Count</CardTitle>
        <p className="text-sm text-muted-foreground mt-1">
          Total: {chartData[chartData.length - 1]?.count || 0} harvests
        </p>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[400px] w-full">
          <AreaChart
            data={chartData}
            margin={{ left: 10, right: 10, top: 10, bottom: 30 }}
          >
            <defs>
              <linearGradient
                id="cumulativeHarvestGradient"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="0%"
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
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="date"
              angle={-45}
              textAnchor="end"
              height={80}
              interval="preserveStartEnd"
              tick={{ fontSize: 12 }}
            />
            <YAxis
              label={{
                value: "Cumulative Count",
                angle: -90,
                position: "insideLeft",
              }}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Area
              type="monotone"
              dataKey="count"
              stroke="var(--chart-4)"
              fill="url(#cumulativeHarvestGradient)"
              strokeWidth={2}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
