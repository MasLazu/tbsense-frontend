import { useQuery } from "@tanstack/react-query";
import { useAuth } from "./use-auth";
import {
  PlantationDashboardService,
  type PlantationBasicSummaryResponse,
  type PlantationHarvestSummaryResponse,
  type PlantationTreesSummaryResponse,
  type PlantationEnvironmentalTimeseriesResponse,
  type PlantationHarvestTimeseriesResponse,
  type PlantationTreeGrowthTimeseriesResponse,
  type TreeAgeDistributionHistogramResponse,
  type PlantationTreeActivityResponse,
  type MonthlyHarvestComparisonResponse,
  type EnvironmentalZonesResponse,
} from "../services/plantation-dashboard-service";

// Query keys factory
export const plantationDashboardKeys = {
  all: (plantationId: string) =>
    ["plantation-dashboard", plantationId] as const,
  basicSummary: (plantationId: string) =>
    [...plantationDashboardKeys.all(plantationId), "basic-summary"] as const,
  harvestSummary: (
    plantationId: string,
    params?: { startDate?: string; endDate?: string }
  ) =>
    [
      ...plantationDashboardKeys.all(plantationId),
      "harvest-summary",
      params,
    ] as const,
  treesSummary: (plantationId: string) =>
    [...plantationDashboardKeys.all(plantationId), "trees-summary"] as const,
  environmentalTimeseries: (
    plantationId: string,
    params?: { startDate?: string; endDate?: string; interval?: string }
  ) =>
    [
      ...plantationDashboardKeys.all(plantationId),
      "environmental-timeseries",
      params,
    ] as const,
  harvestTimeseries: (
    plantationId: string,
    params?: { startDate?: string; endDate?: string; interval?: string }
  ) =>
    [
      ...plantationDashboardKeys.all(plantationId),
      "harvest-timeseries",
      params,
    ] as const,
  treeGrowthTimeseries: (
    plantationId: string,
    params?: { startDate?: string; endDate?: string; interval?: string }
  ) =>
    [
      ...plantationDashboardKeys.all(plantationId),
      "tree-growth-timeseries",
      params,
    ] as const,
  treeAgeDistribution: (plantationId: string, params?: { binCount?: number }) =>
    [
      ...plantationDashboardKeys.all(plantationId),
      "tree-age-distribution",
      params,
    ] as const,
  treeActivity: (plantationId: string) =>
    [...plantationDashboardKeys.all(plantationId), "tree-activity"] as const,
  monthlyHarvestComparison: (
    plantationId: string,
    params?: { startDate?: string; endDate?: string }
  ) =>
    [
      ...plantationDashboardKeys.all(plantationId),
      "monthly-harvest-comparison",
      params,
    ] as const,
  environmentalZones: (plantationId: string, params?: { period?: string }) =>
    [
      ...plantationDashboardKeys.all(plantationId),
      "environmental-zones",
      params,
    ] as const,
};

/**
 * Hook to get basic plantation summary
 */
