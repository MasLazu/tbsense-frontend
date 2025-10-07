import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { TimeRangeProvider } from "@/components/time-range-provider";
import { HarvestSummaryCards } from "@/components/harvest-summary-cards";
import { TopPlantationsAvgHarvestChart } from "@/components/top-plantations-avg-harvest-chart";
import { TopPlantationsTotalYieldChart } from "@/components/top-plantations-total-yield-chart";
import { HarvestFrequencyChart } from "@/components/harvest-frequency-chart";
import { HarvestTimeseriesChart } from "@/components/harvest-timeseries-chart";
import { CumulativeHarvestCountChart } from "@/components/cumulative-harvest-count-chart";
import { CumulativeYieldChart } from "@/components/cumulative-yield-chart";

export const Route = createFileRoute("/dashboard/monitoring/harvest/")({
  component: RouteComponent,
});

function RouteComponent() {
  const [limit, setLimit] = useState(10);
  const [interval, setInterval] = useState("daily");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Harvest Analysis
          </h1>
          <p className="text-muted-foreground mt-2">
            Comprehensive harvest performance and trends across plantations
          </p>
        </div>
        <TimeRangeProvider
          invalidateKeys={[
            ["global-bar-chart"],
            ["global-timeseries"],
            ["global-area-chart"],
          ]}
          loadingKeys={[
            ["global-bar-chart"],
            ["global-timeseries"],
            ["global-area-chart"],
          ]}
        />
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <HarvestSummaryCards />
      </div>

      {/* Row 1: Top Plantations */}
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
        <TopPlantationsAvgHarvestChart
          limit={limit}
          onLimitChange={setLimit}
          showLimitControl={true}
        />
        <TopPlantationsTotalYieldChart limit={limit} />
      </div>

      {/* Row 2: Frequency and Timeseries */}
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
        <HarvestFrequencyChart />
        <HarvestTimeseriesChart
          interval={interval}
          onIntervalChange={setInterval}
          showIntervalSelector={true}
        />
      </div>

      {/* Row 3: Cumulative Charts */}
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
        <CumulativeHarvestCountChart interval={interval} />
        <CumulativeYieldChart
          interval={interval}
          onIntervalChange={setInterval}
          showIntervalSelector={false}
        />
      </div>
    </div>
  );
}
