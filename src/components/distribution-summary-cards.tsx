import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  useHarvestByPlantation,
  usePlantationsByLandArea,
  usePlantationsByTrees,
  useTreeActivityStatus,
} from "@/hooks/use-charts";
import { useTimeRange } from "@/hooks/use-time-range";
import { format } from "date-fns";
import { TrendingUp, Layers, Trees, Activity } from "lucide-react";

export function DistributionSummaryCards() {
  const { startTime, endTime } = useTimeRange();

  const { data: harvestData } = useHarvestByPlantation({
    startDate: startTime
      ? format(new Date(startTime), "yyyy-MM-dd")
      : undefined,
    endDate: endTime ? format(new Date(endTime), "yyyy-MM-dd") : undefined,
  });

  const { data: landData } = usePlantationsByLandArea();
  const { data: treeData } = usePlantationsByTrees();
  const { data: activityData } = useTreeActivityStatus();

  const activePercentage =
    activityData?.items.find((item) => item.status.toLowerCase() === "active")
      ?.percentage || 0;

  const cards = [
    {
      title: "Total Harvest Yield",
      value: harvestData?.totalYieldKg.toLocaleString() || "0",
      unit: "kg",
      icon: TrendingUp,
      color: "text-orange-500",
      bgColor: "bg-orange-500/10",
    },
    {
      title: "Total Land Area",
      value: landData?.totalLandAreaHectares.toFixed(2) || "0",
      unit: "ha",
      icon: Layers,
      color: "text-amber-500",
      bgColor: "bg-amber-500/10",
    },
    {
      title: "Total Trees",
      value: treeData?.totalTrees.toLocaleString() || "0",
      unit: "trees",
      icon: Trees,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
    {
      title: "Active Trees",
      value: activePercentage.toFixed(1),
      unit: "%",
      icon: Activity,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
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
                Across all plantations
              </p>
            </CardContent>
          </Card>
        );
      })}
    </>
  );
}
