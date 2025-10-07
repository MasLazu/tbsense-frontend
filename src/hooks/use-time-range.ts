"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";

export type TimeRangePreset =
  | "All Time"
  | "This day"
  | "This week"
  | "This month"
  | "custom";

export interface TimeRangeState {
  preset: TimeRangePreset;
  startTime?: string;
  endTime?: string;
}

export interface TimeRangeParams {
  startTime: string;
  endTime: string;
}

const TIME_RANGE_QUERY_KEY = ["timeRange"] as const;

const DEFAULT_TIME_RANGE: TimeRangeState = {
  preset: "All Time",
  startTime: undefined,
  endTime: undefined,
};

// Helper function to calculate time range based on preset
function calculateTimeRange(
  preset: TimeRangePreset,
  customStart?: string,
  customEnd?: string
): TimeRangeParams {
  const now = new Date();

  if (preset === "custom" && customStart && customEnd) {
    return {
      startTime: customStart,
      endTime: customEnd,
    };
  }

  switch (preset) {
    case "All Time":
      return {
        startTime: new Date(0).toISOString(), // Unix epoch
        endTime: new Date(
          Date.now() + 100 * 365 * 24 * 60 * 60 * 1000
        ).toISOString(), // 100 years from now for stability
      };
    case "This day":
      return {
        startTime: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        endTime: new Date(
          Date.now() + 100 * 365 * 24 * 60 * 60 * 1000
        ).toISOString(), // Stable future date
      };
    case "This week":
      return {
        startTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        endTime: new Date(
          Date.now() + 100 * 365 * 24 * 60 * 60 * 1000
        ).toISOString(), // Stable future date
      };
    case "This month":
      return {
        startTime: new Date(
          Date.now() - 30 * 24 * 60 * 60 * 1000
        ).toISOString(),
        endTime: new Date(
          Date.now() + 100 * 365 * 24 * 60 * 60 * 1000
        ).toISOString(), // Stable future date
      };
    default:
      // Default to "All Time"
      return {
        startTime: new Date(0).toISOString(),
        endTime: now.toISOString(),
      };
  }
}

export function useTimeRange() {
  const queryClient = useQueryClient();

  // Get current time range state
  const { data: timeRangeState = DEFAULT_TIME_RANGE } = useQuery({
    queryKey: TIME_RANGE_QUERY_KEY,
    queryFn: () => {
      console.log(
        "[useTimeRange] queryFn called - returning DEFAULT_TIME_RANGE"
      );
      return DEFAULT_TIME_RANGE;
    },
    staleTime: Infinity, // Keep the state fresh
    gcTime: Infinity, // Don't garbage collect
    refetchOnMount: false,
  });

  console.log("[useTimeRange] Current state:", timeRangeState);

  // Calculate actual time range parameters
  const params = useMemo(() => {
    const calculated = calculateTimeRange(
      timeRangeState.preset,
      timeRangeState.startTime,
      timeRangeState.endTime
    );
    console.log("[useTimeRange] Calculated params:", calculated);
    return calculated;
  }, [timeRangeState]);

  // Mutation to update time range
  const updateTimeRange = useMutation({
    mutationFn: async (newState: Partial<TimeRangeState>) => {
      const currentState =
        queryClient.getQueryData(TIME_RANGE_QUERY_KEY) || DEFAULT_TIME_RANGE;
      const updatedState = { ...currentState, ...newState };
      queryClient.setQueryData(TIME_RANGE_QUERY_KEY, updatedState);
      return updatedState;
    },
  });

  // Helper functions
  const setPreset = (preset: TimeRangePreset) => {
    updateTimeRange.mutate({
      preset,
      startTime: undefined,
      endTime: undefined,
    });
  };

  const setCustomRange = (startTime: string, endTime: string) => {
    updateTimeRange.mutate({
      preset: "custom",
      startTime,
      endTime,
    });
  };

  const resetToDefault = () => {
    updateTimeRange.mutate(DEFAULT_TIME_RANGE);
  };

  return {
    // Current state
    preset: timeRangeState.preset,
    startTime: timeRangeState.startTime,
    endTime: timeRangeState.endTime,

    // Calculated parameters for API calls
    params,

    // Actions
    setPreset,
    setCustomRange,
    resetToDefault,

    // Raw mutation for advanced usage
    updateTimeRange: updateTimeRange.mutate,
    isUpdating: updateTimeRange.isPending,
  };
}
