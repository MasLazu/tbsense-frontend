import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { GlobalAreaChartService } from "@/services/global-area-chart-service";
import type {
  CumulativeActiveTreesResponse,
  CumulativeHarvestCountResponse,
  CumulativeYieldResponse,
  PlantationGrowthResponse,
  StackedYieldByPlantationResponse,
  TreePopulationGrowthResponse,
  DashboardDateRangeWithIntervalParams,
  DashboardLimitedDateRangeParams,
} from "@/types/dashboard";

export const areaChartKeys = {
  all: () => ["global-area-chart"] as const,
  cumulativeActiveTrees: (params?: DashboardDateRangeWithIntervalParams) =>
    [...areaChartKeys.all(), "cumulative-active-trees", params] as const,
  cumulativeHarvestCount: (params?: DashboardDateRangeWithIntervalParams) =>
    [...areaChartKeys.all(), "cumulative-harvest-count", params] as const,
  cumulativeYield: (params?: DashboardDateRangeWithIntervalParams) =>
    [...areaChartKeys.all(), "cumulative-yield", params] as const,
  plantationGrowth: (params?: DashboardDateRangeWithIntervalParams) =>
    [...areaChartKeys.all(), "plantation-growth", params] as const,
  stackedYieldByPlantation: (params?: DashboardLimitedDateRangeParams) =>
    [...areaChartKeys.all(), "stacked-yield-by-plantation", params] as const,
  treePopulationGrowth: (params?: DashboardDateRangeWithIntervalParams) =>
    [...areaChartKeys.all(), "tree-population-growth", params] as const,
};

export function useCumulativeActiveTrees(
  params?: DashboardDateRangeWithIntervalParams
) {
  const { accessToken, isInitialLoading } = useAuth();

  return useQuery<CumulativeActiveTreesResponse>({
    queryKey: areaChartKeys.cumulativeActiveTrees(params),
    queryFn: () =>
      GlobalAreaChartService.getCumulativeActiveTrees(accessToken, params),
    enabled: !isInitialLoading,
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

export function useCumulativeHarvestCount(
  params?: DashboardDateRangeWithIntervalParams
) {
  const { accessToken, isInitialLoading } = useAuth();

  return useQuery<CumulativeHarvestCountResponse>({
    queryKey: areaChartKeys.cumulativeHarvestCount(params),
    queryFn: () =>
      GlobalAreaChartService.getCumulativeHarvestCount(accessToken, params),
    enabled: !isInitialLoading,
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

export function useCumulativeYield(
  params?: DashboardDateRangeWithIntervalParams
) {
  const { accessToken, isInitialLoading } = useAuth();

  return useQuery<CumulativeYieldResponse>({
    queryKey: areaChartKeys.cumulativeYield(params),
    queryFn: () =>
      GlobalAreaChartService.getCumulativeYield(accessToken, params),
    enabled: !isInitialLoading,
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

export function usePlantationGrowth(
  params?: DashboardDateRangeWithIntervalParams
) {
  const { accessToken, isInitialLoading } = useAuth();

  return useQuery<PlantationGrowthResponse>({
    queryKey: areaChartKeys.plantationGrowth(params),
    queryFn: () =>
      GlobalAreaChartService.getPlantationGrowth(accessToken, params),
    enabled: !isInitialLoading,
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

export function useStackedYieldByPlantation(
  params?: DashboardLimitedDateRangeParams
) {
  const { accessToken, isInitialLoading } = useAuth();

  return useQuery<StackedYieldByPlantationResponse>({
    queryKey: areaChartKeys.stackedYieldByPlantation(params),
    queryFn: () =>
      GlobalAreaChartService.getStackedYieldByPlantation(accessToken, params),
    enabled: !isInitialLoading,
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

export function useTreePopulationGrowth(
  params?: DashboardDateRangeWithIntervalParams
) {
  const { accessToken, isInitialLoading } = useAuth();

  return useQuery<TreePopulationGrowthResponse>({
    queryKey: areaChartKeys.treePopulationGrowth(params),
    queryFn: () =>
      GlobalAreaChartService.getTreePopulationGrowth(accessToken, params),
    enabled: !isInitialLoading,
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
  });
}
