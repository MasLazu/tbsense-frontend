import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { usePlantationEnvironmentalZones } from "@/hooks/use-plantation-dashboard";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { Loader2 } from "lucide-react";

interface PlantationEnvironmentalZonesChartProps {
  plantationId: string;
  period?: string;
}

export function PlantationEnvironmentalZonesChart({
  plantationId,
  period = "7d",
}: PlantationEnvironmentalZonesChartProps) {
  const { data, isLoading, error } = usePlantationEnvironmentalZones(
    plantationId,
    { period }
  );

  const chartData =
    data?.zones?.map((zone) => ({
      zone: zone.zoneName,
      trees: zone.treeCount,
      airTemp: zone.averageAirTemperature,
      soilMoisture: zone.averageSoilMoisture,
    })) || [];

  const chartConfig = {
    trees: {
      label: "Tree Count",
      color: "var(--chart-1)",
    },
    airTemp: {
      label: "Avg Air Temp (°C)",
      color: "var(--chart-2)",
    },
    soilMoisture: {
      label: "Avg Soil Moisture (%)",
      color: "var(--chart-3)",
    },
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Environmental Zones</CardTitle>
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
          <CardTitle>Environmental Zones</CardTitle>
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
          <CardTitle>Environmental Zones</CardTitle>
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
        <CardTitle>Environmental Zones</CardTitle>
        <p className="text-sm text-muted-foreground">
          Environmental conditions across {data?.zones.length || 0} zones
        </p>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[400px] w-full">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="zone"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <YAxis tickLine={false} axisLine={false} tickMargin={8} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="trees" fill="var(--color-trees)" radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
