import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import GlobalSummaryChart from "@/components/global-summary-chart";
import {
  HarvestTotalYieldChart,
  HarvestCountChart,
} from "@/components/harvest-timeseries-charts";
import { CumulativeYieldChart } from "@/components/cumulative-yield-chart";
import { YieldComparisonChart } from "@/components/yield-comparison-chart";
import { TimeRangeProvider } from "@/components/time-range-provider";
import { TopPlantationsRankCard } from "@/components/top-plantations-rank-card";

export const Route = createFileRoute("/dashboard/overview/")({
  component: RouteComponent,
});

function RouteComponent() {
  const [harvestInterval, setHarvestInterval] = React.useState("24:00:00");

  const handleHarvestIntervalChange = React.useCallback((value: string) => {
    setHarvestInterval(value);
  }, []);

  return (
    <div className="flex flex-col">
      <section className="grid grid-cols-12 gap-4">
        <div className="flex items-start justify-between mb-4 col-span-12">
          <h3 className="text-2xl font-semibold">Global Summary</h3>
          <TimeRangeProvider
            invalidateKeys={[
              ["global-summary"],
              ["global-timeseries"],
              ["global-bar-chart"],
              ["global-histogram"],
              ["global-area-chart"],
              ["global-chart"],
              ["global-environmental"],
            ]}
          />
        </div>

        <GlobalSummaryChart className="col-span-12" />

        <div className="grid gap-4 col-span-9">
          <HarvestTotalYieldChart
            interval={harvestInterval}
            onIntervalChange={handleHarvestIntervalChange}
            showIntervalSelector
          />
          <HarvestCountChart
            interval={harvestInterval}
            onIntervalChange={handleHarvestIntervalChange}
            showIntervalSelector={false}
          />
        </div>
        <TopPlantationsRankCard className="col-span-3" />
        <YieldComparisonChart className="col-span-3" limit={5} />
        <CumulativeYieldChart
          className="col-span-9"
          interval={harvestInterval}
          onIntervalChange={handleHarvestIntervalChange}
          showIntervalSelector={false}
        />
      </section>
    </div>
  );
}
