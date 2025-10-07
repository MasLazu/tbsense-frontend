import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "./use-auth";
import { KnowledgeBasesService } from "../services/knowledge-bases-service";
import type {
  KnowledgeBaseDto,
  CreateKnowledgeBaseRequest,
  UpdateKnowledgeBaseRequest,
  PaginationRequest,
  PaginatedResult,
} from "../services/knowledge-bases-service";

// Query Keys Factory
export const knowledgeBasesQueryKeys = {
  all: () => ["knowledge-bases"] as const,
  lists: () => [...knowledgeBasesQueryKeys.all(), "list"] as const,
  list: (pagination: PaginationRequest) =>
    [...knowledgeBasesQueryKeys.lists(), pagination] as const,
  details: () => [...knowledgeBasesQueryKeys.all(), "detail"] as const,
  detail: (id: string) => [...knowledgeBasesQueryKeys.details(), id] as const,
};

// Hook to get knowledge base by ID
export function useKnowledgeBase(id?: string) {
  const { accessToken, isInitialLoading } = useAuth();

  return useQuery<KnowledgeBaseDto>({
    queryKey: knowledgeBasesQueryKeys.detail(id!),
    queryFn: () => KnowledgeBasesService.getKnowledgeBaseById(id!, accessToken),
    enabled: !isInitialLoading && !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
}

// Hook to get knowledge bases paginated
export function useKnowledgeBasesPaginated(pagination: PaginationRequest) {
  const { accessToken, isInitialLoading } = useAuth();

  return useQuery<PaginatedResult<KnowledgeBaseDto>>({
    queryKey: knowledgeBasesQueryKeys.list(pagination),
    queryFn: () =>
      KnowledgeBasesService.getKnowledgeBasesPaginated(pagination, accessToken),
    enabled: !isInitialLoading,
    staleTime: 60 * 1000, // 1 minute
    refetchOnWindowFocus: false,
  });
}

// Hook to create knowledge base
export function useCreateKnowledgeBase() {
  const { accessToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: CreateKnowledgeBaseRequest) =>
      KnowledgeBasesService.createKnowledgeBase(request, accessToken),
    onSuccess: () => {
      // Invalidate all knowledge base lists to refetch
      queryClient.invalidateQueries({
        queryKey: knowledgeBasesQueryKeys.lists(),
      });
    },
  });
}

// Hook to update knowledge base
export function useUpdateKnowledgeBase() {
  const { accessToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: UpdateKnowledgeBaseRequest) =>
      KnowledgeBasesService.updateKnowledgeBase(request, accessToken),
    onSuccess: (data) => {
      // Invalidate the specific knowledge base detail
      queryClient.invalidateQueries({
        queryKey: knowledgeBasesQueryKeys.detail(data.id),
      });
      // Invalidate all knowledge base lists to refetch
      queryClient.invalidateQueries({
        queryKey: knowledgeBasesQueryKeys.lists(),
      });
    },
  });
}

// Hook to delete knowledge base
export function useDeleteKnowledgeBase() {
  const { accessToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      KnowledgeBasesService.deleteKnowledgeBase(id, accessToken),
    onSuccess: (_, deletedId) => {
      // Remove the specific knowledge base from cache
      queryClient.removeQueries({
        queryKey: knowledgeBasesQueryKeys.detail(deletedId),
      });
      // Invalidate all knowledge base lists to refetch
      queryClient.invalidateQueries({
        queryKey: knowledgeBasesQueryKeys.lists(),
      });
    },
  });
}
