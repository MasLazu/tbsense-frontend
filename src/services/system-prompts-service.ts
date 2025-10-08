import { apiClient } from "../lib/api-client";

// Base types
export interface BaseDto {
  id: string;
  createdAt: string;
  updatedAt?: string | null;
}

export interface PaginatedResult<T> {
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  items: T[];
}

export interface PaginationRequest {
  page: number;
  pageSize: number;
  search?: string;
  sortBy?: string;
  sortDirection?: "asc" | "desc";
}

// System Prompt types
export interface SystemPromptDto extends BaseDto {
  name: string;
  prompt: string;
  isActive: boolean;
}

export interface CreateSystemPromptRequest {
  name: string;
  prompt: string;
  isActive?: boolean | null;
}

export interface UpdateSystemPromptRequest {
  id: string;
  name?: string | null;
  prompt?: string | null;
  isActive?: boolean | null;
}

export class SystemPromptsService {
  /**
   * Create a new system prompt
   * POST /system-prompts
   */
  static async createSystemPrompt(
    request: CreateSystemPromptRequest,
    accessToken?: string
  ): Promise<SystemPromptDto> {
    return (
      await apiClient.post<SystemPromptDto>(
        "/system-prompts",
        request,
        accessToken ?? undefined
      )
    ).data;
  }

  /**
   * Update an existing system prompt
   * PUT /system-prompts
   */
  static async updateSystemPrompt(
    request: UpdateSystemPromptRequest,
    accessToken?: string
  ): Promise<SystemPromptDto> {
    return (
      await apiClient.put<SystemPromptDto>(
        "/system-prompts",
        request,
        accessToken ?? undefined
      )
    ).data;
  }

  /**
   * Delete a system prompt by ID
   * DELETE /system-prompts/{id}
   */
  static async deleteSystemPrompt(
    id: string,
    accessToken?: string
  ): Promise<void> {
    await apiClient.delete(`/system-prompts/${id}`, accessToken ?? undefined);
  }

  /**
   * Get a system prompt by ID
   * GET /system-prompts/{id}
   */
  static async getSystemPromptById(
    id: string,
    accessToken?: string
  ): Promise<SystemPromptDto> {
    return (
      await apiClient.get<SystemPromptDto>(
        `/system-prompts/${id}`,
        undefined,
        accessToken ?? undefined
      )
    ).data;
  }

  /**
   * Get paginated list of system prompts
   * POST /system-prompts/paginated
   */
  static async getSystemPromptsPaginated(
    request: PaginationRequest,
    accessToken?: string
  ): Promise<PaginatedResult<SystemPromptDto>> {
    return (
      await apiClient.post<PaginatedResult<SystemPromptDto>>(
        "/system-prompts/paginated",
        request,
        accessToken ?? undefined
      )
    ).data;
  }
}
