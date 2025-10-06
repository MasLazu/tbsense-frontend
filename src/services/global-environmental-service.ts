import { apiClient } from "@/lib/api-client";
import type {
  EnvironmentalAveragesResponse,
  DashboardDateRangeParams,
} from "@/types/dashboard";

export class GlobalEnvironmentalService {
  static async getAverages(
    accessToken?: string,
    params?: DashboardDateRangeParams
  ): Promise<EnvironmentalAveragesResponse> {
    return (
      await apiClient.get<EnvironmentalAveragesResponse>(
        "/dashboard/environmental/averages",
        params,
        accessToken
      )
    ).data;
  }
}
