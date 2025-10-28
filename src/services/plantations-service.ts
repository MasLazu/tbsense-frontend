import { apiClient } from '../lib/api-client';

// Base DTO interface
export interface BaseDto {
  id: string;
  createdAt: string;
  updatedAt?: string;
}

// Plantation DTO
export interface PlantationDto extends BaseDto {
  name: string;
  description?: string;
  landAreaHectares: number;
  plantedDate: string;
}

// Create Plantation Request
export interface CreatePlantationRequest {
  name: string;
  description?: string;
  landAreaHectares: number;
  plantedDate: string;
}

// Update Plantation Request
export interface UpdatePlantationRequest {
  id: string;
  name?: string;
  description?: string;
  landAreaHectares?: number;
  plantedDate?: string;
}

// Pagination Request
export interface Filter {
  field: string;
  operator: string;
  value: string;
}

export interface OrderBy {
  field: string;
  desc: boolean;
}

export interface PaginationRequest {
  page: number;
  pageSize: number;
  filters?: Filter[];
  orderBy?: OrderBy[];
}

// Paginated Result
export interface PaginatedResult<T> {
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  items: T[];
}

export class PlantationsService {
  static async createPlantation(
    request: CreatePlantationRequest,
    accessToken?: string
  ): Promise<PlantationDto> {
    return (await apiClient.post<PlantationDto>('/plantations', request, accessToken ?? undefined))
      .data;
  }

  static async updatePlantation(
    request: UpdatePlantationRequest,
    accessToken?: string
  ): Promise<PlantationDto> {
    return (await apiClient.put<PlantationDto>('/plantations', request, accessToken ?? undefined))
      .data;
  }

  static async deletePlantation(id: string, accessToken?: string): Promise<void> {
    await apiClient.delete<object>(`/plantations/${id}`, accessToken ?? undefined);
  }

  static async getPlantationById(id: string, accessToken?: string): Promise<PlantationDto> {
    return (
      await apiClient.get<PlantationDto>(`/plantations/${id}`, undefined, accessToken ?? undefined)
    ).data;
  }

  static async getPlantationYieldPredictionById(
    id: string,
    accessToken?: string
  ): Promise<number[]> {
    return (
      await apiClient.get<number[]>(
        `/plantations/${id}/yield-prediction`,
        undefined,
        accessToken ?? undefined
      )
    ).data;
  }

  static async getPlantationsPaginated(
    request: PaginationRequest,
    accessToken?: string
  ): Promise<PaginatedResult<PlantationDto>> {
    return (
      await apiClient.post<PaginatedResult<PlantationDto>>(
        '/plantations/paginated',
        request,
        accessToken ?? undefined
      )
    ).data;
  }
}
