import { useQuery } from "@tanstack/react-query";
import { useAuth } from "./use-auth";
import { GlobalTimeseriesService } from "../services/global-timeseries-service";
import type {
  HarvestTimeseriesResponse,
  EnvironmentalTimeseriesResponse,
  PlantationGrowthTimeseriesResponse,
} from "../services/global-timeseries-service";

export type TimeseriesParams = {
  startDate?: string;
  endDate?: string;
  interval?: string;
};

export const timeseriesKeys = {
  all: () => ["global-timeseries"] as const,
  harvest: (params?: TimeseriesParams) =>
    [...timeseriesKeys.all(), "harvest", params] as const,
  environmental: (params?: TimeseriesParams) =>
    [...timeseriesKeys.all(), "environmental", params] as const,
  plantationGrowth: (params?: TimeseriesParams) =>
    [...timeseriesKeys.all(), "plantation-growth", params] as const,
};

export function useHarvestTimeseries(params?: TimeseriesParams) {
  const { accessToken, isInitialLoading } = useAuth();

  return useQuery<HarvestTimeseriesResponse>({
    queryKey: timeseriesKeys.harvest(params),
    queryFn: () =>
      GlobalTimeseriesService.getHarvestTimeseries(accessToken, params),
    enabled: !isInitialLoading,
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

export function useEnvironmentalTimeseries(params?: TimeseriesParams) {
  const { accessToken, isInitialLoading } = useAuth();

  return useQuery<EnvironmentalTimeseriesResponse>({
    queryKey: timeseriesKeys.environmental(params),
    queryFn: () =>
      GlobalTimeseriesService.getEnvironmentalTimeseries(accessToken, params),
    enabled: !isInitialLoading,
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

export function usePlantationGrowthTimeseries(params?: TimeseriesParams) {
  const { accessToken, isInitialLoading } = useAuth();

  return useQuery<PlantationGrowthTimeseriesResponse>({
    queryKey: timeseriesKeys.plantationGrowth(params),
    queryFn: () =>
      GlobalTimeseriesService.getPlantationGrowthTimeseries(accessToken, params),
    enabled: !isInitialLoading,
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
  });
}
