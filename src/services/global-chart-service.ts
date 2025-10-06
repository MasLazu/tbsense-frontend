import { apiClient } from "@/lib/api-client";
import type {
  HarvestDistributionResponse,
  PlantationDistributionResponse,
  PlantationLandDistributionResponse,
  TreeActivityStatusResponse,
  DashboardDateRangeParams,
} from "@/types/dashboard";

export class GlobalChartService {
  static async getHarvestByPlantation(
    accessToken?: string,
    params?: DashboardDateRangeParams
  ): Promise<HarvestDistributionResponse> {
    return (
      await apiClient.get<HarvestDistributionResponse>(
        "/dashboard/chart/harvest-by-plantation",
        params,
        accessToken
      )
    ).data;
  }

  static async getPlantationsByLandArea(
    accessToken?: string
  ): Promise<PlantationLandDistributionResponse> {
    return (
      await apiClient.get<PlantationLandDistributionResponse>(
        "/dashboard/chart/plantations-by-land-area",
        undefined,
        accessToken
      )
    ).data;
  }

  static async getPlantationsByTrees(
    accessToken?: string
  ): Promise<PlantationDistributionResponse> {
    return (
      await apiClient.get<PlantationDistributionResponse>(
        "/dashboard/chart/plantations-by-trees",
        undefined,
        accessToken
      )
    ).data;
  }

  static async getTreeActivityStatus(
    accessToken?: string
  ): Promise<TreeActivityStatusResponse> {
    return (
      await apiClient.get<TreeActivityStatusResponse>(
        "/dashboard/chart/tree-activity-status",
        undefined,
        accessToken
      )
    ).data;
  }
}
