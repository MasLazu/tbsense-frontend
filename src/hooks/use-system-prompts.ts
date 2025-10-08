import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "./use-auth";
import {
  SystemPromptsService,
  type SystemPromptDto,
  type CreateSystemPromptRequest,
  type UpdateSystemPromptRequest,
  type PaginationRequest,
  type PaginatedResult,
} from "../services/system-prompts-service";

// Query keys factory
export const systemPromptsKeys = {
  all: () => ["system-prompts"] as const,
  lists: () => [...systemPromptsKeys.all(), "list"] as const,
  list: (params: PaginationRequest) =>
    [...systemPromptsKeys.lists(), params] as const,
  details: () => [...systemPromptsKeys.all(), "detail"] as const,
  detail: (id: string) => [...systemPromptsKeys.details(), id] as const,
};

/**
 * Hook to get a single system prompt by ID
 */
export function useSystemPrompt(id: string) {
  const { accessToken, isInitialLoading } = useAuth();

  return useQuery<SystemPromptDto>({
    queryKey: systemPromptsKeys.detail(id),
    queryFn: () => SystemPromptsService.getSystemPromptById(id, accessToken),
    enabled: !isInitialLoading && !!id,
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

/**
 * Hook to get paginated list of system prompts
 */
export function useSystemPromptsPaginated(params: PaginationRequest) {
  const { accessToken, isInitialLoading } = useAuth();

  return useQuery<PaginatedResult<SystemPromptDto>>({
    queryKey: systemPromptsKeys.list(params),
    queryFn: () =>
      SystemPromptsService.getSystemPromptsPaginated(params, accessToken),
    enabled: !isInitialLoading,
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

/**
 * Hook to create a new system prompt
 */
export function useCreateSystemPrompt() {
  const { accessToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: CreateSystemPromptRequest) =>
      SystemPromptsService.createSystemPrompt(request, accessToken),
    onSuccess: () => {
      // Invalidate all list queries to refetch with new data
      queryClient.invalidateQueries({
        queryKey: systemPromptsKeys.lists(),
      });
    },
  });
}

/**
 * Hook to update an existing system prompt
 */
export function useUpdateSystemPrompt() {
  const { accessToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: UpdateSystemPromptRequest) =>
      SystemPromptsService.updateSystemPrompt(request, accessToken),
    onSuccess: (data) => {
      // Invalidate the specific detail query
      queryClient.invalidateQueries({
        queryKey: systemPromptsKeys.detail(data.id),
      });
      // Invalidate all list queries
      queryClient.invalidateQueries({
        queryKey: systemPromptsKeys.lists(),
      });
    },
  });
}

/**
 * Hook to delete a system prompt
 */
export function useDeleteSystemPrompt() {
  const { accessToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      SystemPromptsService.deleteSystemPrompt(id, accessToken),
    onSuccess: (_, id) => {
      // Remove the specific detail query from cache
      queryClient.removeQueries({
        queryKey: systemPromptsKeys.detail(id),
      });
      // Invalidate all list queries
      queryClient.invalidateQueries({
        queryKey: systemPromptsKeys.lists(),
      });
    },
  });
}
