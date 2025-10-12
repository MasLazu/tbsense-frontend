import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "./use-auth";
import { ModelsService } from "../services/models-service";
import type {
  ModelDto,
  CreateModelRequest,
  UpdateModelRequest,
  TrainModelRequest,
  CompleteTrainingRequest,
  PaginationRequest,
  PaginatedResult,
} from "../services/models-service";

// Query Keys Factory
export const modelsQueryKeys = {
  all: () => ["models"] as const,
  lists: () => [...modelsQueryKeys.all(), "list"] as const,
  list: (pagination: PaginationRequest) =>
    [...modelsQueryKeys.lists(), pagination] as const,
  details: () => [...modelsQueryKeys.all(), "detail"] as const,
  detail: (id: string) => [...modelsQueryKeys.details(), id] as const,
};

// Hook to get model by ID
export function useModel(id?: string) {
  const { accessToken, isInitialLoading } = useAuth();

  return useQuery<ModelDto>({
    queryKey: modelsQueryKeys.detail(id!),
    queryFn: () => ModelsService.getModelById(id!, accessToken),
    enabled: !isInitialLoading && !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
}

// Hook to get models paginated
export function useModelsPaginated(pagination: PaginationRequest) {
  const { accessToken, isInitialLoading } = useAuth();

  return useQuery<PaginatedResult<ModelDto>>({
    queryKey: modelsQueryKeys.list(pagination),
    queryFn: () => ModelsService.getModelsPaginated(pagination, accessToken),
    enabled: !isInitialLoading,
    staleTime: 60 * 1000, // 1 minute
    refetchOnWindowFocus: false,
  });
}

// Hook to create model
export function useCreateModel() {
  const { accessToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: CreateModelRequest) =>
      ModelsService.createModel(request, accessToken),
    onSuccess: () => {
      // Invalidate all model lists to refetch
      queryClient.invalidateQueries({
        queryKey: modelsQueryKeys.lists(),
      });
    },
  });
}

// Hook to update model
export function useUpdateModel() {
  const { accessToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: UpdateModelRequest) =>
      ModelsService.updateModel(request, accessToken),
    onSuccess: (data) => {
      // Invalidate the specific model detail
      queryClient.invalidateQueries({
        queryKey: modelsQueryKeys.detail(data.id),
      });
      // Invalidate all model lists to refetch
      queryClient.invalidateQueries({
        queryKey: modelsQueryKeys.lists(),
      });
    },
  });
}

// Hook to delete model
export function useDeleteModel() {
  const { accessToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => ModelsService.deleteModel(id, accessToken),
    onSuccess: (_, deletedId) => {
      // Remove the specific model from cache
      queryClient.removeQueries({
        queryKey: modelsQueryKeys.detail(deletedId),
      });
      // Invalidate all model lists to refetch
      queryClient.invalidateQueries({
        queryKey: modelsQueryKeys.lists(),
      });
    },
  });
}

// Hook to train model
export function useTrainModel() {
  const { accessToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: TrainModelRequest) =>
      ModelsService.trainModel(request, accessToken),
    onSuccess: (_data) => {
      // Invalidate all model lists to refetch (new model might be created)
      queryClient.invalidateQueries({
        queryKey: modelsQueryKeys.lists(),
      });
    },
  });
}

// Hook to complete training
export function useCompleteTraining() {
  const { accessToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      modelId,
      request,
    }: {
      modelId: string;
      request: CompleteTrainingRequest;
    }) => ModelsService.completeTraining(modelId, request, accessToken),
    onSuccess: (data) => {
      // Invalidate the specific model detail
      queryClient.invalidateQueries({
        queryKey: modelsQueryKeys.detail(data.id),
      });
      // Invalidate all model lists to refetch
      queryClient.invalidateQueries({
        queryKey: modelsQueryKeys.lists(),
      });
    },
  });
}

// Hook to download model
export function useDownloadModel() {
  const { accessToken } = useAuth();

  return useMutation({
    mutationFn: (id: string) => ModelsService.downloadModel(id, accessToken),
  });
}

// Hook to activate model
export function useActivateModel() {
  const { accessToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => ModelsService.activateModel(id, accessToken),
    onSuccess: () => {
      // Invalidate all model-related queries to ensure the list updates
      queryClient.invalidateQueries({
        queryKey: modelsQueryKeys.all(),
      });
    },
  });
}
