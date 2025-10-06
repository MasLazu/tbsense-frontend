"use client";

import * as React from "react";
import { Activity, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useEnvironmentalAverages } from "@/hooks/use-environmental";
import { useTimeRange } from "@/hooks/use-time-range";

interface EnvironmentalHealthScoreProps {
  className?: string;
}

// Optimal ranges for environmental conditions
const OPTIMAL_RANGES = {
  airTemperature: { min: 20, max: 30, ideal: 25 },
  soilTemperature: { min: 18, max: 28, ideal: 23 },
  soilMoisture: { min: 50, max: 80, ideal: 65 },
};

type HealthStatus = "excellent" | "good" | "warning" | "poor";

function calculateMetricScore(
  value: number,
  range: { min: number; max: number; ideal: number }
): number {
  if (value < range.min || value > range.max) {
    return 0;
  }

  const distanceFromIdeal = Math.abs(value - range.ideal);
  const maxDistance = Math.max(
    range.ideal - range.min,
    range.max - range.ideal
  );
  const score = 100 - (distanceFromIdeal / maxDistance) * 100;

  return Math.max(0, Math.min(100, score));
}

function getHealthStatus(score: number): HealthStatus {
  if (score >= 90) return "excellent";
  if (score >= 70) return "good";
  if (score >= 50) return "warning";
  return "poor";
}

function getStatusConfig(status: HealthStatus) {
  switch (status) {
    case "excellent":
      return {
        label: "Excellent",
        icon: <CheckCircle2 className="h-5 w-5" />,
        color: "text-green-600 dark:text-green-400",
        bgColor: "bg-green-100 dark:bg-green-950",
        description: "All conditions optimal",
      };
    case "good":
      return {
        label: "Good",
        icon: <CheckCircle2 className="h-5 w-5" />,
        color: "text-blue-600 dark:text-blue-400",
        bgColor: "bg-blue-100 dark:bg-blue-950",
        description: "Conditions within range",
      };
    case "warning":
      return {
        label: "Warning",
        icon: <AlertTriangle className="h-5 w-5" />,
        color: "text-yellow-600 dark:text-yellow-400",
        bgColor: "bg-yellow-100 dark:bg-yellow-950",
        description: "Some conditions suboptimal",
      };
    case "poor":
      return {
        label: "Poor",
        icon: <AlertTriangle className="h-5 w-5" />,
        color: "text-red-600 dark:text-red-400",
        bgColor: "bg-red-100 dark:bg-red-950",
        description: "Conditions need attention",
      };
  }
}

export function EnvironmentalHealthScore({
  className,
}: EnvironmentalHealthScoreProps) {
  const { params } = useTimeRange();
  const { data, isLoading, error } = useEnvironmentalAverages({
    startDate: params.startTime,
    endDate: params.endTime,
  });

  const healthScore = React.useMemo(() => {
    if (!data?.metrics) return null;

    const airTempScore = calculateMetricScore(
      data.metrics.airTemperature,
      OPTIMAL_RANGES.airTemperature
    );
    const soilTempScore = calculateMetricScore(
      data.metrics.soilTemperature,
      OPTIMAL_RANGES.soilTemperature
    );
    const moistureScore = calculateMetricScore(
      data.metrics.soilMoisture,
      OPTIMAL_RANGES.soilMoisture
    );

    const overallScore = (airTempScore + soilTempScore + moistureScore) / 3;

    return {
      overall: overallScore,
      airTemp: airTempScore,
      soilTemp: soilTempScore,
      moisture: moistureScore,
    };
  }, [data]);

  const status = healthScore ? getHealthStatus(healthScore.overall) : "good";
  const statusConfig = getStatusConfig(status);

  if (error) {
    return (
      <Card className={className}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-base font-medium">
            Environmental Health
          </CardTitle>
          <div className="rounded-lg p-2 bg-muted">
            <Activity className="h-4 w-4 text-muted-foreground" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-destructive">Failed to load data</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base font-medium">
          Environmental Health
        </CardTitle>
        <div className={`rounded-lg p-2 ${statusConfig.bgColor}`}>
          <div className={statusConfig.color}>
            <Activity className="h-4 w-4" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-12 w-24" />
            <Skeleton className="h-4 w-32" />
          </div>
        ) : healthScore ? (
          <>
            <div className="flex items-center gap-2">
              <div className="text-5xl font-bold">
                {Math.round(healthScore.overall)}
              </div>
              <div className="flex flex-col">
                <span className="text-sm text-muted-foreground">/ 100</span>
                <div
                  className={`flex items-center gap-1 ${statusConfig.color}`}
                >
                  {statusConfig.icon}
                  <span className="text-sm font-medium">
                    {statusConfig.label}
                  </span>
                </div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              {statusConfig.description}
            </p>
            <div className="mt-4 space-y-1 text-xs text-muted-foreground">
              <div className="flex justify-between">
                <span>Air Temp</span>
                <span className="font-medium">
                  {Math.round(healthScore.airTemp)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span>Soil Temp</span>
                <span className="font-medium">
                  {Math.round(healthScore.soilTemp)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span>Moisture</span>
                <span className="font-medium">
                  {Math.round(healthScore.moisture)}%
                </span>
              </div>
            </div>
          </>
        ) : (
          <div className="text-sm text-muted-foreground">No data available</div>
        )}
      </CardContent>
    </Card>
  );
}
