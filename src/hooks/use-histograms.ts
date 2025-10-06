import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { GlobalHistogramService } from "@/services/global-histogram-service";
import type {
  AvgHarvestSizeDistributionHistogramResponse,
  HarvestFrequencyDistributionHistogramResponse,
  PlantationSizeDistributionHistogramResponse,
  TreeDensityDistributionHistogramResponse,
  YieldDistributionHistogramResponse,
  DashboardHistogramParams,
  DashboardBinCountParams,
} from "@/types/dashboard";

export const histogramKeys = {
  all: () => ["global-histogram"] as const,
  avgHarvestSize: (params?: DashboardHistogramParams) =>
    [...histogramKeys.all(), "avg-harvest-size", params] as const,
  harvestFrequency: (params?: DashboardHistogramParams) =>
    [...histogramKeys.all(), "harvest-frequency", params] as const,
  plantationSize: (params?: DashboardBinCountParams) =>
    [...histogramKeys.all(), "plantation-size", params] as const,
  treeDensity: (params?: DashboardBinCountParams) =>
    [...histogramKeys.all(), "tree-density", params] as const,
  yieldDistribution: (params?: DashboardHistogramParams) =>
    [...histogramKeys.all(), "yield-distribution", params] as const,
};

export function useAvgHarvestSizeDistribution(
  params?: DashboardHistogramParams
) {
  const { accessToken, isInitialLoading } = useAuth();

  return useQuery<AvgHarvestSizeDistributionHistogramResponse>({
    queryKey: histogramKeys.avgHarvestSize(params),
    queryFn: () =>
      GlobalHistogramService.getAvgHarvestSizeDistribution(accessToken, params),
    enabled: !isInitialLoading,
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

export function useHarvestFrequencyDistribution(
  params?: DashboardHistogramParams
) {
  const { accessToken, isInitialLoading } = useAuth();

  return useQuery<HarvestFrequencyDistributionHistogramResponse>({
    queryKey: histogramKeys.harvestFrequency(params),
    queryFn: () =>
      GlobalHistogramService.getHarvestFrequencyDistribution(
        accessToken,
        params
      ),
    enabled: !isInitialLoading,
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

export function usePlantationSizeDistribution(
  params?: DashboardBinCountParams
) {
  const { accessToken, isInitialLoading } = useAuth();

  return useQuery<PlantationSizeDistributionHistogramResponse>({
    queryKey: histogramKeys.plantationSize(params),
    queryFn: () =>
      GlobalHistogramService.getPlantationSizeDistribution(accessToken, params),
    enabled: !isInitialLoading,
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

export function useTreeDensityDistribution(params?: DashboardBinCountParams) {
  const { accessToken, isInitialLoading } = useAuth();

  return useQuery<TreeDensityDistributionHistogramResponse>({
    queryKey: histogramKeys.treeDensity(params),
    queryFn: () =>
      GlobalHistogramService.getTreeDensityDistribution(accessToken, params),
    enabled: !isInitialLoading,
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

export function useYieldDistribution(params?: DashboardHistogramParams) {
  const { accessToken, isInitialLoading } = useAuth();

  return useQuery<YieldDistributionHistogramResponse>({
    queryKey: histogramKeys.yieldDistribution(params),
    queryFn: () =>
      GlobalHistogramService.getYieldDistribution(accessToken, params),
    enabled: !isInitialLoading,
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
  });
}
