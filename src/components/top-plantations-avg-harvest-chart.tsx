import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { useTopPlantationsByAvgHarvest } from "@/hooks/use-bar-charts";
import { useTimeRange } from "@/hooks/use-time-range";
import { format } from "date-fns";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { Filter } from "lucide-react";

interface TopPlantationsAvgHarvestChartProps {
  limit: number;
  onLimitChange: (value: number) => void;
  showLimitControl?: boolean;
}

export function TopPlantationsAvgHarvestChart({
  limit,
  onLimitChange,
  showLimitControl = false,
}: TopPlantationsAvgHarvestChartProps) {
  const { startTime, endTime } = useTimeRange();

  const { data, isLoading, error } = useTopPlantationsByAvgHarvest({
    startDate: startTime
      ? format(new Date(startTime), "yyyy-MM-dd")
      : undefined,
    endDate: endTime ? format(new Date(endTime), "yyyy-MM-dd") : undefined,
    limit,
  });

  const chartData =
    data?.items.map((item) => ({
      name: item.plantationName,
      avgYield: item.averageYieldKg,
      harvestCount: item.harvestCount,
    })) || [];

  const chartConfig = {
    avgYield: {
      label: "Avg Yield (kg)",
      color: "var(--chart-1)",
    },
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Top Plantations by Average Harvest</CardTitle>
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
          <CardTitle>Top Plantations by Average Harvest</CardTitle>
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
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Top Plantations by Average Harvest</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Showing top {chartData.length} plantations
            </p>
          </div>
          {showLimitControl && (
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select
                value={limit.toString()}
                onValueChange={(value) => onLimitChange(Number(value))}
              >
                <SelectTrigger className="w-[100px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">Top 5</SelectItem>
                  <SelectItem value="10">Top 10</SelectItem>
                  <SelectItem value="15">Top 15</SelectItem>
                  <SelectItem value="20">Top 20</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
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
                        <div>Avg Yield: {Number(value).toFixed(2)} kg</div>
                        <div>Harvests: {payload.harvestCount}</div>
                      </div>,
                    ];
                  }}
                />
              }
            />
            <Bar
              dataKey="avgYield"
              fill="var(--chart-1)"
              radius={[0, 4, 4, 0]}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
