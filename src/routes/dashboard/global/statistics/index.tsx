import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { TimeRangeProvider } from "@/components/time-range-provider";
import { StatisticalSummaryCards } from "@/components/statistical-summary-cards";
import { AvgHarvestSizeDistributionChart } from "@/components/avg-harvest-size-distribution-chart";
import { HarvestFrequencyDistributionChart } from "@/components/harvest-frequency-distribution-chart";
import { PlantationSizeDistributionChart } from "@/components/plantation-size-distribution-chart";
import { TreeDensityDistributionChart } from "@/components/tree-density-distribution-chart";
import { YieldDistributionChart } from "@/components/yield-distribution-chart";

export const Route = createFileRoute("/dashboard/global/statistics/")({
  component: RouteComponent,
});

function RouteComponent() {
  const [binCount, setBinCount] = useState(10);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Statistical Analysis
          </h1>
          <p className="text-muted-foreground mt-2">
            Distribution patterns and statistical insights across plantations,
            harvests, and yields
          </p>
        </div>
        <TimeRangeProvider
          invalidateKeys={[["global-histogram"]]}
          loadingKeys={[["global-histogram"]]}
        />
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <StatisticalSummaryCards binCount={binCount} />
      </div>

      {/* Row 1: Harvest Statistics */}
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
        <AvgHarvestSizeDistributionChart
          binCount={binCount}
          onBinCountChange={setBinCount}
          showBinControl={true}
        />
        <HarvestFrequencyDistributionChart binCount={binCount} />
      </div>

      {/* Row 2: Plantation Statistics */}
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
        <PlantationSizeDistributionChart binCount={binCount} />
        <TreeDensityDistributionChart binCount={binCount} />
      </div>

      {/* Row 3: Yield Statistics */}
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
        <YieldDistributionChart binCount={binCount} />
        <div className="flex items-center justify-center p-6 border-2 border-dashed rounded-lg">
          <p className="text-muted-foreground">
            Additional analysis chart placeholder
          </p>
        </div>
      </div>
    </div>
  );
}
