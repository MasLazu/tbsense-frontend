import { createFileRoute } from "@tanstack/react-router";
import { TimeRangeProvider } from "@/components/time-range-provider";
import { DistributionSummaryCards } from "@/components/distribution-summary-cards";
import { HarvestDistributionChart } from "@/components/harvest-distribution-chart";
import { LandDistributionChart } from "@/components/land-distribution-chart";
import { TreeDistributionChart } from "@/components/tree-distribution-chart";
import { TreeActivityStatusChart } from "@/components/tree-activity-status-chart";

export const Route = createFileRoute("/dashboard/monitoring/distribution/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Distribution Analysis
          </h1>
          <p className="text-muted-foreground mt-2">
            Proportional resource distribution across plantations
          </p>
        </div>
        <TimeRangeProvider
          invalidateKeys={[["global-chart"]]}
          loadingKeys={[["global-chart"]]}
        />
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <DistributionSummaryCards />
      </div>

      {/* Row 1: Harvest and Land Distribution */}
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
        <HarvestDistributionChart />
        <LandDistributionChart />
      </div>

      {/* Row 2: Tree Distribution and Activity Status */}
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
        <TreeDistributionChart />
        <TreeActivityStatusChart />
      </div>
    </div>
  );
}
