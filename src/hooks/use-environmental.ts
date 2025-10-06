import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { GlobalEnvironmentalService } from "@/services/global-environmental-service";
import type {
  EnvironmentalAveragesResponse,
  DashboardDateRangeParams,
} from "@/types/dashboard";

export const environmentalKeys = {
  all: () => ["global-environmental"] as const,
  averages: (params?: DashboardDateRangeParams) =>
    [...environmentalKeys.all(), "averages", params] as const,
};

export function useEnvironmentalAverages(params?: DashboardDateRangeParams) {
  const { accessToken, isInitialLoading } = useAuth();

  return useQuery<EnvironmentalAveragesResponse>({
    queryKey: environmentalKeys.averages(params),
    queryFn: () => GlobalEnvironmentalService.getAverages(accessToken, params),
    enabled: !isInitialLoading,
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
  });
}
