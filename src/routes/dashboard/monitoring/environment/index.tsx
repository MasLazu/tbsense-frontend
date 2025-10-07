import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { EnvironmentalSummaryCards } from "@/components/environmental-summary-cards";
import { EnvironmentalTemperatureChart } from "@/components/environmental-temperature-chart";
import { SoilMoistureChart } from "@/components/soil-moisture-chart";
import { TemperatureMoistureCorrelationChart } from "@/components/temperature-moisture-correlation-chart";
import { SampleCountChart } from "@/components/sample-count-chart";
import { TemperatureDifferentialChart } from "@/components/temperature-differential-chart";
import { DayNightTemperatureComparison } from "@/components/day-night-temperature-comparison";
import { TimeRangeProvider } from "@/components/time-range-provider";

export const Route = createFileRoute("/dashboard/monitoring/environment/")({
  component: RouteComponent,
});

function RouteComponent() {
  const [interval, setInterval] = React.useState("hourly");

  const handleIntervalChange = React.useCallback((value: string) => {
    setInterval(value);
  }, []);

  return (
    <div className="flex flex-col">
      <section className="grid grid-cols-12 gap-4">
        <div className="flex items-start justify-between mb-4 col-span-12">
          <h3 className="text-2xl font-semibold">Environmental Monitoring</h3>
          <TimeRangeProvider
            invalidateKeys={[["global-environmental"], ["global-timeseries"]]}
          />
        </div>

        <EnvironmentalSummaryCards className="col-span-12" />

        <EnvironmentalTemperatureChart
          className="col-span-6"
          type="air"
          interval={interval}
          onIntervalChange={handleIntervalChange}
          showIntervalSelector
        />

        <EnvironmentalTemperatureChart
          className="col-span-6"
          type="soil"
          interval={interval}
          onIntervalChange={handleIntervalChange}
          showIntervalSelector={false}
        />

        <SoilMoistureChart
          className="col-span-12"
          interval={interval}
          onIntervalChange={handleIntervalChange}
          showIntervalSelector={false}
        />

        <TemperatureMoistureCorrelationChart
          className="col-span-12"
          interval={interval}
          onIntervalChange={handleIntervalChange}
          showIntervalSelector={false}
          temperatureType="air"
        />

        <SampleCountChart
          className="col-span-12"
          interval={interval}
          onIntervalChange={handleIntervalChange}
          showIntervalSelector={false}
        />

        <TemperatureDifferentialChart
          className="col-span-6"
          interval={interval}
          onIntervalChange={handleIntervalChange}
          showIntervalSelector={false}
        />

        <DayNightTemperatureComparison className="col-span-6" />
      </section>
    </div>
  );
}
