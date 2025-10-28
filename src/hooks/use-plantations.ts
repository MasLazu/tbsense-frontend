import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from './use-auth';
import { PlantationsService } from '../services/plantations-service';
import type {
  PlantationDto,
  CreatePlantationRequest,
  UpdatePlantationRequest,
  PaginationRequest,
  PaginatedResult,
} from '../services/plantations-service';

// Query Keys Factory
export const plantationsQueryKeys = {
  all: () => ['plantations'] as const,
  lists: () => [...plantationsQueryKeys.all(), 'list'] as const,
  list: (pagination: PaginationRequest) => [...plantationsQueryKeys.lists(), pagination] as const,
  details: () => [...plantationsQueryKeys.all(), 'detail'] as const,
  detail: (id: string) => [...plantationsQueryKeys.details(), id] as const,
};

// Hook to get plantation by ID
export function usePlantation(id?: string) {
  const { accessToken, isInitialLoading } = useAuth();

  return useQuery<PlantationDto>({
    queryKey: plantationsQueryKeys.detail(id!),
    queryFn: () => PlantationsService.getPlantationById(id!, accessToken),
    enabled: !isInitialLoading && !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
}

// Hook to get plantations paginated
export function usePlantationsPaginated(pagination: PaginationRequest) {
  const { accessToken, isInitialLoading } = useAuth();

  return useQuery<PaginatedResult<PlantationDto>>({
    queryKey: plantationsQueryKeys.list(pagination),
    queryFn: () => PlantationsService.getPlantationsPaginated(pagination, accessToken),
    enabled: !isInitialLoading,
    staleTime: 60 * 1000, // 1 minute
    refetchOnWindowFocus: false,
  });
}

// Hook to create plantation
export function useCreatePlantation() {
  const { accessToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: CreatePlantationRequest) =>
      PlantationsService.createPlantation(request, accessToken),
    onSuccess: () => {
      // Invalidate all plantation lists to refetch
      queryClient.invalidateQueries({
        queryKey: plantationsQueryKeys.lists(),
      });
    },
  });
}

// Hook to update plantation
export function useUpdatePlantation() {
  const { accessToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: UpdatePlantationRequest) =>
      PlantationsService.updatePlantation(request, accessToken),
    onSuccess: (data) => {
      // Invalidate the specific plantation detail
      queryClient.invalidateQueries({
        queryKey: plantationsQueryKeys.detail(data.id),
      });
      // Invalidate all plantation lists to refetch
      queryClient.invalidateQueries({
        queryKey: plantationsQueryKeys.lists(),
      });
    },
  });
}

// Hook to delete plantation
export function useDeletePlantation() {
  const { accessToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => PlantationsService.deletePlantation(id, accessToken),
    onSuccess: (_, deletedId) => {
      // Remove the specific plantation from cache
      queryClient.removeQueries({
        queryKey: plantationsQueryKeys.detail(deletedId),
      });
      // Invalidate all plantation lists to refetch
      queryClient.invalidateQueries({
        queryKey: plantationsQueryKeys.lists(),
      });
    },
  });
}

export function useGetPlantationYieldPrediction(id: string) {
  const { accessToken, isInitialLoading } = useAuth();
  return useQuery<number[]>({
    queryKey: [...plantationsQueryKeys.detail(id), 'yield-prediction'],
    queryFn: () => PlantationsService.getPlantationYieldPredictionById(id, accessToken),
    enabled: !isInitialLoading && !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    retry: false,
  });
}
