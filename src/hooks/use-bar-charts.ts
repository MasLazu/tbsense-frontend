import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import {
  GlobalBarChartService,
  type PlantationAvgHarvestComparisonResponse,
  type PlantationYieldComparisonResponse,
  type PlantationTreeCountComparisonResponse,
  type PlantationActivityComparisonResponse,
  type PlantationHarvestFrequencyResponse,
  type TopPlantationsByAvgHarvestParams,
  type BarChartDateRangeParams,
  type BarChartLimitParams,
} from "@/services/global-bar-chart-service";

export const barChartKeys = {
  all: () => ["global-bar-chart"] as const,
  topByAvgHarvest: (params?: TopPlantationsByAvgHarvestParams) =>
    [...barChartKeys.all(), "top-plantations-by-avg-harvest", params] as const,
  topByYield: (params?: BarChartDateRangeParams & BarChartLimitParams) =>
    [...barChartKeys.all(), "top-plantations-by-yield", params] as const,
  treeCountByPlantation: (params?: BarChartLimitParams) =>
    [...barChartKeys.all(), "tree-count-by-plantation", params] as const,
  treeActivityByPlantation: () =>
    [...barChartKeys.all(), "tree-activity-by-plantation"] as const,
  harvestFrequencyByPlantation: (params?: BarChartDateRangeParams) =>
    [...barChartKeys.all(), "harvest-frequency-by-plantation", params] as const,
};

export function useTopPlantationsByAvgHarvest(
  params?: TopPlantationsByAvgHarvestParams
) {
  const { accessToken, isInitialLoading } = useAuth();

  return useQuery<PlantationAvgHarvestComparisonResponse>({
    queryKey: barChartKeys.topByAvgHarvest(params),
    queryFn: () =>
      GlobalBarChartService.getTopPlantationsByAvgHarvest(accessToken, params),
    enabled: !isInitialLoading,
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

export function useTopPlantationsByYield(
  params?: BarChartDateRangeParams & BarChartLimitParams
) {
  const { accessToken, isInitialLoading } = useAuth();

  return useQuery<PlantationYieldComparisonResponse>({
    queryKey: barChartKeys.topByYield(params),
    queryFn: () =>
      GlobalBarChartService.getTopPlantationsByYield(accessToken, params),
    enabled: !isInitialLoading,
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

export function useTreeCountByPlantation(params?: BarChartLimitParams) {
  const { accessToken, isInitialLoading } = useAuth();

  return useQuery<PlantationTreeCountComparisonResponse>({
    queryKey: barChartKeys.treeCountByPlantation(params),
    queryFn: () =>
      GlobalBarChartService.getTreeCountByPlantation(accessToken, params),
    enabled: !isInitialLoading,
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

export function useTreeActivityByPlantation() {
  const { accessToken, isInitialLoading } = useAuth();

  return useQuery<PlantationActivityComparisonResponse>({
    queryKey: barChartKeys.treeActivityByPlantation(),
    queryFn: () =>
      GlobalBarChartService.getTreeActivityByPlantation(accessToken),
    enabled: !isInitialLoading,
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

export function useHarvestFrequencyByPlantation(
  params?: BarChartDateRangeParams
) {
  const { accessToken, isInitialLoading } = useAuth();

  return useQuery<PlantationHarvestFrequencyResponse>({
    queryKey: barChartKeys.harvestFrequencyByPlantation(params),
    queryFn: () =>
      GlobalBarChartService.getHarvestFrequencyByPlantation(
        accessToken,
        params
      ),
    enabled: !isInitialLoading,
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
  });
}
