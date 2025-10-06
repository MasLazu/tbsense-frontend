import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import {
  GlobalBarChartService,
  type PlantationAvgHarvestComparisonResponse,
  type TopPlantationsByAvgHarvestParams,
} from "@/services/global-bar-chart-service";

export const topPlantationsBarChartKeys = {
  all: () => ["global-bar-chart"] as const,
  topByAvgHarvest: (params?: TopPlantationsByAvgHarvestParams) =>
    [
      ...topPlantationsBarChartKeys.all(),
      "top-plantations-by-avg-harvest",
      params,
    ] as const,
};

export function useTopPlantationsByAvgHarvest(
  params?: TopPlantationsByAvgHarvestParams
) {
  const { accessToken, isInitialLoading } = useAuth();

  return useQuery<PlantationAvgHarvestComparisonResponse>({
    queryKey: topPlantationsBarChartKeys.topByAvgHarvest(params),
    queryFn: () =>
      GlobalBarChartService.getTopPlantationsByAvgHarvest(accessToken, params),
    enabled: !isInitialLoading,
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
  });
}
