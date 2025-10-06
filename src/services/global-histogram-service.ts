import { apiClient } from "@/lib/api-client";
import type {
  AvgHarvestSizeDistributionHistogramResponse,
  HarvestFrequencyDistributionHistogramResponse,
  PlantationSizeDistributionHistogramResponse,
  TreeDensityDistributionHistogramResponse,
  YieldDistributionHistogramResponse,
  DashboardHistogramParams,
  DashboardBinCountParams,
} from "@/types/dashboard";

export class GlobalHistogramService {
  static async getAvgHarvestSizeDistribution(
    accessToken?: string,
    params?: DashboardHistogramParams
  ): Promise<AvgHarvestSizeDistributionHistogramResponse> {
    return (
      await apiClient.get<AvgHarvestSizeDistributionHistogramResponse>(
        "/dashboard/histogram/avg-harvest-size-distribution",
        params,
        accessToken
      )
    ).data;
  }

  static async getHarvestFrequencyDistribution(
    accessToken?: string,
    params?: DashboardHistogramParams
  ): Promise<HarvestFrequencyDistributionHistogramResponse> {
    return (
      await apiClient.get<HarvestFrequencyDistributionHistogramResponse>(
        "/dashboard/histogram/harvest-frequency-distribution",
        params,
        accessToken
      )
    ).data;
  }

  static async getPlantationSizeDistribution(
    accessToken?: string,
    params?: DashboardBinCountParams
  ): Promise<PlantationSizeDistributionHistogramResponse> {
    return (
      await apiClient.get<PlantationSizeDistributionHistogramResponse>(
        "/dashboard/histogram/plantation-size-distribution",
        params,
        accessToken
      )
    ).data;
  }

  static async getTreeDensityDistribution(
    accessToken?: string,
    params?: DashboardBinCountParams
  ): Promise<TreeDensityDistributionHistogramResponse> {
    return (
      await apiClient.get<TreeDensityDistributionHistogramResponse>(
        "/dashboard/histogram/tree-density-distribution",
        params,
        accessToken
      )
    ).data;
  }

  static async getYieldDistribution(
    accessToken?: string,
    params?: DashboardHistogramParams
  ): Promise<YieldDistributionHistogramResponse> {
    return (
      await apiClient.get<YieldDistributionHistogramResponse>(
        "/dashboard/histogram/yield-distribution",
        params,
        accessToken
      )
    ).data;
  }
}
