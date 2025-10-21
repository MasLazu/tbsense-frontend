import { apiClient } from '../lib/api-client';

// Summary interfaces
export interface TreeBasicSummaryResponse {
  treeId: string;
  plantationId: string;
  longitude: number;
  latitude: number;
  plantedDate: string;
  age: number;
  status: string;
}

export interface TreeCurrentMetricsResponse {
  airTemperature: number;
  soilTemperature: number;
  soilMoisture: number;
  lastReadingTime: string;
}

export interface TreeEnvironmentalAveragesResponse {
  averageAirTemperature: number;
  averageSoilTemperature: number;
  averageSoilMoisture: number;
  readingCount: number;
  startDate: string;
  endDate: string;
}

// Timeseries interfaces
export interface TreeEnvironmentalTimeseriesDataPoint {
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

export interface TreeEnvironmentalTimeseriesResponse {
  dataPoints: TreeEnvironmentalTimeseriesDataPoint[];
}

// Histogram interfaces
export interface HistogramBin {
  rangeStart: number;
  rangeEnd: number;
  count: number;
  percentage: number;
}

export interface AirTemperatureDistributionHistogramResponse {
  bins: HistogramBin[];
  totalReadings: number;
  averageTemperature: number;
}

export interface SoilMoistureDistributionHistogramResponse {
  bins: HistogramBin[];
  totalReadings: number;
  averageMoisture: number;
}

export interface SoilTemperatureDistributionHistogramResponse {
  bins: HistogramBin[];
  totalReadings: number;
  averageTemperature: number;
}

// Chart interfaces
export interface MetricRange {
  metric: string;
  minValue: number;
  maxValue: number;
  averageValue: number;
  unit: string;
}

export interface MetricRangesResponse {
  ranges: MetricRange[];
  period: string;
}

export interface ReadingDistribution {
  hour: number;
  readingCount: number;
  percentage: number;
}

export interface ReadingDistributionResponse {
  distribution: ReadingDistribution[];
  totalReadings: number;
  period: string;
}

// Bar chart interfaces
export interface DailyMetric {
  date: string;
  averageAirTemperature: number;
  averageSoilTemperature: number;
  averageSoilMoisture: number;
  readingCount: number;
}

export interface DailyMetricsComparisonResponse {
  treeId: string;
  items: DailyMetric[];
}

export interface HourlyAverage {
  hour: number;
  hourLabel: string;
  averageAirTemperature: number;
  averageSoilTemperature: number;
  averageSoilMoisture: number;
  readingCount: number;
}

export interface HourlyAverageComparisonResponse {
  treeId: string;
  items: HourlyAverage[];
}

export interface MetricRangeComparison {
  metricType: string;
  minValue: number;
  averageValue: number;
  maxValue: number;
  readingCount: number;
}

export interface MetricRangeComparisonResponse {
  treeId: string;
  items: MetricRangeComparison[];
  days: number;
}

export interface WeeklyMetric {
  year: number;
  week: number;
  weekLabel: string;
  weekStartDate: string;
  averageAirTemperature: number;
  averageSoilTemperature: number;
  averageSoilMoisture: number;
  readingCount: number;
}

export interface WeeklyMetricsComparisonResponse {
  treeId: string;
  items: WeeklyMetric[];
}

// Service class
export class TreeDashboardService {
  /**
   * Get basic tree summary
   * GET /dashboard/trees/{treeId}/basic
   */
  static async getBasicSummary(
    treeId: string,
    accessToken?: string
  ): Promise<TreeBasicSummaryResponse> {
    return (
      await apiClient.get<TreeBasicSummaryResponse>(
        `/dashboard/trees/${treeId}/basic`,
        undefined,
        accessToken ?? undefined
      )
    ).data;
  }

  /**
   * Get tree current metrics
   * GET /dashboard/trees/{treeId}/current-metrics
   */
  static async getCurrentMetrics(
    treeId: string,
    accessToken?: string
  ): Promise<TreeCurrentMetricsResponse> {
    return (
      await apiClient.get<TreeCurrentMetricsResponse>(
        `/dashboard/trees/${treeId}/current-metrics`,
        undefined,
        accessToken ?? undefined
      )
    ).data;
  }

  /**
   * Get tree environmental averages
   * GET /dashboard/trees/{treeId}/environmental-averages
   */
  static async getEnvironmentalAverages(
    treeId: string,
    params?: { startDate?: string; endDate?: string },
    accessToken?: string
  ): Promise<TreeEnvironmentalAveragesResponse> {
    return (
      await apiClient.get<TreeEnvironmentalAveragesResponse>(
        `/dashboard/trees/${treeId}/environmental-averages`,
        params,
        accessToken ?? undefined
      )
    ).data;
  }

  /**
   * Get tree environmental timeseries
   * GET /dashboard/trees/{treeId}/timeseries/environmental
   */
  static async getEnvironmentalTimeseries(
    treeId: string,
    params?: { startDate?: string; endDate?: string; interval?: string },
    accessToken?: string
  ): Promise<TreeEnvironmentalTimeseriesResponse> {
    return (
      await apiClient.get<TreeEnvironmentalTimeseriesResponse>(
        `/dashboard/trees/${treeId}/timeseries/environmental`,
        params,
        accessToken ?? undefined
      )
    ).data;
  }

