import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { usePlantationTreeAgeDistribution } from "@/hooks/use-plantation-dashboard";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { Loader2 } from "lucide-react";

interface PlantationTreeAgeHistogramProps {
  plantationId: string;
  binCount?: number;
}

export function PlantationTreeAgeHistogram({
  plantationId,
  binCount = 10,
}: PlantationTreeAgeHistogramProps) {
  const { data, isLoading, error } = usePlantationTreeAgeDistribution(
    plantationId,
    { binCount }
  );

  const chartData =
    data?.bins?.map((bin) => ({
      range: `${bin.rangeStart.toFixed(1)}-${bin.rangeEnd.toFixed(1)}`,
      count: bin.count,
      percentage: bin.percentage,
    })) || [];

  const chartConfig = {
    count: {
      label: "Tree Count",
      color: "var(--chart-1)",
    },
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Tree Age Distribution</CardTitle>
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
          <CardTitle>Tree Age Distribution</CardTitle>
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
          <CardTitle>Tree Age Distribution</CardTitle>
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
        <CardTitle>Tree Age Distribution</CardTitle>
        <p className="text-sm text-muted-foreground">
          Age distribution across {data?.totalTrees.toLocaleString() || 0} trees
          • Average: {data?.averageAge.toFixed(1) || 0} years
        </p>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[400px] w-full">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="range"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis tickLine={false} axisLine={false} tickMargin={8} />
            <ChartTooltip
              content={<ChartTooltipContent />}
              formatter={(value, _name, props) => [
                `${value} trees (${props.payload.percentage.toFixed(1)}%)`,
                "Count",
              ]}
            />
            <Bar dataKey="count" fill="var(--color-count)" radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
