import { apiClient } from "../lib/api-client";

// Summary interfaces
export interface PlantationBasicSummaryResponse {
  plantationName: string;
  landAreaHectares: number;
  plantedDate: string;
  treeCount: number;
  activeTreeCount: number;
}

export interface PlantationHarvestSummaryResponse {
  totalYieldKg: number;
  harvestCount: number;
  averageYieldPerHarvest: number;
  lastHarvestDate: string | null;
}

export interface PlantationTreesSummaryResponse {
  totalTrees: number;
  activeTrees: number;
  averageAge: number;
  recentlyPlantedCount: number;
}

// Timeseries interfaces
export interface PlantationEnvironmentalTimeseriesDataPoint {
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

export interface PlantationEnvironmentalTimeseriesResponse {
  dataPoints: PlantationEnvironmentalTimeseriesDataPoint[];
}

export interface PlantationHarvestTimeseriesDataPoint {
  timestamp: string;
  totalYieldKg: number;
  harvestCount: number;
  averageYieldPerHarvest: number;
}

export interface PlantationHarvestTimeseriesResponse {
  dataPoints: PlantationHarvestTimeseriesDataPoint[];
}

export interface PlantationTreeGrowthTimeseriesDataPoint {
  timestamp: string;
  totalTrees: number;
  activeTrees: number;
  averageTreeAge: number;
  newlyPlantedCount: number;
}

export interface PlantationTreeGrowthTimeseriesResponse {
  dataPoints: PlantationTreeGrowthTimeseriesDataPoint[];
}

// Histogram and Chart interfaces
export interface HistogramBin {
  rangeStart: number;
  rangeEnd: number;
  count: number;
  percentage: number;
}

export interface TreeAgeDistributionHistogramResponse {
  bins: HistogramBin[];
  totalTrees: number;
  averageAge: number;
}

export interface PlantationTreeActivitySegment {
  status: string;
  count: number;
  percentage: number;
}

export interface PlantationTreeActivityResponse {
  segments: PlantationTreeActivitySegment[];
  totalTrees: number;
}

export interface MonthlyHarvestData {
  month: string;
  totalYieldKg: number;
  harvestCount: number;
  averageYieldPerHarvest: number;
}

export interface MonthlyHarvestComparisonResponse {
  months: MonthlyHarvestData[];
}

export interface EnvironmentalZone {
  zoneName: string;
  treeCount: number;
  averageAirTemperature: number;
  averageSoilMoisture: number;
}

export interface EnvironmentalZonesResponse {
  plantationId: string;
  zones: EnvironmentalZone[];
  totalTrees: number;
}

// Service class
export class PlantationDashboardService {
  /**
   * Get basic plantation summary
   * GET /dashboard/plantations/{plantationId}/summary/basic
   */
  static async getBasicSummary(
    plantationId: string,
    accessToken?: string
  ): Promise<PlantationBasicSummaryResponse> {
    return (
      await apiClient.get<PlantationBasicSummaryResponse>(
        `/dashboard/plantations/${plantationId}/summary/basic`,
        undefined,
        accessToken ?? undefined
      )
    ).data;
  }

  /**
   * Get plantation harvest summary
   * GET /dashboard/plantations/{plantationId}/harvest
   */
  static async getHarvestSummary(
    plantationId: string,
    params?: { startDate?: string; endDate?: string },
    accessToken?: string
  ): Promise<PlantationHarvestSummaryResponse> {
    return (
      await apiClient.get<PlantationHarvestSummaryResponse>(
        `/dashboard/plantations/${plantationId}/harvest`,
        params,
        accessToken ?? undefined
      )
    ).data;
  }

  /**
   * Get plantation trees summary
   * GET /dashboard/plantations/{plantationId}/summary/trees
   */
  static async getTreesSummary(
    plantationId: string,
    accessToken?: string
  ): Promise<PlantationTreesSummaryResponse> {
    return (
      await apiClient.get<PlantationTreesSummaryResponse>(
        `/dashboard/plantations/${plantationId}/summary/trees`,
        undefined,
        accessToken ?? undefined
      )
    ).data;
  }

