import { apiClient } from "@/lib/api-client";

export interface PlantationAvgHarvestComparisonItem {
  plantationId: string;
  plantationName: string;
  averageYieldKg: number;
  harvestCount: number;
}

export interface PlantationAvgHarvestComparisonResponse {
  items: PlantationAvgHarvestComparisonItem[];
  totalPlantations: number;
}

export interface TopPlantationsByAvgHarvestParams {
  startDate?: string;
  endDate?: string;
  limit?: number;
}

export interface PlantationYieldComparisonItem {
  plantationId: string;
  plantationName: string;
  totalYieldKg: number;
}

export interface PlantationYieldComparisonResponse {
  items: PlantationYieldComparisonItem[];
  totalPlantations: number;
}

export interface PlantationTreeCountComparisonItem {
  plantationId: string;
  plantationName: string;
  treeCount: number;
}

export interface PlantationTreeCountComparisonResponse {
  items: PlantationTreeCountComparisonItem[];
}

export interface PlantationActivityComparisonItem {
  plantationId: string;
  plantationName: string;
  activeCount: number;
  inactiveCount: number;
}

export interface PlantationActivityComparisonResponse {
  items: PlantationActivityComparisonItem[];
}

export interface PlantationHarvestFrequencyItem {
  plantationId: string;
  plantationName: string;
  harvestCount: number;
}

export interface PlantationHarvestFrequencyResponse {
  items: PlantationHarvestFrequencyItem[];
}

export interface BarChartDateRangeParams {
  startDate?: string;
  endDate?: string;
}

export interface BarChartLimitParams {
  limit?: number;
}

export class GlobalBarChartService {
  static async getTopPlantationsByAvgHarvest(
    accessToken?: string,
    params?: TopPlantationsByAvgHarvestParams
  ): Promise<PlantationAvgHarvestComparisonResponse> {
    const response =
      await apiClient.get<PlantationAvgHarvestComparisonResponse>(
        "/dashboard/bar-chart/top-plantations-by-avg-harvest",
        params,
        accessToken
      );

    return response.data;
  }

  static async getTopPlantationsByYield(
    accessToken?: string,
    params?: BarChartDateRangeParams & BarChartLimitParams
  ): Promise<PlantationYieldComparisonResponse> {
    const response = await apiClient.get<PlantationYieldComparisonResponse>(
      "/dashboard/bar-chart/top-plantations-by-yield",
      params,
      accessToken
    );

    return response.data;
  }

  static async getTreeCountByPlantation(
    accessToken?: string,
    params?: BarChartLimitParams
  ): Promise<PlantationTreeCountComparisonResponse> {
    const response = await apiClient.get<PlantationTreeCountComparisonResponse>(
      "/dashboard/bar-chart/tree-count-by-plantation",
      params,
      accessToken
    );

    return response.data;
  }

  static async getTreeActivityByPlantation(
    accessToken?: string
  ): Promise<PlantationActivityComparisonResponse> {
    const response = await apiClient.get<PlantationActivityComparisonResponse>(
      "/dashboard/bar-chart/tree-activity-by-plantation",
      undefined,
      accessToken
    );

    return response.data;
  }

  static async getHarvestFrequencyByPlantation(
    accessToken?: string,
    params?: BarChartDateRangeParams
  ): Promise<PlantationHarvestFrequencyResponse> {
    const response = await apiClient.get<PlantationHarvestFrequencyResponse>(
      "/dashboard/bar-chart/harvest-frequency-by-plantation",
      params,
      accessToken
    );

    return response.data;
  }
}
