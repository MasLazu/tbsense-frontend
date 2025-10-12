import { apiClient } from "../lib/api-client";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5065/api/v1";

// Base DTO interface
export interface BaseDto {
  id: string;
  createdAt: string;
  updatedAt?: string;
}

// Model DTO
export interface ModelDto extends BaseDto {
  name: string;
  trainingStatus: string;
  filePath: string;
  isUsed: boolean;
  trainingDataStart: string;
  trainingDataEnd: string;
  accuracy?: number;
  mae?: number;
  rmse?: number;
  r2Score?: number;
}

// Create Model Request
export interface CreateModelRequest {
  name: string;
  trainingDataStart: string;
  trainingDataEnd: string;
}

// Update Model Request
export interface UpdateModelRequest {
  id: string;
  name?: string;
  trainingStatus?: string;
  filePath?: string;
  isUsed?: boolean;
  trainingDataStart?: string;
  trainingDataEnd?: string;
  accuracy?: number;
  mae?: number;
  rmse?: number;
  r2Score?: number;
}

// Train Model Request
export interface TrainModelRequest {
  trainingDataStart: string;
  trainingDataEnd: string;
}

// Train Model Response
export interface TrainModelResponse {
  modelId: string;
  message: string;
}

// Complete Training Request
export interface CompleteTrainingRequest {
  modelFile?: File;
  accuracy: number;
  mae: number;
  rmse: number;
  r2Score: number;
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

export class ModelsService {
  static async createModel(
    request: CreateModelRequest,
    accessToken?: string
  ): Promise<ModelDto> {
    return (
      await apiClient.post<ModelDto>(
        "/models/train",
        request,
        accessToken ?? undefined
      )
    ).data;
  }

  static async updateModel(
    request: UpdateModelRequest,
    accessToken?: string
  ): Promise<ModelDto> {
    return (
      await apiClient.put<ModelDto>(
        "/models",
        request,
        accessToken ?? undefined
      )
    ).data;
  }

  static async deleteModel(id: string, accessToken?: string): Promise<void> {
    await apiClient.delete<object>(`/models/${id}`, accessToken ?? undefined);
  }

  static async getModelById(
    id: string,
    accessToken?: string
  ): Promise<ModelDto> {
    return (
      await apiClient.get<ModelDto>(
        `/models/${id}`,
        undefined,
        accessToken ?? undefined
      )
    ).data;
  }

  static async getModelsPaginated(
    request: PaginationRequest,
    accessToken?: string
  ): Promise<PaginatedResult<ModelDto>> {
    return (
      await apiClient.post<PaginatedResult<ModelDto>>(
        "/models/paginated",
        request,
        accessToken ?? undefined
      )
    ).data;
  }

  static async trainModel(
    request: TrainModelRequest,
    accessToken?: string
  ): Promise<TrainModelResponse> {
    return (
      await apiClient.post<TrainModelResponse>(
        "/models/train",
        request,
        accessToken ?? undefined
      )
    ).data;
  }

  static async completeTraining(
    modelId: string,
    request: CompleteTrainingRequest,
    accessToken?: string
  ): Promise<ModelDto> {
    const formData = new FormData();
    if (request.modelFile) {
      formData.append("modelFile", request.modelFile);
    }
    formData.append("accuracy", request.accuracy.toString());
    formData.append("mae", request.mae.toString());
    formData.append("rmse", request.rmse.toString());
    formData.append("r2Score", request.r2Score.toString());

    // Use fetch directly for FormData
    const response = await fetch(
      `${API_BASE_URL}/models/${modelId}/training-complete`,
      {
        method: "POST",
        headers: {
          ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
        },
        body: formData,
        credentials: "include",
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result.data;
  }

  static async downloadModel(id: string, accessToken?: string): Promise<Blob> {
    // Use fetch directly for blob response
    const response = await fetch(`${API_BASE_URL}/models/${id}/download`, {
      method: "GET",
      headers: {
        ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
      },
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.blob();
  }
}
