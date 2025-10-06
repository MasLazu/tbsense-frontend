"use client";

import * as React from "react";
import { useQueryClient, useIsFetching } from "@tanstack/react-query";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TimeRangePicker } from "./time-range-picker";
import type { TimeRange } from "./time-range-picker";
import { useTimeRange } from "@/hooks/use-time-range";

interface TimeRangeProviderProps {
  invalidateKeys?: readonly (readonly unknown[])[];
  loadingKeys?: readonly (readonly unknown[])[];
  children?: React.ReactNode;
  className?: string;
  showRefresh?: boolean;
}

export function TimeRangeProvider({
  invalidateKeys,
  loadingKeys,
  children,
  className = "flex items-center gap-4",
  showRefresh = true,
}: TimeRangeProviderProps) {
  const queryClient = useQueryClient();
  const { preset, startTime, endTime, params, setCustomRange } = useTimeRange();

  // Check if any queries are fetching
  const isFetching =
    useIsFetching({
      queryKey: loadingKeys?.[0], // If specific keys provided, check the first one
    }) > 0;

  // Handle refresh button click
  const handleRefresh = React.useCallback(() => {
    if (invalidateKeys && invalidateKeys.length > 0) {
      // Invalidate specific query keys
      invalidateKeys.forEach((key) => {
        queryClient.invalidateQueries({ queryKey: key });
      });
    } else {
      // Invalidate all queries
      queryClient.invalidateQueries();
    }
  }, [queryClient, invalidateKeys]);

  // Handle time range change from picker
  const handleRangeChange = React.useCallback(
    (range: TimeRange) => {
      setCustomRange(range.from.toISOString(), range.to.toISOString());
    },
    [setCustomRange]
  );

  // Calculate default value for the picker
  const defaultValue = React.useMemo(() => {
    if (startTime && endTime) {
      return { from: new Date(startTime), to: new Date(endTime) };
    }

    if (preset !== "custom" && params.startTime && params.endTime) {
      return {
        label: preset,
        from: new Date(params.startTime),
        to: new Date(params.endTime),
      };
    }

    // Default to "All Time"
    return {
      label: "All Time",
      from: new Date(0), // Unix epoch (Jan 1, 1970)
      to: new Date(),
    };
  }, [preset, startTime, endTime, params]);

  return (
    <div className={className}>
      <div className="flex-none">
        <TimeRangePicker
          defaultValue={defaultValue}
          onRangeChange={handleRangeChange}
        />
      </div>

      {showRefresh && (
        <div>
          <Button
            variant="outline"
            disabled={isFetching}
            size="icon"
            onClick={handleRefresh}
          >
            <RefreshCw
              className={isFetching ? "h-4 w-4 animate-spin" : "h-4 w-4"}
            />
          </Button>
        </div>
      )}

      {children}
    </div>
  );
}
