import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { usePlantationHarvestTimeseries } from "@/hooks/use-plantation-dashboard";
import { useTimeRange } from "@/hooks/use-time-range";
import { format } from "date-fns";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { Loader2 } from "lucide-react";

interface PlantationHarvestYieldChartProps {
  plantationId: string;
  interval?: string;
}

export function PlantationHarvestYieldChart({
  plantationId,
  interval = "daily",
}: PlantationHarvestYieldChartProps) {
  const { params } = useTimeRange();

  const { data, isLoading, error } = usePlantationHarvestTimeseries(
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
      yield: point.totalYieldKg,
    })) || [];

  const chartConfig = {
    yield: {
      label: "Total Yield (kg)",
      color: "var(--chart-1)",
    },
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Harvest Yield</CardTitle>
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
          <CardTitle>Harvest Yield</CardTitle>
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
          <CardTitle>Harvest Yield</CardTitle>
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
        <CardTitle>Harvest Yield</CardTitle>
        <p className="text-sm text-muted-foreground">
          Total yield collected over time
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
            <Bar dataKey="yield" fill="var(--color-yield)" radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
