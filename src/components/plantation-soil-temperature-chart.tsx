import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { usePlantationEnvironmentalTimeseries } from "@/hooks/use-plantation-dashboard";
import { useTimeRange } from "@/hooks/use-time-range";
import { format } from "date-fns";
import { Area, AreaChart, CartesianGrid, Line, XAxis, YAxis } from "recharts";
import { Loader2 } from "lucide-react";

interface PlantationSoilTemperatureChartProps {
  plantationId: string;
  interval?: string;
}

export function PlantationSoilTemperatureChart({
  plantationId,
  interval = "daily",
}: PlantationSoilTemperatureChartProps) {
  const { params } = useTimeRange();

  const { data, isLoading, error } = usePlantationEnvironmentalTimeseries(
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
      avg: point.soilTemperature,
      min: point.minSoilTemperature,
      max: point.maxSoilTemperature,
    })) || [];

  const chartConfig = {
    avg: {
      label: "Avg Soil Temp (°C)",
      color: "var(--chart-3)",
    },
    min: {
      label: "Min Soil Temp (°C)",
      color: "var(--chart-4)",
    },
    max: {
      label: "Max Soil Temp (°C)",
      color: "var(--chart-5)",
    },
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Soil Temperature</CardTitle>
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
          <CardTitle>Soil Temperature</CardTitle>
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
          <CardTitle>Soil Temperature</CardTitle>
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
        <CardTitle>Soil Temperature</CardTitle>
        <p className="text-sm text-muted-foreground">
          Temperature trends with min/max ranges
        </p>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[400px] w-full">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="soilTempGradient" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--chart-4)"
                  stopOpacity={0.3}
                />
                <stop
                  offset="95%"
                  stopColor="var(--chart-4)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <YAxis tickLine={false} axisLine={false} tickMargin={8} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Area
              type="monotone"
              dataKey="min"
              stroke="var(--color-min)"
              fill="url(#soilTempGradient)"
              strokeWidth={1}
              dot={false}
            />
            <Area
              type="monotone"
              dataKey="max"
              stroke="var(--color-max)"
              fill="transparent"
              strokeWidth={1}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="avg"
              stroke="var(--color-avg)"
              strokeWidth={2}
              dot={false}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
