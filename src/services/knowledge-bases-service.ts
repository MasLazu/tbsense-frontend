import { apiClient } from "../lib/api-client";

// Base DTO interface
export interface BaseDto {
  id: string;
  createdAt: string;
  updatedAt?: string;
}

// Knowledge Base DTO
export interface KnowledgeBaseDto extends BaseDto {
  title: string;
  content: string;
}

// Create Knowledge Base Request
export interface CreateKnowledgeBaseRequest {
  title: string;
  content: string;
}

// Update Knowledge Base Request
export interface UpdateKnowledgeBaseRequest {
  id: string;
  title?: string;
  content?: string;
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

export class KnowledgeBasesService {
  static async createKnowledgeBase(
    request: CreateKnowledgeBaseRequest,
    accessToken?: string
  ): Promise<KnowledgeBaseDto> {
    return (
      await apiClient.post<KnowledgeBaseDto>(
        "/knowledge-bases",
        request,
        accessToken ?? undefined
      )
    ).data;
  }

  static async updateKnowledgeBase(
    request: UpdateKnowledgeBaseRequest,
    accessToken?: string
  ): Promise<KnowledgeBaseDto> {
    return (
      await apiClient.put<KnowledgeBaseDto>(
        "/knowledge-bases",
        request,
        accessToken ?? undefined
      )
    ).data;
  }

  static async deleteKnowledgeBase(
    id: string,
    accessToken?: string
  ): Promise<void> {
    await apiClient.delete<object>(
      `/knowledge-bases/${id}`,
      accessToken ?? undefined
    );
  }

  static async getKnowledgeBaseById(
    id: string,
    accessToken?: string
  ): Promise<KnowledgeBaseDto> {
    return (
      await apiClient.get<KnowledgeBaseDto>(
        `/knowledge-bases/${id}`,
        undefined,
        accessToken ?? undefined
      )
    ).data;
  }

  static async getKnowledgeBasesPaginated(
    request: PaginationRequest,
    accessToken?: string
  ): Promise<PaginatedResult<KnowledgeBaseDto>> {
    return (
      await apiClient.post<PaginatedResult<KnowledgeBaseDto>>(
        "/knowledge-bases/paginated",
        request,
        accessToken ?? undefined
      )
    ).data;
  }
}
