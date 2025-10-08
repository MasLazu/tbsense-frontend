import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { usePlantationTreeActivity } from "@/hooks/use-plantation-dashboard";
import { Pie, PieChart, Cell, Legend } from "recharts";
import { Loader2 } from "lucide-react";

interface PlantationTreeActivityChartProps {
  plantationId: string;
}

const COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

export function PlantationTreeActivityChart({
  plantationId,
}: PlantationTreeActivityChartProps) {
  const { data, isLoading, error } = usePlantationTreeActivity(plantationId);

  const chartData =
    data?.segments?.map((segment, index) => ({
      name: segment.status,
      value: segment.count,
      percentage: segment.percentage,
      fill: COLORS[index % COLORS.length],
    })) || [];

  const chartConfig = chartData.reduce((acc, item, index) => {
    acc[item.name] = {
      label: item.name,
      color: COLORS[index % COLORS.length],
    };
    return acc;
  }, {} as Record<string, { label: string; color: string }>);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Tree Activity Status</CardTitle>
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
          <CardTitle>Tree Activity Status</CardTitle>
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
          <CardTitle>Tree Activity Status</CardTitle>
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
        <CardTitle>Tree Activity Status</CardTitle>
        <p className="text-sm text-muted-foreground">
          Status breakdown of {data?.totalTrees.toLocaleString() || 0} total
          trees
        </p>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[400px] w-full">
          <PieChart>
            <ChartTooltip
              content={<ChartTooltipContent />}
              formatter={(value, _name, props) => [
                `${value} trees (${props.payload.percentage.toFixed(1)}%)`,
                props.payload.name,
              ]}
            />
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percentage }) =>
                `${name}: ${percentage.toFixed(1)}%`
              }
              outerRadius={120}
              fill="#8884d8"
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
            <Legend />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
