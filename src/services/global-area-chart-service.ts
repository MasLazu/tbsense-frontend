import { apiClient } from "@/lib/api-client";
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

export class GlobalAreaChartService {
  static async getCumulativeActiveTrees(
    accessToken?: string,
    params?: DashboardDateRangeWithIntervalParams
  ): Promise<CumulativeActiveTreesResponse> {
    return (
      await apiClient.get<CumulativeActiveTreesResponse>(
        "/dashboard/area-chart/cumulative-active-trees",
        params,
        accessToken
      )
    ).data;
  }

  static async getCumulativeHarvestCount(
    accessToken?: string,
    params?: DashboardDateRangeWithIntervalParams
  ): Promise<CumulativeHarvestCountResponse> {
    return (
      await apiClient.get<CumulativeHarvestCountResponse>(
        "/dashboard/area-chart/cumulative-harvest-count",
        params,
        accessToken
      )
    ).data;
  }

  static async getCumulativeYield(
    accessToken?: string,
    params?: DashboardDateRangeWithIntervalParams
  ): Promise<CumulativeYieldResponse> {
    return (
      await apiClient.get<CumulativeYieldResponse>(
        "/dashboard/area-chart/cumulative-yield",
        params,
        accessToken
      )
    ).data;
  }

  static async getPlantationGrowth(
    accessToken?: string,
    params?: DashboardDateRangeWithIntervalParams
  ): Promise<PlantationGrowthResponse> {
    return (
      await apiClient.get<PlantationGrowthResponse>(
        "/dashboard/area-chart/plantation-growth",
        params,
        accessToken
      )
    ).data;
  }

  static async getStackedYieldByPlantation(
    accessToken?: string,
    params?: DashboardLimitedDateRangeParams
  ): Promise<StackedYieldByPlantationResponse> {
    return (
      await apiClient.get<StackedYieldByPlantationResponse>(
        "/dashboard/area-chart/stacked-yield-by-plantation",
        params,
        accessToken
      )
    ).data;
  }

  static async getTreePopulationGrowth(
    accessToken?: string,
    params?: DashboardDateRangeWithIntervalParams
  ): Promise<TreePopulationGrowthResponse> {
    return (
      await apiClient.get<TreePopulationGrowthResponse>(
        "/dashboard/area-chart/tree-population-growth",
        params,
        accessToken
      )
    ).data;
  }
}
