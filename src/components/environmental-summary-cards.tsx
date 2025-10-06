"use client";

import * as React from "react";
import { Thermometer, Droplets, Leaf } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useEnvironmentalAverages } from "@/hooks/use-environmental";
import { useTimeRange } from "@/hooks/use-time-range";

interface EnvironmentalSummaryCardsProps {
  className?: string;
}

type MetricConfig = {
  key: "airTemperature" | "soilTemperature" | "soilMoisture";
  title: string;
  icon: React.ReactNode;
  unit: string;
  colorClass: string;
  bgColorClass: string;
  formatter: (value: number) => string;
};

const METRIC_CONFIGS: MetricConfig[] = [
  {
    key: "airTemperature",
    title: "Air Temperature",
    icon: <Thermometer className="h-4 w-4" />,
    unit: "°C",
    colorClass: "text-orange-600 dark:text-orange-400",
    bgColorClass: "bg-orange-100 dark:bg-orange-950",
    formatter: (value: number) => value.toFixed(1),
  },
  {
    key: "soilTemperature",
    title: "Soil Temperature",
    icon: <Leaf className="h-4 w-4" />,
    unit: "°C",
    colorClass: "text-amber-700 dark:text-amber-400",
    bgColorClass: "bg-amber-100 dark:bg-amber-950",
    formatter: (value: number) => value.toFixed(1),
  },
  {
    key: "soilMoisture",
    title: "Soil Moisture",
    icon: <Droplets className="h-4 w-4" />,
    unit: "%",
    colorClass: "text-blue-600 dark:text-blue-400",
    bgColorClass: "bg-blue-100 dark:bg-blue-950",
    formatter: (value: number) => value.toFixed(1),
  },
];

function MetricCard({
  config,
  value,
  isLoading,
}: {
  config: MetricConfig;
  value?: number;
  isLoading: boolean;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base font-medium">{config.title}</CardTitle>
        <div className={`rounded-lg p-2 ${config.bgColorClass}`}>
          <div className={config.colorClass}>{config.icon}</div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-4 w-32" />
          </div>
        ) : value !== undefined ? (
          <>
            <div className="text-5xl font-bold">
              {config.formatter(value)}
              <span className="text-3xl text-muted-foreground ml-1">
                {config.unit}
              </span>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Average across all plantations
            </p>
          </>
        ) : (
          <div className="text-sm text-muted-foreground">No data available</div>
        )}
      </CardContent>
    </Card>
  );
}

export function EnvironmentalSummaryCards({
  className,
}: EnvironmentalSummaryCardsProps) {
  const { params } = useTimeRange();
  const { data, isLoading, error } = useEnvironmentalAverages({
    startDate: params.startTime,
    endDate: params.endTime,
  });

  if (error) {
    return (
      <div className={`grid gap-4 md:grid-cols-3 ${className || ""}`}>
        {METRIC_CONFIGS.map((config) => (
          <Card key={config.key}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {config.title}
              </CardTitle>
              <div className={`rounded-lg p-2 ${config.bgColorClass}`}>
                <div className={config.colorClass}>{config.icon}</div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-destructive">
                Failed to load data
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className={`grid gap-4 md:grid-cols-3 ${className || ""}`}>
      {METRIC_CONFIGS.map((config) => (
        <MetricCard
          key={config.key}
          config={config}
          value={data?.metrics?.[config.key]}
          isLoading={isLoading}
        />
      ))}
    </div>
  );
}
