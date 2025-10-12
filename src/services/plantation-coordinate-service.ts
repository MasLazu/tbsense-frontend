import { apiClient } from '../lib/api-client';

// Base DTO interface
export interface BaseDto {
  id: string;
  createdAt: string;
  updatedAt?: string;
}

// PlantationCoordinate DTO
export interface PlantationCoordinateDto extends BaseDto {
  plantationId: string;
  longitude: number;
  latitude: number;
}

// Create PlantationCoordinate Request
export interface CreatePlantationCoordinateRequest {
  plantationId: string;
  longitude: number;
  latitude: number;
}

// Update PlantationCoordinate Request
export interface UpdatePlantationCoordinateRequest {
  id: string;
  plantationId: string;
  longitude: number;
  latitude: number;
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

export class PlantationCoordinatesService {
  static async createPlantationCoordinate(
    request: CreatePlantationCoordinateRequest,
    accessToken?: string
  ): Promise<PlantationCoordinateDto> {
    return (
      await apiClient.post<PlantationCoordinateDto>(
        '/plantation-coordinates',
        request,
        accessToken ?? undefined
      )
    ).data;
  }

  static async updatePlantationCoordinate(
    request: UpdatePlantationCoordinateRequest,
    accessToken?: string
  ): Promise<PlantationCoordinateDto> {
    return (
      await apiClient.put<PlantationCoordinateDto>(
        '/plantation-coordinates',
        request,
        accessToken ?? undefined
      )
    ).data;
  }

  static async deletePlantationCoordinate(id: string, accessToken?: string): Promise<void> {
    await apiClient.delete<object>(`/plantation-coordinates/${id}`, accessToken ?? undefined);
  }

  static async getPlantationCoordinateById(
    id: string,
    accessToken?: string
  ): Promise<PlantationCoordinateDto> {
    return (
      await apiClient.get<PlantationCoordinateDto>(
        `/plantation-coordinates/${id}`,
        undefined,
        accessToken ?? undefined
      )
    ).data;
  }

  static async getPlantationCoordinatesPaginated(
    request: PaginationRequest,
    accessToken?: string
  ): Promise<PaginatedResult<PlantationCoordinateDto>> {
    return (
      await apiClient.post<PaginatedResult<PlantationCoordinateDto>>(
        '/plantation-coordinates/paginated',
        request,
        accessToken ?? undefined
      )
    ).data;
  }
}
