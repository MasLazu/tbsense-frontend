import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { useTreeActivityStatus } from "@/hooks/use-charts";
import { Cell, Legend, Pie, PieChart } from "recharts";

export function TreeActivityStatusChart() {
  const { data, isLoading, error } = useTreeActivityStatus();

  const chartData =
    data?.items.map((item) => ({
      name: item.status,
      value: item.treeCount,
      percentage: item.percentage,
    })) || [];

  // Use specific colors for Active (green) and Inactive (gray/red)
  const getColor = (status: string) => {
    if (status.toLowerCase() === "active") {
      return "var(--chart-4)"; // Green
    }
    return "var(--destructive)"; // Red/destructive
  };

  const activePercentage =
    data?.items.find((item) => item.status.toLowerCase() === "active")
      ?.percentage || 0;

  const chartConfig = {
    value: {
      label: "Tree Count",
    },
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Tree Activity Status</CardTitle>
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
          <CardTitle>Tree Activity Status</CardTitle>
        </CardHeader>
        <CardContent className="h-[400px] flex items-center justify-center">
          <p className="text-destructive">Failed to load data</p>
        </CardContent>
      </Card>
    );
  }

  if (chartData.length === 0) {
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
        <p className="text-sm text-muted-foreground mt-1">
          Total Trees: {data?.totalTrees.toLocaleString()} • Active:{" "}
          {activePercentage.toFixed(1)}%
        </p>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[400px] w-full">
          <PieChart>
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={80}
              outerRadius={120}
              label={({ percentage }) => `${percentage.toFixed(1)}%`}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getColor(entry.name)} />
              ))}
            </Pie>
            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatter={(value, _name, props) => {
                    const payload = props.payload;
                    return [
                      <div key="content" className="space-y-1">
                        <div className="font-semibold">{payload.name}</div>
                        <div>
                          Count: {Number(value).toLocaleString()} (
                          {payload.percentage.toFixed(1)}%)
                        </div>
                      </div>,
                    ];
                  }}
                />
              }
            />
            <Legend
              verticalAlign="bottom"
              height={36}
              formatter={(value) => <span className="text-sm">{value}</span>}
            />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
