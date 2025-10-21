import { useQuery } from '@tanstack/react-query';
import { useAuth } from './use-auth';
import {
  TreeDashboardService,
  type TreeBasicSummaryResponse,
  type TreeCurrentMetricsResponse,
  type TreeEnvironmentalAveragesResponse,
  type TreeEnvironmentalTimeseriesResponse,
  type AirTemperatureDistributionHistogramResponse,
  type SoilMoistureDistributionHistogramResponse,
  type SoilTemperatureDistributionHistogramResponse,
  type MetricRangesResponse,
  type ReadingDistributionResponse,
  type DailyMetricsComparisonResponse,
  type HourlyAverageComparisonResponse,
  type MetricRangeComparisonResponse,
  type WeeklyMetricsComparisonResponse,
} from '../services/tree-dashboard-service';

// Query keys factory
export const treeDashboardKeys = {
  all: (treeId: string) => ['tree-dashboard', treeId] as const,
  basicSummary: (treeId: string) => [...treeDashboardKeys.all(treeId), 'basic-summary'] as const,
  currentMetrics: (treeId: string) =>
    [...treeDashboardKeys.all(treeId), 'current-metrics'] as const,
  environmentalAverages: (treeId: string, params?: { startDate?: string; endDate?: string }) =>
    [...treeDashboardKeys.all(treeId), 'environmental-averages', params] as const,
  environmentalTimeseries: (
    treeId: string,
    params?: { startDate?: string; endDate?: string; interval?: string }
  ) => [...treeDashboardKeys.all(treeId), 'environmental-timeseries', params] as const,
  airTemperatureDistribution: (
    treeId: string,
    params?: { startDate?: string; endDate?: string; binCount?: number }
  ) => [...treeDashboardKeys.all(treeId), 'air-temperature-distribution', params] as const,
  soilMoistureDistribution: (
    treeId: string,
    params?: { startDate?: string; endDate?: string; binCount?: number }
  ) => [...treeDashboardKeys.all(treeId), 'soil-moisture-distribution', params] as const,
  soilTemperatureDistribution: (
    treeId: string,
    params?: { startDate?: string; endDate?: string; binCount?: number }
  ) => [...treeDashboardKeys.all(treeId), 'soil-temperature-distribution', params] as const,
  metricRanges: (treeId: string, params?: { startDate?: string; endDate?: string }) =>
    [...treeDashboardKeys.all(treeId), 'metric-ranges', params] as const,
  readingDistribution: (treeId: string, params?: { startDate?: string; endDate?: string }) =>
    [...treeDashboardKeys.all(treeId), 'reading-distribution', params] as const,
  dailyMetricsComparison: (treeId: string, params?: { startDate?: string; endDate?: string }) =>
    [...treeDashboardKeys.all(treeId), 'daily-metrics-comparison', params] as const,
  hourlyAverageComparison: (treeId: string, params?: { startDate?: string; endDate?: string }) =>
    [...treeDashboardKeys.all(treeId), 'hourly-average-comparison', params] as const,
  metricRangeComparison: (treeId: string, params?: { startDate?: string; endDate?: string }) =>
    [...treeDashboardKeys.all(treeId), 'metric-range-comparison', params] as const,
  weeklyMetricsComparison: (treeId: string, params?: { startDate?: string; endDate?: string }) =>
    [...treeDashboardKeys.all(treeId), 'weekly-metrics-comparison', params] as const,
};

/**
 * Hook to get basic tree summary
 */
