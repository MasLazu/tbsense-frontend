import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { usePlantationSizeDistribution } from "@/hooks/use-histograms";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

interface PlantationSizeDistributionChartProps {
  binCount: number;
}

export function PlantationSizeDistributionChart({
  binCount,
}: PlantationSizeDistributionChartProps) {
  const { data, isLoading, error } = usePlantationSizeDistribution({
    binCount,
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
      label: "Plantations",
      color: "hsl(var(--chart-3))",
    },
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Plantation Size Distribution</CardTitle>
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
          <CardTitle>Plantation Size Distribution</CardTitle>
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
        <CardTitle>Plantation Size Distribution</CardTitle>
        <p className="text-sm text-muted-foreground mt-1">
          Mean: {mean} hectares • Total: {totalCount} plantations
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
                value: "Plantation Size (hectares)",
                position: "insideBottom",
                offset: -70,
              }}
            />
            <YAxis
              label={{
                value: "Number of Plantations",
                angle: -90,
                position: "insideLeft",
              }}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatter={(value, name) => {
                    if (name === "count") {
                      return [`${value} plantations`, "Count"];
                    }
                    return [value, name];
                  }}
                />
              }
            />
            <Bar dataKey="count" fill="var(--chart-3)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
