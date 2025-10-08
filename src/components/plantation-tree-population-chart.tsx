import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { usePlantationTreeGrowthTimeseries } from "@/hooks/use-plantation-dashboard";
import { useTimeRange } from "@/hooks/use-time-range";
import { format } from "date-fns";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { Loader2 } from "lucide-react";

interface PlantationTreePopulationChartProps {
  plantationId: string;
  interval?: string;
}

export function PlantationTreePopulationChart({
  plantationId,
  interval = "daily",
}: PlantationTreePopulationChartProps) {
  const { params } = useTimeRange();

  const { data, isLoading, error } = usePlantationTreeGrowthTimeseries(
    plantationId,
    {
      startDate: params.startTime,
      endDate: params.endTime,
      interval,
    }
  );

  const chartData =
    data?.dataPoints?.map((point) => ({
      date: format(new Date(point.timestamp), "MMM dd"),
      total: point.totalTrees,
      active: point.activeTrees,
    })) || [];

  const chartConfig = {
    total: {
      label: "Total Trees",
      color: "var(--chart-1)",
    },
    active: {
      label: "Active Trees",
      color: "var(--chart-2)",
    },
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Tree Population</CardTitle>
        </CardHeader>
        <CardContent className="h-[400px] flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Tree Population</CardTitle>
        </CardHeader>
        <CardContent className="h-[400px] flex items-center justify-center">
          <p className="text-destructive">Failed to load data</p>
        </CardContent>
      </Card>
    );
  }

  if (!chartData.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Tree Population</CardTitle>
        </CardHeader>
        <CardContent className="h-[400px] flex items-center justify-center">
          <p className="text-muted-foreground">No data available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tree Population</CardTitle>
        <p className="text-sm text-muted-foreground">
          Total and active trees over time
        </p>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[400px] w-full">
          <AreaChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <YAxis tickLine={false} axisLine={false} tickMargin={8} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Area
              type="monotone"
              dataKey="total"
              stroke="var(--color-total)"
              fill="var(--color-total)"
              fillOpacity={0.2}
              stackId="1"
            />
            <Area
              type="monotone"
              dataKey="active"
              stroke="var(--color-active)"
              fill="var(--color-active)"
              fillOpacity={0.2}
              stackId="2"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
