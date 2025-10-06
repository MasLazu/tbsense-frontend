import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { useTopPlantationsByYield } from "@/hooks/use-bar-charts";
import { useTimeRange } from "@/hooks/use-time-range";
import { format } from "date-fns";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

interface TopPlantationsTotalYieldChartProps {
  limit: number;
}

export function TopPlantationsTotalYieldChart({
  limit,
}: TopPlantationsTotalYieldChartProps) {
  const { startTime, endTime } = useTimeRange();

  const { data, isLoading, error } = useTopPlantationsByYield({
    startDate: startTime
      ? format(new Date(startTime), "yyyy-MM-dd")
      : undefined,
    endDate: endTime ? format(new Date(endTime), "yyyy-MM-dd") : undefined,
    limit,
  });

  const chartData =
    data?.items.map((item) => ({
      name: item.plantationName,
      totalYield: item.totalYieldKg,
    })) || [];

  const chartConfig = {
    totalYield: {
      label: "Total Yield (kg)",
      color: "var(--chart-5)",
    },
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Top Plantations by Total Yield</CardTitle>
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
          <CardTitle>Top Plantations by Total Yield</CardTitle>
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
        <CardTitle>Top Plantations by Total Yield</CardTitle>
        <p className="text-sm text-muted-foreground mt-1">
          Showing top {chartData.length} plantations
        </p>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[400px] w-full">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ left: 100, right: 20, top: 10, bottom: 10 }}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
            <XAxis type="number" />
            <YAxis
              type="category"
              dataKey="name"
              width={90}
              tick={{ fontSize: 12 }}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatter={(value, _name, props) => {
                    const payload = props.payload;
                    return [
                      <div key="content" className="space-y-1">
                        <div className="font-semibold">{payload.name}</div>
                        <div>
                          Total Yield: {Number(value).toLocaleString()} kg
                        </div>
                      </div>,
                    ];
                  }}
                />
              }
            />
            <Bar
              dataKey="totalYield"
              fill="var(--chart-5)"
              radius={[0, 4, 4, 0]}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
