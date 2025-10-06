import { apiClient } from "../lib/api-client";

export interface HarvestTimeseriesPoint {
  timestamp: string;
  totalYieldKg: number;
  harvestCount: number;
  averageYieldPerHarvest: number;
}

export interface HarvestTimeseriesResponse {
  dataPoints: HarvestTimeseriesPoint[];
}

export interface EnvironmentalTimeseriesDataPoint {
  timestamp: string;
  airTemperature: number;
  minAirTemperature: number;
  maxAirTemperature: number;
  soilTemperature: number;
  minSoilTemperature: number;
  maxSoilTemperature: number;
  soilMoisture: number;
  sampleCount: number;
}

export interface EnvironmentalTimeseriesResponse {
  dataPoints: EnvironmentalTimeseriesDataPoint[];
}

export interface PlantationGrowthDataPoint {
  timestamp: string;
  totalPlantations: number;
  activePlantations: number;
  totalTrees: number;
  totalLandAreaHectares: number;
}

export interface PlantationGrowthTimeseriesResponse {
  dataPoints: PlantationGrowthDataPoint[];
}

export class GlobalTimeseriesService {
  static async getHarvestTimeseries(
    accessToken?: string,
    params?: { startDate?: string; endDate?: string; interval?: string }
  ): Promise<HarvestTimeseriesResponse> {
    return (
      await apiClient.get<HarvestTimeseriesResponse>(
        "/dashboard/timeseries/harvest",
        params,
        accessToken ?? undefined
      )
    ).data;
  }

  static async getEnvironmentalTimeseries(
    accessToken?: string,
    params?: { startDate?: string; endDate?: string; interval?: string }
  ): Promise<EnvironmentalTimeseriesResponse> {
    return (
      await apiClient.get<EnvironmentalTimeseriesResponse>(
        "/dashboard/timeseries/environmental",
        params,
        accessToken ?? undefined
      )
    ).data;
  }

  static async getPlantationGrowthTimeseries(
    accessToken?: string,
    params?: { startDate?: string; endDate?: string; interval?: string }
  ): Promise<PlantationGrowthTimeseriesResponse> {
    return (
      await apiClient.get<PlantationGrowthTimeseriesResponse>(
        "/dashboard/timeseries/plantations",
        params,
        accessToken ?? undefined
      )
    ).data;
  }
}