export function useTreeBasicSummary(treeId: string) {
  const { accessToken, isInitialLoading } = useAuth();

  return useQuery<TreeBasicSummaryResponse>({
    queryKey: treeDashboardKeys.basicSummary(treeId),
    queryFn: () => TreeDashboardService.getBasicSummary(treeId, accessToken),
    enabled: !isInitialLoading && !!treeId,
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

/**
 * Hook to get tree current metrics
 */
export function useTreeCurrentMetrics(treeId: string) {
  const { accessToken, isInitialLoading } = useAuth();

  return useQuery<TreeCurrentMetricsResponse>({
    queryKey: treeDashboardKeys.currentMetrics(treeId),
    queryFn: () => TreeDashboardService.getCurrentMetrics(treeId, accessToken),
    enabled: !isInitialLoading && !!treeId,
    staleTime: 30 * 1000, // 30 seconds for current metrics
    refetchOnWindowFocus: true,
  });
}

/**
 * Hook to get tree environmental averages
 */
export function useTreeEnvironmentalAverages(
  treeId: string,
  params?: { startDate?: string; endDate?: string }
) {
  const { accessToken, isInitialLoading } = useAuth();

  return useQuery<TreeEnvironmentalAveragesResponse>({
    queryKey: treeDashboardKeys.environmentalAverages(treeId, params),
    queryFn: () => TreeDashboardService.getEnvironmentalAverages(treeId, params, accessToken),
    enabled: !isInitialLoading && !!treeId,
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

/**
 * Hook to get tree environmental timeseries
 */
export function useTreeEnvironmentalTimeseries(
  treeId: string,
  params?: { startDate?: string; endDate?: string; interval?: string }
) {
  const { accessToken, isInitialLoading } = useAuth();

  return useQuery<TreeEnvironmentalTimeseriesResponse>({
    queryKey: treeDashboardKeys.environmentalTimeseries(treeId, params),
    queryFn: () => TreeDashboardService.getEnvironmentalTimeseries(treeId, params, accessToken),
    enabled: !isInitialLoading && !!treeId,
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

/**
 * Hook to get air temperature distribution
 */
export function useTreeAirTemperatureDistribution(
  treeId: string,
  params?: { startDate?: string; endDate?: string; binCount?: number }
) {
  const { accessToken, isInitialLoading } = useAuth();

  return useQuery<AirTemperatureDistributionHistogramResponse>({
    queryKey: treeDashboardKeys.airTemperatureDistribution(treeId, params),
    queryFn: () => TreeDashboardService.getAirTemperatureDistribution(treeId, params, accessToken),
    enabled: !isInitialLoading && !!treeId,
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

/**
 * Hook to get soil moisture distribution
 */
export function useTreeSoilMoistureDistribution(
  treeId: string,
  params?: { startDate?: string; endDate?: string; binCount?: number }
) {
  const { accessToken, isInitialLoading } = useAuth();

  return useQuery<SoilMoistureDistributionHistogramResponse>({
    queryKey: treeDashboardKeys.soilMoistureDistribution(treeId, params),
    queryFn: () => TreeDashboardService.getSoilMoistureDistribution(treeId, params, accessToken),
    enabled: !isInitialLoading && !!treeId,
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

/**
 * Hook to get soil temperature distribution
 */
export function useTreeSoilTemperatureDistribution(
  treeId: string,
  params?: { startDate?: string; endDate?: string; binCount?: number }
) {
  const { accessToken, isInitialLoading } = useAuth();

  return useQuery<SoilTemperatureDistributionHistogramResponse>({
    queryKey: treeDashboardKeys.soilTemperatureDistribution(treeId, params),
    queryFn: () => TreeDashboardService.getSoilTemperatureDistribution(treeId, params, accessToken),
    enabled: !isInitialLoading && !!treeId,
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

/**
 * Hook to get metric ranges
 */
export function useTreeMetricRanges(
  treeId: string,
  params?: { startDate?: string; endDate?: string }
) {
  const { accessToken, isInitialLoading } = useAuth();

  return useQuery<MetricRangesResponse>({
    queryKey: treeDashboardKeys.metricRanges(treeId, params),
    queryFn: () => TreeDashboardService.getMetricRanges(treeId, params, accessToken),
    enabled: !isInitialLoading && !!treeId,
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

/**
 * Hook to get reading distribution
 */
export function useTreeReadingDistribution(
  treeId: string,
  params?: { startDate?: string; endDate?: string }
) {
  const { accessToken, isInitialLoading } = useAuth();

  return useQuery<ReadingDistributionResponse>({
    queryKey: treeDashboardKeys.readingDistribution(treeId, params),
    queryFn: () => TreeDashboardService.getReadingDistribution(treeId, params, accessToken),
    enabled: !isInitialLoading && !!treeId,
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

/**
 * Hook to get daily metrics comparison
 */
export function useTreeDailyMetricsComparison(
  treeId: string,
  params?: { startDate?: string; endDate?: string }
) {
  const { accessToken, isInitialLoading } = useAuth();

  return useQuery<DailyMetricsComparisonResponse>({
    queryKey: treeDashboardKeys.dailyMetricsComparison(treeId, params),
    queryFn: () => TreeDashboardService.getDailyMetricsComparison(treeId, params, accessToken),
    enabled: !isInitialLoading && !!treeId,
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

/**
 * Hook to get hourly average comparison
 */
export function useTreeHourlyAverageComparison(
  treeId: string,
  params?: { startDate?: string; endDate?: string }
) {
  const { accessToken, isInitialLoading } = useAuth();

  return useQuery<HourlyAverageComparisonResponse>({
    queryKey: treeDashboardKeys.hourlyAverageComparison(treeId, params),
    queryFn: () => TreeDashboardService.getHourlyAverageComparison(treeId, params, accessToken),
    enabled: !isInitialLoading && !!treeId,
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

/**
 * Hook to get metric range comparison
 */
export function useTreeMetricRangeComparison(
  treeId: string,
  params?: { startDate?: string; endDate?: string }
) {
  const { accessToken, isInitialLoading } = useAuth();

  return useQuery<MetricRangeComparisonResponse>({
    queryKey: treeDashboardKeys.metricRangeComparison(treeId, params),
    queryFn: () => TreeDashboardService.getMetricRangeComparison(treeId, params, accessToken),
    enabled: !isInitialLoading && !!treeId,
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

/**
 * Hook to get weekly metrics comparison
 */
export function useTreeWeeklyMetricsComparison(
  treeId: string,
  params?: { startDate?: string; endDate?: string }
) {
  const { accessToken, isInitialLoading } = useAuth();

  return useQuery<WeeklyMetricsComparisonResponse>({
    queryKey: treeDashboardKeys.weeklyMetricsComparison(treeId, params),
    queryFn: () => TreeDashboardService.getWeeklyMetricsComparison(treeId, params, accessToken),
    enabled: !isInitialLoading && !!treeId,
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
  });
}
