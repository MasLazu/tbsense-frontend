import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { usePlantationsByLandArea } from "@/hooks/use-charts";
import { Cell, Legend, Pie, PieChart } from "recharts";

const CHART_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

export function LandDistributionChart() {
  const { data, isLoading, error } = usePlantationsByLandArea();

  const chartData =
    data?.items.map((item) => ({
      name: item.plantationName,
      value: item.landAreaHectares,
      percentage: item.percentage,
    })) || [];

  const chartConfig = {
    value: {
      label: "Land Area (ha)",
    },
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Plantation Distribution by Land Area</CardTitle>
        </CardHeader>
        <CardContent className="h-[400px] flex items-center justify-center">
          <p className="text-muted-foreground">Loading...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Plantation Distribution by Land Area</CardTitle>
        </CardHeader>
        <CardContent className="h-[400px] flex items-center justify-center">
          <p className="text-destructive">Failed to load data</p>
        </CardContent>
      </Card>
    );
  }

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Plantation Distribution by Land Area</CardTitle>
        </CardHeader>
        <CardContent className="h-[400px] flex items-center justify-center">
          <p className="text-muted-foreground">No data available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Plantation Distribution by Land Area</CardTitle>
        <p className="text-sm text-muted-foreground mt-1">
          Total Land Area: {data?.totalLandAreaHectares.toFixed(2)} hectares
        </p>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[400px] w-full">
          <PieChart>
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={120}
              label={({ percentage }) => `${percentage.toFixed(1)}%`}
            >
              {chartData.map((_entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={CHART_COLORS[index % CHART_COLORS.length]}
                />
              ))}
            </Pie>
            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatter={(value, _name, props) => {
                    const payload = props.payload;
                    return [
                      <div key="content" className="space-y-1">
                        <div className="font-semibold">{payload.name}</div>
                        <div>
                          Land Area: {Number(value).toFixed(2)} ha (
                          {payload.percentage.toFixed(1)}%)
                        </div>
                      </div>,
                    ];
                  }}
                />
              }
            />
            <Legend
              verticalAlign="bottom"
              height={36}
              formatter={(value) => <span className="text-sm">{value}</span>}
            />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
