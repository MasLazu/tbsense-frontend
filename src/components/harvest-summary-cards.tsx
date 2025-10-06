import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  useTopPlantationsByYield,
  useHarvestFrequencyByPlantation,
} from "@/hooks/use-bar-charts";
import { useTimeRange } from "@/hooks/use-time-range";
import { format } from "date-fns";
import { TrendingUp, BarChart3, Target, Layers } from "lucide-react";

export function HarvestSummaryCards() {
  const { startTime, endTime } = useTimeRange();

  const { data: yieldData } = useTopPlantationsByYield({
    startDate: startTime
      ? format(new Date(startTime), "yyyy-MM-dd")
      : undefined,
    endDate: endTime ? format(new Date(endTime), "yyyy-MM-dd") : undefined,
  });

  const { data: frequencyData } = useHarvestFrequencyByPlantation({
    startDate: startTime
      ? format(new Date(startTime), "yyyy-MM-dd")
      : undefined,
    endDate: endTime ? format(new Date(endTime), "yyyy-MM-dd") : undefined,
  });

  // Calculate totals
  const totalYield =
    yieldData?.items.reduce((sum, item) => sum + item.totalYieldKg, 0) || 0;
  const totalHarvests =
    frequencyData?.items.reduce((sum, item) => sum + item.harvestCount, 0) || 0;
  const avgYieldPerHarvest = totalHarvests > 0 ? totalYield / totalHarvests : 0;
  const activePlantations = frequencyData?.items.length || 0;

  const formatValue = (value: number) => {
    if (value >= 1000) {
      return (value / 1000).toFixed(2);
    }
    return value.toFixed(2);
  };

  const getUnit = (value: number) => {
    if (value >= 1000) {
      return "tons";
    }
    return "kg";
  };

  const cards = [
    {
      title: "Total Harvest Yield",
      value: formatValue(totalYield),
      unit: getUnit(totalYield),
      icon: TrendingUp,
      color: "text-orange-500",
      bgColor: "bg-orange-500/10",
    },
    {
      title: "Total Harvests",
      value: totalHarvests.toLocaleString(),
      unit: "harvests",
      icon: BarChart3,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      title: "Average Yield per Harvest",
      value: avgYieldPerHarvest.toFixed(2),
      unit: "kg",
      icon: Target,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
    {
      title: "Active Plantations",
      value: activePlantations.toString(),
      unit: "plantations",
      icon: Layers,
      color: "text-amber-500",
      bgColor: "bg-amber-500/10",
    },
  ];

  return (
    <>
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {card.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${card.bgColor}`}>
                <Icon className={`h-4 w-4 ${card.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-5xl font-bold">
                {card.value}
                <span className="text-3xl text-muted-foreground ml-2">
                  {card.unit}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                In selected time range
              </p>
            </CardContent>
          </Card>
        );
      })}
    </>
  );
}
