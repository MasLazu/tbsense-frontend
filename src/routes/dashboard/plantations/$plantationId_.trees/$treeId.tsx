import { createFileRoute, Link } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2, MapPin, Calendar, Thermometer, Droplets } from 'lucide-react';
import {
  useTreeBasicSummary,
  useTreeCurrentMetrics,
  useTreeEnvironmentalAverages,
  useTreeEnvironmentalTimeseries,
  useTreeAirTemperatureDistribution,
  useTreeSoilTemperatureDistribution,
  useTreeDailyMetricsComparison,
  useTreeHourlyAverageComparison,
  useTreeSoilMoistureDistribution,
} from '@/hooks/use-tree-dashboard';
import { TimeRangeProvider } from '@/components/time-range-provider';
import { useTimeRange } from '@/hooks/use-time-range';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

export const Route = createFileRoute('/dashboard/plantations/$plantationId_/trees/$treeId')({
  component: RouteComponent,
});

function RouteComponent() {
  const { plantationId, treeId } = Route.useParams();
  const { params } = useTimeRange();

  // Fetch basic data
  const { data: basicSummary, isLoading: isLoadingBasic } = useTreeBasicSummary(treeId);
  const { data: currentMetrics, isLoading: isLoadingCurrent } = useTreeCurrentMetrics(treeId);
  const { data: environmentalAverages, isLoading: isLoadingAverages } =
    useTreeEnvironmentalAverages(treeId, {
      startDate: params.startTime,
      endDate: params.endTime,
    });

  // Fetch timeseries data
  const { data: environmentalTimeseries, isLoading: isLoadingTimeseries } =
    useTreeEnvironmentalTimeseries(treeId, {
      startDate: params.startTime,
      endDate: params.endTime,
      interval: 'hourly',
    });

  // Fetch histogram data
  const { data: airTempDistribution } = useTreeAirTemperatureDistribution(treeId, {
    startDate: params.startTime,
    endDate: params.endTime,
    binCount: 10,
  });
  const { data: soilTempDistribution } = useTreeSoilTemperatureDistribution(treeId, {
    startDate: params.startTime,
    endDate: params.endTime,
    binCount: 10,
  });
  const { data: soilMoistureDistribution } = useTreeSoilMoistureDistribution(treeId, {
    startDate: params.startTime,
    endDate: params.endTime,
    binCount: 10,
  });

  // Fetch comparison data
  const { data: dailyMetrics } = useTreeDailyMetricsComparison(treeId, {
    startDate: params.startTime,
    endDate: params.endTime,
  });
  const { data: hourlyAverages } = useTreeHourlyAverageComparison(treeId, {
    startDate: params.startTime,
    endDate: params.endTime,
  });

  const isLoading = isLoadingBasic || isLoadingCurrent || isLoadingAverages || isLoadingTimeseries;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/dashboard/plantations/$plantationId" params={{ plantationId }}>
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight">Tree #{treeId.slice(-8)}</h1>
              {/* <Badge variant={basicSummary?.status === 'active' ? 'default' : 'secondary'}>
                {basicSummary?.status || 'Unknown'}
              </Badge> */}
            </div>
            <p className="text-muted-foreground">
              Detailed environmental metrics and analytics for this tree
            </p>
          </div>
        </div>
        <TimeRangeProvider invalidateKeys={[['tree-dashboard', treeId]]} />
      </div>

      {/* Basic Info Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Location</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-sm font-mono">
              {basicSummary?.latitude?.toFixed(6)}, {basicSummary?.longitude?.toFixed(6)}
            </div>
            <p className="text-xs text-muted-foreground">Lat, Long</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tree Age</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{basicSummary?.age?.toFixed(1) || '0.0'}</div>
            <p className="text-xs text-muted-foreground">
              years (planted{' '}
              {basicSummary?.plantedDate
                ? new Date(basicSummary.plantedDate).toLocaleDateString()
                : '-'}
              )
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Air Temperature</CardTitle>
            <Thermometer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {currentMetrics?.airTemperature?.toFixed(1) || '-'}°C
            </div>
            <p className="text-xs text-muted-foreground">current reading</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Soil Moisture</CardTitle>
            <Droplets className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {currentMetrics?.soilMoisture?.toFixed(1) || '-'}%
            </div>
            <p className="text-xs text-muted-foreground">current level</p>
          </CardContent>
        </Card>
      </div>

      {/* Current Metrics Summary */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Current Readings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="text-sm text-muted-foreground">Air Temperature</div>
              <div className="text-2xl font-bold">
                {currentMetrics?.airTemperature?.toFixed(1) || '-'}°C
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Soil Temperature</div>
              <div className="text-2xl font-bold">
                {currentMetrics?.soilTemperature?.toFixed(1) || '-'}°C
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Last Updated</div>
              <div className="text-sm font-medium">
                {currentMetrics?.lastReadingTime
                  ? new Date(currentMetrics.lastReadingTime).toLocaleString()
                  : 'No data'}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Average Conditions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="text-sm text-muted-foreground">Avg Air Temperature</div>
              <div className="text-2xl font-bold">
                {environmentalAverages?.averageAirTemperature?.toFixed(1) || '-'}°C
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Avg Soil Temperature</div>
              <div className="text-2xl font-bold">
                {environmentalAverages?.averageSoilTemperature?.toFixed(1) || '-'}°C
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Avg Soil Moisture</div>
              <div className="text-2xl font-bold">
                {environmentalAverages?.averageSoilMoisture?.toFixed(1) || '-'}%
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Data Coverage</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="text-sm text-muted-foreground">Total Readings</div>
              <div className="text-2xl font-bold">
                {environmentalAverages?.readingCount?.toLocaleString() || '0'}
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Period</div>
              <div className="text-sm font-medium">
                {environmentalAverages?.startDate && environmentalAverages?.endDate
                  ? `${new Date(environmentalAverages.startDate).toLocaleDateString()} - ${new Date(environmentalAverages.endDate).toLocaleDateString()}`
                  : 'No data'}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Environmental Timeseries Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Environmental Trends</CardTitle>
        </CardHeader>
        <CardContent>
          {environmentalTimeseries && environmentalTimeseries.dataPoints.length > 0 ? (
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={environmentalTimeseries.dataPoints}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="timestamp"
                  tickFormatter={(value) =>
                    new Date(value).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })
                  }
                />
                <YAxis
                  yAxisId="left"
                  label={{ value: 'Temperature (°C)', angle: -90, position: 'insideLeft' }}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  label={{ value: 'Moisture (%)', angle: 90, position: 'insideRight' }}
                />
                <Tooltip
                  labelFormatter={(value) => new Date(value).toLocaleString()}
                  formatter={(value: number) => value.toFixed(2)}
                />
                <Legend />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="airTemperature"
                  stroke="#ef4444"
                  name="Air Temp"
                  dot={false}
                />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="soilTemperature"
                  stroke="#f97316"
                  name="Soil Temp"
                  dot={false}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="soilMoisture"
                  stroke="#3b82f6"
                  name="Soil Moisture"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[350px] text-muted-foreground">
              No timeseries data available
            </div>
          )}
        </CardContent>
      </Card>

      {/* Temperature Distributions */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Air Temperature Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {airTempDistribution && airTempDistribution.bins.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={airTempDistribution.bins}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="rangeStart" tickFormatter={(value) => `${value.toFixed(1)}°C`} />
                  <YAxis />
                  <Tooltip
                    formatter={(value: number) => value}
                    labelFormatter={(value) =>
                      `${value}°C - ${(value + (airTempDistribution.bins[1]?.rangeStart - airTempDistribution.bins[0]?.rangeStart || 0)).toFixed(1)}°C`
                    }
                  />
                  <Bar dataKey="count" fill="#ef4444" name="Readings" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                No distribution data available
              </div>
            )}
            {airTempDistribution && (
              <div className="mt-4 text-sm text-muted-foreground">
                Average: {airTempDistribution.averageTemperature?.toFixed(2)}°C | Total Readings:{' '}
                {airTempDistribution.totalReadings}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Soil Temperature Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {soilTempDistribution && soilTempDistribution.bins.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={soilTempDistribution.bins}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="rangeStart" tickFormatter={(value) => `${value.toFixed(1)}°C`} />
                  <YAxis />
                  <Tooltip
                    formatter={(value: number) => value}
                    labelFormatter={(value) =>
                      `${value}°C - ${(value + (soilTempDistribution.bins[1]?.rangeStart - soilTempDistribution.bins[0]?.rangeStart || 0)).toFixed(1)}°C`
                    }
                  />
                  <Bar dataKey="count" fill="#f97316" name="Readings" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                No distribution data available
              </div>
            )}
            {soilTempDistribution && (
              <div className="mt-4 text-sm text-muted-foreground">
                Average: {soilTempDistribution.averageTemperature?.toFixed(2)}°C | Total Readings:{' '}
                {soilTempDistribution.totalReadings}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Soil Moisture Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Soil Moisture Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          {soilMoistureDistribution && soilMoistureDistribution.bins.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={soilMoistureDistribution.bins}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="rangeStart" tickFormatter={(value) => `${value.toFixed(1)}%`} />
                <YAxis />
                <Tooltip
                  formatter={(value: number) => value}
                  labelFormatter={(value) =>
                    `${value}% - ${(value + (soilMoistureDistribution.bins[1]?.rangeStart - soilMoistureDistribution.bins[0]?.rangeStart || 0)).toFixed(1)}%`
                  }
                />
                <Bar dataKey="count" fill="#3b82f6" name="Readings" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-muted-foreground">
              No distribution data available
            </div>
          )}
          {soilMoistureDistribution && (
            <div className="mt-4 text-sm text-muted-foreground">
              Average: {soilMoistureDistribution.averageMoisture?.toFixed(2)}% | Total Readings:{' '}
              {soilMoistureDistribution.totalReadings}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Daily Metrics Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>Daily Metrics Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          {dailyMetrics && dailyMetrics.items.length > 0 ? (
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={dailyMetrics.items}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(value) =>
                    new Date(value).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })
                  }
                />
                <YAxis />
                <Tooltip
                  labelFormatter={(value) => new Date(value).toLocaleDateString()}
                  formatter={(value: number) => value.toFixed(2)}
                />
                <Legend />
                <Bar dataKey="averageAirTemperature" fill="#ef4444" name="Air Temp (°C)" />
                <Bar dataKey="averageSoilTemperature" fill="#f97316" name="Soil Temp (°C)" />
                <Bar dataKey="averageSoilMoisture" fill="#3b82f6" name="Soil Moisture (%)" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[350px] text-muted-foreground">
              No daily metrics data available
            </div>
          )}
        </CardContent>
      </Card>

      {/* Hourly Average Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>Hourly Average Patterns</CardTitle>
        </CardHeader>
        <CardContent>
          {hourlyAverages && hourlyAverages.items.length > 0 ? (
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={hourlyAverages.items}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" tickFormatter={(value) => `${value}:00`} />
                <YAxis />
                <Tooltip
                  labelFormatter={(value) => `Hour ${value}:00`}
                  formatter={(value: number) => value.toFixed(2)}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="averageAirTemperature"
                  stroke="#ef4444"
                  name="Air Temp (°C)"
                />
                <Line
                  type="monotone"
                  dataKey="averageSoilTemperature"
                  stroke="#f97316"
                  name="Soil Temp (°C)"
                />
                <Line
                  type="monotone"
                  dataKey="averageSoilMoisture"
                  stroke="#3b82f6"
                  name="Soil Moisture (%)"
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[350px] text-muted-foreground">
              No hourly data available
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
