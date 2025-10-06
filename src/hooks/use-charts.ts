import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { GlobalChartService } from "@/services/global-chart-service";
import type {
  HarvestDistributionResponse,
  PlantationDistributionResponse,
  PlantationLandDistributionResponse,
  TreeActivityStatusResponse,
  DashboardDateRangeParams,
} from "@/types/dashboard";

export const chartKeys = {
  all: () => ["global-chart"] as const,
  harvestByPlantation: (params?: DashboardDateRangeParams) =>
    [...chartKeys.all(), "harvest-by-plantation", params] as const,
  plantationsByLandArea: () =>
    [...chartKeys.all(), "plantations-by-land-area"] as const,
  plantationsByTrees: () =>
    [...chartKeys.all(), "plantations-by-trees"] as const,
  treeActivityStatus: () =>
    [...chartKeys.all(), "tree-activity-status"] as const,
};

export function useHarvestByPlantation(params?: DashboardDateRangeParams) {
  const { accessToken, isInitialLoading } = useAuth();

  return useQuery<HarvestDistributionResponse>({
    queryKey: chartKeys.harvestByPlantation(params),
    queryFn: () =>
      GlobalChartService.getHarvestByPlantation(accessToken, params),
    enabled: !isInitialLoading,
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

export function usePlantationsByLandArea() {
  const { accessToken, isInitialLoading } = useAuth();

  return useQuery<PlantationLandDistributionResponse>({
    queryKey: chartKeys.plantationsByLandArea(),
    queryFn: () => GlobalChartService.getPlantationsByLandArea(accessToken),
    enabled: !isInitialLoading,
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

export function usePlantationsByTrees() {
  const { accessToken, isInitialLoading } = useAuth();

  return useQuery<PlantationDistributionResponse>({
    queryKey: chartKeys.plantationsByTrees(),
    queryFn: () => GlobalChartService.getPlantationsByTrees(accessToken),
    enabled: !isInitialLoading,
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

export function useTreeActivityStatus() {
  const { accessToken, isInitialLoading } = useAuth();

  return useQuery<TreeActivityStatusResponse>({
    queryKey: chartKeys.treeActivityStatus(),
    queryFn: () => GlobalChartService.getTreeActivityStatus(accessToken),
    enabled: !isInitialLoading,
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
  });
}
