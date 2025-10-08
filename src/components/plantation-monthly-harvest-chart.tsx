import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { usePlantationMonthlyHarvestComparison } from "@/hooks/use-plantation-dashboard";
import { useTimeRange } from "@/hooks/use-time-range";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { Loader2 } from "lucide-react";

interface PlantationMonthlyHarvestChartProps {
  plantationId: string;
}

export function PlantationMonthlyHarvestChart({
  plantationId,
}: PlantationMonthlyHarvestChartProps) {
  const { params } = useTimeRange();

  const { data, isLoading, error } = usePlantationMonthlyHarvestComparison(
    plantationId,
    {
      startDate: params.startTime,
      endDate: params.endTime,
    }
  );

  const chartData =
    data?.months?.map((month) => ({
      month: month.month,
      yield: month.totalYieldKg,
      count: month.harvestCount,
    })) || [];

  const chartConfig = {
    yield: {
      label: "Total Yield (kg)",
      color: "var(--chart-1)",
    },
    count: {
      label: "Harvest Count",
      color: "var(--chart-2)",
    },
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Monthly Harvest Comparison</CardTitle>
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
          <CardTitle>Monthly Harvest Comparison</CardTitle>
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
          <CardTitle>Monthly Harvest Comparison</CardTitle>
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
        <CardTitle>Monthly Harvest Comparison</CardTitle>
        <p className="text-sm text-muted-foreground">
          Harvest performance by month
        </p>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[400px] w-full">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <YAxis tickLine={false} axisLine={false} tickMargin={8} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="yield" fill="var(--color-yield)" radius={4} />
            <Bar dataKey="count" fill="var(--color-count)" radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
