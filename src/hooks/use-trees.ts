import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "./use-auth";
import { treesService } from "@/services/trees-service";
import type {
  CreateTreeRequest,
  UpdateTreeRequest,
  PaginationRequest,
} from "@/services/trees-service";

// Query keys factory
export const treesKeys = {
  all: ["trees"],
  lists: () => [...treesKeys.all, "list"],
  list: (params: PaginationRequest) => [...treesKeys.lists(), params],
  details: () => [...treesKeys.all, "detail"],
  detail: (id: string) => [...treesKeys.details(), id],
};

// Hooks
export function useTrees(params: PaginationRequest) {
  const { isInitialLoading } = useAuth();

  return useQuery({
    queryKey: treesKeys.list(params),
    queryFn: () => treesService.getTreesPaginated(params),
    enabled: !isInitialLoading,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useTree(id: string) {
  const { isInitialLoading } = useAuth();

  return useQuery({
    queryKey: treesKeys.detail(id),
    queryFn: () => treesService.getTreeById(id),
    enabled: !isInitialLoading && !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useCreateTree() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: CreateTreeRequest) =>
      treesService.createTree(request),
    onSuccess: () => {
      // Invalidate and refetch trees lists
      queryClient.invalidateQueries({ queryKey: treesKeys.lists() });
    },
  });
}

export function useUpdateTree() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: UpdateTreeRequest) =>
      treesService.updateTree(request),
    onSuccess: (data) => {
      // Invalidate the specific tree detail and lists
      queryClient.invalidateQueries({ queryKey: treesKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: treesKeys.lists() });
    },
  });
}

export function useDeleteTree() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => treesService.deleteTree(id),
    onSuccess: () => {
      // Invalidate trees lists
      queryClient.invalidateQueries({ queryKey: treesKeys.lists() });
    },
  });
}
