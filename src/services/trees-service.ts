import { apiClient } from "@/lib/api-client";

// Types
export interface TreeDto {
  id: string;
  createdAt: string;
  updatedAt?: string;
  plantationId: string;
  longitude: number;
  latitude: number;
}

export interface CreateTreeRequest {
  plantationId: string;
  longitude: number;
  latitude: number;
}

export interface UpdateTreeRequest {
  id: string;
  plantationId?: string;
  longitude?: number;
  latitude?: number;
}

export interface PaginatedResultOfTreeDto {
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  items: TreeDto[];
}

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

// Service functions
export const treesService = {
  // Create a new tree
  createTree: async (request: CreateTreeRequest): Promise<TreeDto> => {
    const response = await apiClient.post<TreeDto>("/trees", request);
    return response.data;
  },

  // Update an existing tree
  updateTree: async (request: UpdateTreeRequest): Promise<TreeDto> => {
    const response = await apiClient.put<TreeDto>("/trees", request);
    return response.data;
  },

  // Get tree by ID
  getTreeById: async (id: string): Promise<TreeDto> => {
    const response = await apiClient.get<TreeDto>(`/trees/${id}`);
    return response.data;
  },

  // Delete tree by ID
  deleteTree: async (id: string): Promise<void> => {
    await apiClient.delete(`/trees/${id}`);
  },

  // Get trees with pagination
  getTreesPaginated: async (
    request: PaginationRequest
  ): Promise<PaginatedResultOfTreeDto> => {
    const response = await apiClient.post<PaginatedResultOfTreeDto>(
      "/trees/paginated",
      request
    );
    return response.data;
  },
};
