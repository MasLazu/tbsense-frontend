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
import { useHarvestTimeseries } from "@/hooks/use-timeseries";
import { useTimeRange } from "@/hooks/use-time-range";
import { format } from "date-fns";
import { CartesianGrid, ComposedChart, Line, XAxis, YAxis } from "recharts";
import { Settings2 } from "lucide-react";

interface HarvestTimeseriesChartProps {
  interval: string;
  onIntervalChange: (value: string) => void;
  showIntervalSelector?: boolean;
}

const intervalOptions = [
  { label: "Hourly", value: "hourly" },
  { label: "Daily", value: "daily" },
  { label: "Weekly", value: "weekly" },
  { label: "Monthly", value: "monthly" },
];

export function HarvestTimeseriesChart({
  interval,
  onIntervalChange,
  showIntervalSelector = false,
}: HarvestTimeseriesChartProps) {
  const { startTime, endTime } = useTimeRange();

  const { data, isLoading, error } = useHarvestTimeseries({
    startDate: startTime
      ? format(new Date(startTime), "yyyy-MM-dd")
      : undefined,
    endDate: endTime ? format(new Date(endTime), "yyyy-MM-dd") : undefined,
    interval,
  });

  const chartData =
    data?.dataPoints.map((point) => ({
      date: format(new Date(point.timestamp), "MMM dd"),
      yield: point.totalYieldKg,
      count: point.harvestCount,
    })) || [];

  const chartConfig = {
    yield: {
      label: "Yield (kg)",
      color: "var(--chart-1)",
    },
    count: {
      label: "Harvest Count",
      color: "var(--chart-5)",
    },
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Harvest Trends Over Time</CardTitle>
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
          <CardTitle>Harvest Trends Over Time</CardTitle>
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
            <CardTitle>Harvest Trends Over Time</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Yield and harvest count over time
            </p>
          </div>
          {showIntervalSelector && (
            <div className="flex items-center gap-2">
              <Settings2 className="h-4 w-4 text-muted-foreground" />
              <Select value={interval} onValueChange={onIntervalChange}>
                <SelectTrigger className="w-[110px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {intervalOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[400px] w-full">
          <ComposedChart
            data={chartData}
            margin={{ left: 10, right: 10, top: 10, bottom: 30 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="date"
              angle={-45}
              textAnchor="end"
              height={80}
              interval="preserveStartEnd"
              tick={{ fontSize: 12 }}
            />
            <YAxis
              yAxisId="left"
              label={{
                value: "Yield (kg)",
                angle: -90,
                position: "insideLeft",
              }}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              label={{
                value: "Harvest Count",
                angle: 90,
                position: "insideRight",
              }}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="yield"
              stroke="var(--chart-1)"
              strokeWidth={2}
              dot={{ fill: "var(--chart-1)" }}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="count"
              stroke="var(--chart-5)"
              strokeWidth={2}
              dot={{ fill: "var(--chart-5)" }}
            />
          </ComposedChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
