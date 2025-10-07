import { useQuery } from "@tanstack/react-query";
import { useAuth } from "./use-auth";
import { GlobalSummaryService } from "../services/global-summary-service";
import type { LandAreaSummaryResponse } from "../services/global-summary-service";
import type { PlantationsSummaryResponse } from "../services/global-summary-service";
import type { TreesSummaryResponse } from "../services/global-summary-service";
import type { HarvestSummaryResponse } from "../services/global-summary-service";

type GlobalSummaryParams = {
  startDate?: string;
  endDate?: string;
};

export const globalSummaryKeys = {
  all: () => ["global-summary"] as const,
  landArea: (params?: GlobalSummaryParams) =>
    [...globalSummaryKeys.all(), "land-area", params] as const,
  plantations: (params?: GlobalSummaryParams) =>
    [...globalSummaryKeys.all(), "plantations", params] as const,
  trees: (params?: GlobalSummaryParams) =>
    [...globalSummaryKeys.all(), "trees", params] as const,
  harvest: (params?: GlobalSummaryParams) =>
    [...globalSummaryKeys.all(), "harvest", params] as const,
};

export function useLandAreaSummary(params?: GlobalSummaryParams) {
  const { accessToken } = useAuth();

  const queryKey = globalSummaryKeys.landArea(params);
  console.log("[useLandAreaSummary] Query Key:", queryKey);
  console.log("[useLandAreaSummary] Params:", params);

  return useQuery<LandAreaSummaryResponse>({
    queryKey,
    queryFn: () => {
      console.log("[useLandAreaSummary] queryFn executing...");
      return GlobalSummaryService.getLandAreaSummary(accessToken, params);
    },
    staleTime: 5 * 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });
}

export function usePlantationsSummary(params?: GlobalSummaryParams) {
  const { accessToken, isInitialLoading } = useAuth();

  return useQuery<PlantationsSummaryResponse>({
    queryKey: globalSummaryKeys.plantations(params),
    queryFn: () =>
      GlobalSummaryService.getPlantationsSummary(accessToken, params),
    enabled: !isInitialLoading,
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

export function useTreesSummary(params?: GlobalSummaryParams) {
  const { accessToken, isInitialLoading } = useAuth();

  return useQuery<TreesSummaryResponse>({
    queryKey: globalSummaryKeys.trees(params),
    queryFn: () => GlobalSummaryService.getTreesSummary(accessToken, params),
    enabled: !isInitialLoading,
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

export function useHarvestSummary(params?: GlobalSummaryParams) {
  const { accessToken, isInitialLoading } = useAuth();

  return useQuery<HarvestSummaryResponse>({
    queryKey: globalSummaryKeys.harvest(params),
    queryFn: () => GlobalSummaryService.getHarvestSummary(accessToken, params),
    enabled: !isInitialLoading,
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
  });
}