export function usePlantationBasicSummary(plantationId: string) {
  const { accessToken, isInitialLoading } = useAuth();

  return useQuery<PlantationBasicSummaryResponse>({
    queryKey: plantationDashboardKeys.basicSummary(plantationId),
    queryFn: () =>
      PlantationDashboardService.getBasicSummary(plantationId, accessToken),
    enabled: !isInitialLoading && !!plantationId,
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

/**
 * Hook to get plantation harvest summary
 */
export function usePlantationHarvestSummary(
  plantationId: string,
  params?: { startDate?: string; endDate?: string }
) {
  const { accessToken, isInitialLoading } = useAuth();

  return useQuery<PlantationHarvestSummaryResponse>({
    queryKey: plantationDashboardKeys.harvestSummary(plantationId, params),
    queryFn: () =>
      PlantationDashboardService.getHarvestSummary(
        plantationId,
        params,
        accessToken
      ),
    enabled: !isInitialLoading && !!plantationId,
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

/**
 * Hook to get plantation trees summary
 */
export function usePlantationTreesSummary(plantationId: string) {
  const { accessToken, isInitialLoading } = useAuth();

  return useQuery<PlantationTreesSummaryResponse>({
    queryKey: plantationDashboardKeys.treesSummary(plantationId),
    queryFn: () =>
      PlantationDashboardService.getTreesSummary(plantationId, accessToken),
    enabled: !isInitialLoading && !!plantationId,
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

/**
 * Hook to get plantation environmental timeseries
 */
export function usePlantationEnvironmentalTimeseries(
  plantationId: string,
  params?: { startDate?: string; endDate?: string; interval?: string }
) {
  const { accessToken, isInitialLoading } = useAuth();

  return useQuery<PlantationEnvironmentalTimeseriesResponse>({
    queryKey: plantationDashboardKeys.environmentalTimeseries(
      plantationId,
      params
    ),
    queryFn: () =>
      PlantationDashboardService.getEnvironmentalTimeseries(
        plantationId,
        params,
        accessToken
      ),
    enabled: !isInitialLoading && !!plantationId,
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

/**
 * Hook to get plantation harvest timeseries
 */
export function usePlantationHarvestTimeseries(
  plantationId: string,
  params?: { startDate?: string; endDate?: string; interval?: string }
) {
  const { accessToken, isInitialLoading } = useAuth();

  return useQuery<PlantationHarvestTimeseriesResponse>({
    queryKey: plantationDashboardKeys.harvestTimeseries(plantationId, params),
    queryFn: () =>
      PlantationDashboardService.getHarvestTimeseries(
        plantationId,
        params,
        accessToken
      ),
    enabled: !isInitialLoading && !!plantationId,
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

/**
 * Hook to get plantation tree growth timeseries
 */
export function usePlantationTreeGrowthTimeseries(
  plantationId: string,
  params?: { startDate?: string; endDate?: string; interval?: string }
) {
  const { accessToken, isInitialLoading } = useAuth();

  return useQuery<PlantationTreeGrowthTimeseriesResponse>({
    queryKey: plantationDashboardKeys.treeGrowthTimeseries(
      plantationId,
      params
    ),
    queryFn: () =>
      PlantationDashboardService.getTreeGrowthTimeseries(
        plantationId,
        params,
        accessToken
      ),
    enabled: !isInitialLoading && !!plantationId,
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

/**
 * Hook to get tree age distribution histogram
 */
export function usePlantationTreeAgeDistribution(
  plantationId: string,
  params?: { binCount?: number }
) {
  const { accessToken, isInitialLoading } = useAuth();

  return useQuery<TreeAgeDistributionHistogramResponse>({
    queryKey: plantationDashboardKeys.treeAgeDistribution(plantationId, params),
    queryFn: () =>
      PlantationDashboardService.getTreeAgeDistribution(
        plantationId,
        params,
        accessToken
      ),
    enabled: !isInitialLoading && !!plantationId,
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

/**
 * Hook to get plantation tree activity chart
 */
export function usePlantationTreeActivity(plantationId: string) {
  const { accessToken, isInitialLoading } = useAuth();

  return useQuery<PlantationTreeActivityResponse>({
    queryKey: plantationDashboardKeys.treeActivity(plantationId),
    queryFn: () =>
      PlantationDashboardService.getTreeActivityChart(
        plantationId,
        accessToken
      ),
    enabled: !isInitialLoading && !!plantationId,
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

/**
 * Hook to get monthly harvest comparison
 */
export function usePlantationMonthlyHarvestComparison(
  plantationId: string,
  params?: { startDate?: string; endDate?: string }
) {
  const { accessToken, isInitialLoading } = useAuth();

  return useQuery<MonthlyHarvestComparisonResponse>({
    queryKey: plantationDashboardKeys.monthlyHarvestComparison(
      plantationId,
      params
    ),
    queryFn: () =>
      PlantationDashboardService.getMonthlyHarvestComparison(
        plantationId,
        params,
        accessToken
      ),
    enabled: !isInitialLoading && !!plantationId,
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

/**
 * Hook to get environmental zones chart
 */
export function usePlantationEnvironmentalZones(
  plantationId: string,
  params?: { period?: string }
) {
  const { accessToken, isInitialLoading } = useAuth();

  return useQuery<EnvironmentalZonesResponse>({
    queryKey: plantationDashboardKeys.environmentalZones(plantationId, params),
    queryFn: () =>
      PlantationDashboardService.getEnvironmentalZones(
        plantationId,
        params,
        accessToken
      ),
    enabled: !isInitialLoading && !!plantationId,
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
  });
}