  /**
   * Get plantation environmental timeseries
   * GET /dashboard/plantations/{plantationId}/timeseries/environmental
   */
  static async getEnvironmentalTimeseries(
    plantationId: string,
    params?: { startDate?: string; endDate?: string; interval?: string },
    accessToken?: string
  ): Promise<PlantationEnvironmentalTimeseriesResponse> {
    return (
      await apiClient.get<PlantationEnvironmentalTimeseriesResponse>(
        `/dashboard/plantations/${plantationId}/timeseries/environmental`,
        params,
        accessToken ?? undefined
      )
    ).data;
  }

  /**
   * Get plantation harvest timeseries
   * GET /dashboard/plantations/{plantationId}/timeseries/harvest
   */
  static async getHarvestTimeseries(
    plantationId: string,
    params?: { startDate?: string; endDate?: string; interval?: string },
    accessToken?: string
  ): Promise<PlantationHarvestTimeseriesResponse> {
    return (
      await apiClient.get<PlantationHarvestTimeseriesResponse>(
        `/dashboard/plantations/${plantationId}/timeseries/harvest`,
        params,
        accessToken ?? undefined
      )
    ).data;
  }

  /**
   * Get plantation tree growth timeseries
   * GET /dashboard/plantations/{plantationId}/timeseries/trees
   */
  static async getTreeGrowthTimeseries(
    plantationId: string,
    params?: { startDate?: string; endDate?: string; interval?: string },
    accessToken?: string
  ): Promise<PlantationTreeGrowthTimeseriesResponse> {
    return (
      await apiClient.get<PlantationTreeGrowthTimeseriesResponse>(
        `/dashboard/plantations/${plantationId}/timeseries/trees`,
        params,
        accessToken ?? undefined
      )
    ).data;
  }

  /**
   * Get tree age distribution histogram
   * GET /dashboard/plantations/{plantationId}/histogram/tree-age-distribution
   */
  static async getTreeAgeDistribution(
    plantationId: string,
    params?: { binCount?: number },
    accessToken?: string
  ): Promise<TreeAgeDistributionHistogramResponse> {
    return (
      await apiClient.get<TreeAgeDistributionHistogramResponse>(
        `/dashboard/plantations/${plantationId}/histogram/tree-age-distribution`,
        params,
        accessToken ?? undefined
      )
    ).data;
  }

  /**
   * Get plantation tree activity chart
   * GET /dashboard/plantations/{plantationId}/chart/tree-activity
   */
  static async getTreeActivityChart(
    plantationId: string,
    accessToken?: string
  ): Promise<PlantationTreeActivityResponse> {
    return (
      await apiClient.get<PlantationTreeActivityResponse>(
        `/dashboard/plantations/${plantationId}/chart/tree-activity`,
        undefined,
        accessToken ?? undefined
      )
    ).data;
  }

  /**
   * Get monthly harvest comparison
   * GET /dashboard/plantations/{plantationId}/bar-chart/monthly-harvest-comparison
   */
  static async getMonthlyHarvestComparison(
    plantationId: string,
    params?: { startDate?: string; endDate?: string },
    accessToken?: string
  ): Promise<MonthlyHarvestComparisonResponse> {
    return (
      await apiClient.get<MonthlyHarvestComparisonResponse>(
        `/dashboard/plantations/${plantationId}/bar-chart/monthly-harvest-comparison`,
        params,
        accessToken ?? undefined
      )
    ).data;
  }

  /**
   * Get environmental zones chart
   * GET /dashboard/plantations/{plantationId}/chart/environmental-zones
   */
  static async getEnvironmentalZones(
    plantationId: string,
    params?: { period?: string },
    accessToken?: string
  ): Promise<EnvironmentalZonesResponse> {
    return (
      await apiClient.get<EnvironmentalZonesResponse>(
        `/dashboard/plantations/${plantationId}/chart/environmental-zones`,
        params,
        accessToken ?? undefined
      )
    ).data;
  }
}
