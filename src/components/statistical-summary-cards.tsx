import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  useAvgHarvestSizeDistribution,
  useYieldDistribution,
  usePlantationSizeDistribution,
  useTreeDensityDistribution,
} from "@/hooks/use-histograms";
import { useTimeRange } from "@/hooks/use-time-range";
import { format } from "date-fns";
import { BarChart3, TrendingUp, Layers, Trees } from "lucide-react";

interface StatisticalSummaryCardsProps {
  binCount: number;
}

export function StatisticalSummaryCards({
  binCount,
}: StatisticalSummaryCardsProps) {
  const { startTime, endTime } = useTimeRange();

  const { data: harvestSizeData } = useAvgHarvestSizeDistribution({
    binCount,
    startDate: startTime
      ? format(new Date(startTime), "yyyy-MM-dd")
      : undefined,
    endDate: endTime ? format(new Date(endTime), "yyyy-MM-dd") : undefined,
  });

  const { data: yieldData } = useYieldDistribution({
    binCount,
    startDate: startTime
      ? format(new Date(startTime), "yyyy-MM-dd")
      : undefined,
    endDate: endTime ? format(new Date(endTime), "yyyy-MM-dd") : undefined,
  });

  const { data: plantationSizeData } = usePlantationSizeDistribution({
    binCount,
  });

  const { data: treeDensityData } = useTreeDensityDistribution({
    binCount,
  });

  // Calculate standard deviations using the midpoint of each bin
  const calculateStdDev = (bins: any[], average: number) => {
    if (!bins || bins.length === 0) return 0;
    const totalCount = bins.reduce(
      (sum: number, bin: any) => sum + bin.count,
      0
    );
    if (totalCount === 0) return 0;

    const variance =
      bins.reduce((sum: number, bin: any) => {
        const midpoint = (bin.rangeStart + bin.rangeEnd) / 2;
        return sum + bin.count * Math.pow(midpoint - average, 2);
      }, 0) / totalCount;
    return Math.sqrt(variance);
  };

  const harvestStdDev = harvestSizeData
    ? calculateStdDev(harvestSizeData.bins, harvestSizeData.average)
    : 0;
  const yieldStdDev = yieldData
    ? calculateStdDev(yieldData.bins, yieldData.average)
    : 0;
  const plantationStdDev = plantationSizeData
    ? calculateStdDev(plantationSizeData.bins, plantationSizeData.average)
    : 0;
  const densityStdDev = treeDensityData
    ? calculateStdDev(treeDensityData.bins, treeDensityData.average)
    : 0;

  const cards = [
    {
      title: "Harvest Size Variance",
      value: harvestStdDev.toFixed(2),
      unit: "kg",
      icon: BarChart3,
      color: "text-orange-500",
      bgColor: "bg-orange-500/10",
    },
    {
      title: "Yield Variance",
      value: yieldStdDev.toFixed(2),
      unit: "kg",
      icon: TrendingUp,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      title: "Plantation Size Variance",
      value: plantationStdDev.toFixed(2),
      unit: "ha",
      icon: Layers,
      color: "text-amber-500",
      bgColor: "bg-amber-500/10",
    },
    {
      title: "Density Variance",
      value: densityStdDev.toFixed(1),
      unit: "trees/ha",
      icon: Trees,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
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
                Standard deviation
              </p>
            </CardContent>
          </Card>
        );
      })}
    </>
  );
}
