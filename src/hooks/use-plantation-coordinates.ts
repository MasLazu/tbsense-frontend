import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from './use-auth';
import { PlantationCoordinatesService } from '../services/plantation-coordinate-service';
import type {
  PlantationCoordinateDto,
  CreatePlantationCoordinateRequest,
  UpdatePlantationCoordinateRequest,
  PaginationRequest,
  PaginatedResult,
} from '../services/plantation-coordinate-service';

// Query Keys Factory
export const plantationCoordinatesQueryKeys = {
  all: () => ['plantationCoordinates'] as const,
  lists: () => [...plantationCoordinatesQueryKeys.all(), 'list'] as const,
  list: (pagination: PaginationRequest) =>
    [...plantationCoordinatesQueryKeys.lists(), pagination] as const,
  details: () => [...plantationCoordinatesQueryKeys.all(), 'detail'] as const,
  detail: (id: string) => [...plantationCoordinatesQueryKeys.details(), id] as const,
};

// Hook to get plantation coordinate by ID
export function usePlantationCoordinate(id?: string) {
  const { accessToken, isInitialLoading } = useAuth();

  return useQuery<PlantationCoordinateDto>({
    queryKey: plantationCoordinatesQueryKeys.detail(id!),
    queryFn: () => PlantationCoordinatesService.getPlantationCoordinateById(id!, accessToken),
    enabled: !isInitialLoading && !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
}

// Hook to get plantation coordinates paginated
export function usePlantationCoordinatesPaginated(pagination: PaginationRequest) {
  const { accessToken, isInitialLoading } = useAuth();

  return useQuery<PaginatedResult<PlantationCoordinateDto>>({
    queryKey: plantationCoordinatesQueryKeys.list(pagination),
    queryFn: () =>
      PlantationCoordinatesService.getPlantationCoordinatesPaginated(pagination, accessToken),
    enabled: !isInitialLoading,
    staleTime: 60 * 1000, // 1 minute
    refetchOnWindowFocus: false,
  });
}

// Hook to create plantation coordinate
export function useCreatePlantationCoordinate() {
  const { accessToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: CreatePlantationCoordinateRequest) =>
      PlantationCoordinatesService.createPlantationCoordinate(request, accessToken),
    onSuccess: () => {
      // Invalidate all coordinate lists to refetch
      queryClient.invalidateQueries({
        queryKey: plantationCoordinatesQueryKeys.lists(),
      });
    },
  });
}

// Hook to update plantation coordinate
export function useUpdatePlantationCoordinate() {
  const { accessToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: UpdatePlantationCoordinateRequest) =>
      PlantationCoordinatesService.updatePlantationCoordinate(request, accessToken),
    onSuccess: (data) => {
      // Invalidate the specific coordinate detail
      queryClient.invalidateQueries({
        queryKey: plantationCoordinatesQueryKeys.detail(data.id),
      });
      // Invalidate all coordinate lists
      queryClient.invalidateQueries({
        queryKey: plantationCoordinatesQueryKeys.lists(),
      });
    },
  });
}

// Hook to delete plantation coordinate
export function useDeletePlantationCoordinate() {
  const { accessToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      PlantationCoordinatesService.deletePlantationCoordinate(id, accessToken),
    onSuccess: (_, deletedId) => {
      // Remove the specific coordinate detail
      queryClient.removeQueries({
        queryKey: plantationCoordinatesQueryKeys.detail(deletedId),
      });
      // Invalidate all coordinate lists
      queryClient.invalidateQueries({
        queryKey: plantationCoordinatesQueryKeys.lists(),
      });
    },
  });
}
