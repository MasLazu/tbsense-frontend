import { apiClient } from "../lib/api-client";

export interface LandAreaSummaryResponse {
  totalHectares: number;
  utilized: number;
  utilizationRate: number;
}

export interface PlantationsSummaryResponse {
  total: number;
  active: number;
}

export interface TreesSummaryResponse {
  total: number;
  averagePerHectare: number;
}

export interface HarvestSummaryResponse {
  totalYieldKg: number;
  averageYieldPerHectare: number;
  harvestCount: number;
}

export class GlobalSummaryService {
  static async getLandAreaSummary(
    accessToken?: string,
    params?: { startDate?: string; endDate?: string }
  ): Promise<LandAreaSummaryResponse> {
    return (
      await apiClient.get<LandAreaSummaryResponse>(
        "/dashboard/summary/land-area",
        params,
        accessToken ?? undefined
      )
    ).data;
  }

  static async getPlantationsSummary(
    accessToken?: string,
    params?: { startDate?: string; endDate?: string }
  ): Promise<PlantationsSummaryResponse> {
    return (
      await apiClient.get<PlantationsSummaryResponse>(
        "/dashboard/summary/plantations",
        params,
        accessToken ?? undefined
      )
    ).data;
  }

  static async getTreesSummary(
    accessToken?: string,
    params?: { startDate?: string; endDate?: string }
  ): Promise<TreesSummaryResponse> {
    return (
      await apiClient.get<TreesSummaryResponse>(
        "/dashboard/summary/trees",
        params,
        accessToken ?? undefined
      )
    ).data;
  }

  static async getHarvestSummary(
    accessToken?: string,
    params?: { startDate?: string; endDate?: string }
  ): Promise<HarvestSummaryResponse> {
    return (
      await apiClient.get<HarvestSummaryResponse>(
        "/dashboard/harvest",
        params,
        accessToken ?? undefined
      )
    ).data;
  }
}
