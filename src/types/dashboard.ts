export interface DashboardDateRangeParams {
  startDate?: string;
  endDate?: string;
}

export interface DashboardIntervalParams {
  interval?: string;
}

export interface DashboardLimitParams {
  limit?: number;
}

export interface DashboardBinCountParams {
  binCount?: number;
}

export type DashboardDateRangeWithIntervalParams = DashboardDateRangeParams &
  DashboardIntervalParams;

export type DashboardHistogramParams = DashboardDateRangeParams &
  DashboardBinCountParams;

export type DashboardLimitedDateRangeParams =
  DashboardDateRangeWithIntervalParams & DashboardLimitParams;

export interface HistogramBinItem {
  rangeStart: number;
  rangeEnd: number;
  rangeLabel: string;
  count: number;
  percentage: number;
}

export interface HistogramDistributionResponse {
  bins: HistogramBinItem[];
  totalCount: number;
  minValue: number;
  maxValue: number;
  average: number;
  median: number;
}

export type AvgHarvestSizeDistributionHistogramResponse =
  HistogramDistributionResponse;
export type HarvestFrequencyDistributionHistogramResponse =
  HistogramDistributionResponse;
export type PlantationSizeDistributionHistogramResponse =
  HistogramDistributionResponse;
export type TreeDensityDistributionHistogramResponse =
  HistogramDistributionResponse;
export type YieldDistributionHistogramResponse = HistogramDistributionResponse;

export interface AreaChartDataPoint {
  date: string;
  value: number;
  cumulativeValue: number;
}

export interface CumulativeActiveTreesResponse {
  dataPoints: AreaChartDataPoint[];
  totalActiveTrees: number;
  averageWeeklyIncrease: number;
  interval: string;
}

export interface CumulativeHarvestCountResponse {
  dataPoints: AreaChartDataPoint[];
  totalHarvests: number;
  averageDailyIncrease: number;
  interval: string;
}

export interface CumulativeYieldResponse {
  dataPoints: AreaChartDataPoint[];
  totalYield: number;
  averageDailyIncrease: number;
  interval: string;
}

export interface EnvironmentalMetricValue {
  airTemperature: number;
  soilTemperature: number;
  soilMoisture: number;
}

export interface EnvironmentalAveragesResponse {
  metrics: EnvironmentalMetricValue;
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

export interface HarvestDistributionItem {
  plantationId: string;
  plantationName: string;
  totalYieldKg: number;
  harvestCount: number;
  percentage: number;
}

export interface HarvestDistributionResponse {
  items: HarvestDistributionItem[];
  totalYieldKg: number;
  totalHarvests: number;
}

export interface PlantationHarvestFrequencyItem {
  plantationId: string;
  plantationName: string;
  harvestCount: number;
  totalYieldKg: number;
  averageYieldKg: number;
}

export interface PlantationHarvestFrequencyResponse {
  items: PlantationHarvestFrequencyItem[];
  totalHarvests: number;
}

export interface PlantationGrowthResponse {
  dataPoints: AreaChartDataPoint[];
  totalPlantations: number;
  averageMonthlyIncrease: number;
  interval: string;
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

export interface PlantationLandDistributionItem {
  plantationId: string;
  plantationName: string;
  landAreaHectares: number;
  percentage: number;
}

export interface PlantationLandDistributionResponse {
  items: PlantationLandDistributionItem[];
  totalLandAreaHectares: number;
}

export interface PlantationDistributionItem {
  plantationId: string;
  plantationName: string;
  treeCount: number;
  percentage: number;
}

export interface PlantationDistributionResponse {
  items: PlantationDistributionItem[];
  totalTrees: number;
}

export interface StackedAreaChartDataPoint {
  date: string;
  values: Record<string, number>;
  totalCumulative: number;
}

export interface StackedYieldByPlantationResponse {
  dataPoints: StackedAreaChartDataPoint[];
  totalsByPlantation: Record<string, number>;
  grandTotal: number;
  interval: string;
  plantationCount: number;
}

export interface PlantationYieldComparisonItem {
  plantationId: string;
  plantationName: string;
  totalYieldKg: number;
  harvestCount: number;
}

export interface PlantationYieldComparisonResponse {
  items: PlantationYieldComparisonItem[];
  totalYield: number;
  totalHarvests: number;
}

export interface PlantationActivityComparisonItem {
  plantationId: string;
  plantationName: string;
  activeTrees: number;
  inactiveTrees: number;
  totalTrees: number;
}

export interface PlantationActivityComparisonResponse {
  items: PlantationActivityComparisonItem[];
  totalActiveTrees: number;
  totalInactiveTrees: number;
}

export interface TreeActivityStatusItem {
  status: string;
  treeCount: number;
  percentage: number;
}

export interface TreeActivityStatusResponse {
  items: TreeActivityStatusItem[];
  totalTrees: number;
}

export interface PlantationTreeCountComparisonItem {
  plantationId: string;
  plantationName: string;
  treeCount: number;
  landAreaHectares: number;
  treesPerHectare: number;
}

export interface PlantationTreeCountComparisonResponse {
  items: PlantationTreeCountComparisonItem[];
  totalTrees: number;
}

export interface TreePopulationGrowthResponse {
  dataPoints: AreaChartDataPoint[];
  totalTrees: number;
  averageMonthlyIncrease: number;
  interval: string;
}