  /**
   * Get air temperature distribution histogram
   * GET /dashboard/trees/{treeId}/histogram/air-temperature-distribution
   */
  static async getAirTemperatureDistribution(
    treeId: string,
    params?: { startDate?: string; endDate?: string; binCount?: number },
    accessToken?: string
  ): Promise<AirTemperatureDistributionHistogramResponse> {
    return (
      await apiClient.get<AirTemperatureDistributionHistogramResponse>(
        `/dashboard/trees/${treeId}/histogram/air-temperature-distribution`,
        params,
        accessToken ?? undefined
      )
    ).data;
  }

  /**
   * Get soil moisture distribution histogram
   * GET /dashboard/trees/{treeId}/histogram/soil-moisture-distribution
   */
  static async getSoilMoistureDistribution(
    treeId: string,
    params?: { startDate?: string; endDate?: string; binCount?: number },
    accessToken?: string
  ): Promise<SoilMoistureDistributionHistogramResponse> {
    return (
      await apiClient.get<SoilMoistureDistributionHistogramResponse>(
        `/dashboard/trees/${treeId}/histogram/soil-moisture-distribution`,
        params,
        accessToken ?? undefined
      )
    ).data;
  }

  /**
   * Get soil temperature distribution histogram
   * GET /dashboard/trees/{treeId}/histogram/soil-temperature-distribution
   */
  static async getSoilTemperatureDistribution(
    treeId: string,
    params?: { startDate?: string; endDate?: string; binCount?: number },
    accessToken?: string
  ): Promise<SoilTemperatureDistributionHistogramResponse> {
    return (
      await apiClient.get<SoilTemperatureDistributionHistogramResponse>(
        `/dashboard/trees/${treeId}/histogram/soil-temperature-distribution`,
        params,
        accessToken ?? undefined
      )
    ).data;
  }

  /**
   * Get metric ranges chart
   * GET /dashboard/trees/{treeId}/chart/metric-ranges
   */
  static async getMetricRanges(
    treeId: string,
    params?: { startDate?: string; endDate?: string },
    accessToken?: string
  ): Promise<MetricRangesResponse> {
    return (
      await apiClient.get<MetricRangesResponse>(
        `/dashboard/trees/${treeId}/chart/metric-ranges`,
        params,
        accessToken ?? undefined
      )
    ).data;
  }

  /**
   * Get reading distribution chart
   * GET /dashboard/trees/{treeId}/chart/reading-distribution
   */
  static async getReadingDistribution(
    treeId: string,
    params?: { startDate?: string; endDate?: string },
    accessToken?: string
  ): Promise<ReadingDistributionResponse> {
    return (
      await apiClient.get<ReadingDistributionResponse>(
        `/dashboard/trees/${treeId}/chart/reading-distribution`,
        params,
        accessToken ?? undefined
      )
    ).data;
  }

  /**
   * Get daily metrics comparison
   * GET /dashboard/trees/{treeId}/bar-chart/daily-metrics-comparison
   */
  static async getDailyMetricsComparison(
    treeId: string,
    params?: { startDate?: string; endDate?: string },
    accessToken?: string
  ): Promise<DailyMetricsComparisonResponse> {
    return (
      await apiClient.get<DailyMetricsComparisonResponse>(
        `/dashboard/trees/${treeId}/bar-chart/daily-metrics-comparison`,
        params,
        accessToken ?? undefined
      )
    ).data;
  }

  /**
   * Get hourly average comparison
   * GET /dashboard/trees/{treeId}/bar-chart/hourly-average-comparison
   */
  static async getHourlyAverageComparison(
    treeId: string,
    params?: { startDate?: string; endDate?: string },
    accessToken?: string
  ): Promise<HourlyAverageComparisonResponse> {
    return (
      await apiClient.get<HourlyAverageComparisonResponse>(
        `/dashboard/trees/${treeId}/bar-chart/hourly-average-comparison`,
        params,
        accessToken ?? undefined
      )
    ).data;
  }

  /**
   * Get metric range comparison
   * GET /dashboard/trees/{treeId}/bar-chart/metric-range-comparison
   */
  static async getMetricRangeComparison(
    treeId: string,
    params?: { startDate?: string; endDate?: string },
    accessToken?: string
  ): Promise<MetricRangeComparisonResponse> {
    return (
      await apiClient.get<MetricRangeComparisonResponse>(
        `/dashboard/trees/${treeId}/bar-chart/metric-range-comparison`,
        params,
        accessToken ?? undefined
      )
    ).data;
  }

  /**
   * Get weekly metrics comparison
   * GET /dashboard/trees/{treeId}/bar-chart/weekly-metrics-comparison
   */
  static async getWeeklyMetricsComparison(
    treeId: string,
    params?: { startDate?: string; endDate?: string },
    accessToken?: string
  ): Promise<WeeklyMetricsComparisonResponse> {
    return (
      await apiClient.get<WeeklyMetricsComparisonResponse>(
        `/dashboard/trees/${treeId}/bar-chart/weekly-metrics-comparison`,
        params,
        accessToken ?? undefined
      )
    ).data;
  }
}
