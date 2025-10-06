"use client";

import { AlertCircle, RefreshCw } from "lucide-react";

interface ErrorChartCellProps {
  title?: string;
  error?: string;
  onRetry?: () => void;
}

export function ErrorChartCell({
  title = "Chart",
  error = "Failed to load data",
  onRetry,
}: ErrorChartCellProps) {
  return (
    <div className="relative w-full rounded-lg border border-red-200 bg-red-50 p-4 h-full shadow-sm">
      <div className="flex gap-3">
        <AlertCircle className="h-4 w-4 text-destructive flex-shrink-0 mt-0.5" />
        <div className="flex-1 space-y-1">
          <h5 className="text-sm font-medium text-destructive">{title}</h5>
          <p className="text-sm text-destructive">{error}</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-destructive transition-colors"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Retry
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
