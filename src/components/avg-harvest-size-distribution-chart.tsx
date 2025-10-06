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
import { useAvgHarvestSizeDistribution } from "@/hooks/use-histograms";
import { useTimeRange } from "@/hooks/use-time-range";
import { format } from "date-fns";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { Settings2 } from "lucide-react";

interface AvgHarvestSizeDistributionChartProps {
  binCount: number;
  onBinCountChange: (value: number) => void;
  showBinControl?: boolean;
}

export function AvgHarvestSizeDistributionChart({
  binCount,
  onBinCountChange,
  showBinControl = false,
}: AvgHarvestSizeDistributionChartProps) {
  const { startTime, endTime } = useTimeRange();

  const { data, isLoading, error } = useAvgHarvestSizeDistribution({
    binCount,
    startDate: startTime
      ? format(new Date(startTime), "yyyy-MM-dd")
      : undefined,
    endDate: endTime ? format(new Date(endTime), "yyyy-MM-dd") : undefined,
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
      color: "hsl(var(--chart-1))",
    },
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Average Harvest Size Distribution</CardTitle>
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
          <CardTitle>Average Harvest Size Distribution</CardTitle>
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
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Average Harvest Size Distribution</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Mean: {mean} kg • Total: {totalCount} plantations
            </p>
          </div>
          {showBinControl && (
            <div className="flex items-center gap-2">
              <Settings2 className="h-4 w-4 text-muted-foreground" />
              <Select
                value={binCount.toString()}
                onValueChange={(value) => onBinCountChange(Number(value))}
              >
                <SelectTrigger className="w-[100px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 bins</SelectItem>
                  <SelectItem value="10">10 bins</SelectItem>
                  <SelectItem value="15">15 bins</SelectItem>
                  <SelectItem value="20">20 bins</SelectItem>
                  <SelectItem value="25">25 bins</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
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
                value: "Harvest Size (kg)",
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
            <Bar dataKey="count" fill="var(--chart-1)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
