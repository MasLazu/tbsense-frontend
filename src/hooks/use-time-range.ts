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
        startTime: new Date(0).toISOString(), // Unix epoch (Jan 1, 1970)
        endTime: now.toISOString(),
      };
    case "This day":
      return {
        startTime: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        endTime: now.toISOString(),
      };
    case "This week":
      return {
        startTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        endTime: now.toISOString(),
      };
    case "This month":
      return {
        startTime: new Date(
          Date.now() - 30 * 24 * 60 * 60 * 1000
        ).toISOString(),
        endTime: now.toISOString(),
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
    queryFn: () => DEFAULT_TIME_RANGE,
    staleTime: Infinity, // Keep the state fresh
    gcTime: Infinity, // Don't garbage collect
  });

  // Calculate actual time range parameters
  const params = useMemo(() => {
    return calculateTimeRange(
      timeRangeState.preset,
      timeRangeState.startTime,
      timeRangeState.endTime
    );
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
