import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { usePlantationTreeGrowthTimeseries } from "@/hooks/use-plantation-dashboard";
import { useTimeRange } from "@/hooks/use-time-range";
import { format } from "date-fns";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { Loader2 } from "lucide-react";

interface PlantationTreePlantingActivityChartProps {
  plantationId: string;
  interval?: string;
}

export function PlantationTreePlantingActivityChart({
  plantationId,
  interval = "daily",
}: PlantationTreePlantingActivityChartProps) {
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
      newlyPlanted: point.newlyPlantedCount,
    })) || [];

  const chartConfig = {
    newlyPlanted: {
      label: "Newly Planted Trees",
      color: "var(--chart-3)",
    },
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Tree Planting Activity</CardTitle>
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
          <CardTitle>Tree Planting Activity</CardTitle>
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
          <CardTitle>Tree Planting Activity</CardTitle>
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
        <CardTitle>Tree Planting Activity</CardTitle>
        <p className="text-sm text-muted-foreground">
          New trees planted over time
        </p>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[400px] w-full">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <YAxis tickLine={false} axisLine={false} tickMargin={8} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar
              dataKey="newlyPlanted"
              fill="var(--color-newlyPlanted)"
              radius={4}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
