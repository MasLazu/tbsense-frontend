"use client";

import * as React from "react";
import { Sparkles, Trophy, Award, Crown } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardAction,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorChartCell } from "@/components/error-chart-cell";
import { cn } from "@/lib/utils";
import { useTimeRange } from "@/hooks/use-time-range";
import { useTopPlantationsByAvgHarvest } from "@/hooks/use-bar-charts";
import type { TopPlantationsByAvgHarvestParams } from "@/services/global-bar-chart-service";

export interface TopPlantationsRankCardProps {
  className?: string;
  limit?: number;
  params?: TopPlantationsByAvgHarvestParams;
  /** Provide a custom AI suggestion text. When omitted, a summary is generated from the ranking data. */
  aiSuggestionOverride?: string;
  /** Label shown at the top of the card */
  title?: string;
  /** Optional description rendered under the title */
  subtitle?: string;
}

function formatNumber(value?: number, options?: Intl.NumberFormatOptions) {
  if (value === undefined || value === null || Number.isNaN(value)) {
    return "—";
  }

  return new Intl.NumberFormat(undefined, options).format(value);
}

function useRankData(
  limit?: number,
  params?: TopPlantationsByAvgHarvestParams
) {
  const { params: timeRangeParams } = useTimeRange();

  const queryParams = React.useMemo(() => {
    return {
      startDate: params?.startDate ?? timeRangeParams.startTime,
      endDate: params?.endDate ?? timeRangeParams.endTime,
      limit: params?.limit ?? limit,
    } satisfies TopPlantationsByAvgHarvestParams;
  }, [
    limit,
    params?.startDate,
    params?.endDate,
    params?.limit,
    timeRangeParams,
  ]);

  return useTopPlantationsByAvgHarvest(queryParams);
}

function useAiSuggestion(
  aiSuggestionOverride: string | undefined,
  plantations: ReturnType<typeof useRankData>["data"]
) {
  return React.useMemo(() => {
    if (aiSuggestionOverride) return aiSuggestionOverride;

    const items = plantations?.items ?? [];
    if (!items.length) {
      return "No ranking insights yet. Try adjusting the date range or limit to fetch more data.";
    }

    const [top, second] = items;
    const total = plantations?.totalPlantations ?? items.length;
    const topYield = formatNumber(top?.averageYieldKg, {
      maximumFractionDigits: 2,
      minimumFractionDigits: 0,
    });

    const parts = [
      `${top?.plantationName} leads the list with an average yield of ${topYield} kg per harvest.`,
    ];

    if (second) {
      const delta =
        top && second ? top.averageYieldKg - second.averageYieldKg : undefined;
      const deltaText =
        delta !== undefined && !Number.isNaN(delta)
          ? `${delta > 0 ? "+" : ""}${formatNumber(delta, {
              maximumFractionDigits: 1,
            })} kg`
          : undefined;
      parts.push(
        `${second.plantationName} is close behind${
          deltaText ? ` (${deltaText})` : ""
        }. Explore their practices to replicate their performance.`
      );
    }

    parts.push(
      `Monitoring ${total} plantation${
        total === 1 ? "" : "s"
      } in total helps spot improvement opportunities quickly.`
    );

    return parts.join(" ");
  }, [aiSuggestionOverride, plantations]);
}

function RankListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/30 p-3"
        >
          <div className="flex items-center gap-3">
            <Skeleton className="h-8 w-8 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
          <div className="text-right space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
      ))}
    </div>
  );
}

function getRankIcon(index: number) {
  if (index === 0) return <Crown className="h-4 w-4 text-primary" />;
  if (index === 1) return <Award className="h-4 w-4 text-secondary" />;
  if (index === 2) return <Award className="h-4 w-4 text-muted-foreground" />;
  return null;
}

function getRankStyle(index: number) {
  if (index === 0) return "text-primary font-bold";
  if (index === 1) return "text-secondary font-semibold";
  if (index === 2) return "text-muted-foreground font-semibold";
  return "text-muted-foreground";
}

export function TopPlantationsRankCard({
  className,
  limit = 5,
  params,
  aiSuggestionOverride,
  title = "Top Yielding Plantations",
  subtitle = "Highest performers by average harvest yield",
}: TopPlantationsRankCardProps) {
  const [isPopoverOpen, setIsPopoverOpen] = React.useState(false);
  const [isPopoverLoading, setIsPopoverLoading] = React.useState(false);
  const [displayedSuggestion, setDisplayedSuggestion] = React.useState("");

  const query = useRankData(limit, params);
  const plantations = query.data?.items ?? [];

  const aiSuggestion = useAiSuggestion(aiSuggestionOverride, query.data);

  React.useEffect(() => {
    if (!isPopoverOpen) {
      setDisplayedSuggestion("");
      setIsPopoverLoading(false);
      return;
    }

    setIsPopoverLoading(true);
    setDisplayedSuggestion("");

    let streamInterval: number | undefined;
    const loadingTimeout = setTimeout(() => {
      setIsPopoverLoading(false);
      let currentIndex = 0;
      streamInterval = window.setInterval(() => {
        const nextText = aiSuggestion.slice(0, currentIndex + 1);
        setDisplayedSuggestion(nextText);
        currentIndex += 1;
        if (currentIndex >= aiSuggestion.length) {
          window.clearInterval(streamInterval);
        }
      }, 30);
    }, 600);

    return () => {
      clearTimeout(loadingTimeout);
      if (streamInterval !== undefined) {
        window.clearInterval(streamInterval);
      }
      setDisplayedSuggestion("");
      setIsPopoverLoading(false);
    };
  }, [isPopoverOpen, aiSuggestion]);

  if (query.isError) {
    return (
      <ErrorChartCell
        title={title}
        error={query.error instanceof Error ? query.error.message : undefined}
        onRetry={query.refetch}
      />
    );
  }

  return (
    <Card className={cn("gap-0", className)}>
      <CardHeader className="pb-0">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Trophy className="h-5 w-5" />
          </div>
          <div>
            <CardTitle className="text-base sm:text-lg font-semibold">
              {title}
            </CardTitle>
            {subtitle ? (
              <CardDescription className="text-xs sm:text-sm">
                {subtitle}
              </CardDescription>
            ) : null}
          </div>
        </div>
        <CardAction>
          <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
            <PopoverTrigger asChild>
              <Button
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0 text-primary hover:bg-primary/5"
                disabled={query.isLoading || !plantations.length}
              >
                <Sparkles className="h-4 w-4" />
                <span className="sr-only">Reveal AI insight</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="w-80 p-4 border-border shadow-lg"
              align="end"
              sideOffset={8}
            >
              <div className="flex items-start gap-3">
                <div className="flex-1 space-y-2">
                  <p className="text-xs font-medium text-muted-foreground">
                    AI Assistant Insight
                  </p>
                  <div className="rounded-lg border border-border bg-muted/40 p-3">
                    {isPopoverLoading ? (
                      <div className="flex gap-1">
                        <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/60" />
                        <span
                          className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/60"
                          style={{ animationDelay: "120ms" }}
                        />
                        <span
                          className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/60"
                          style={{ animationDelay: "240ms" }}
                        />
                      </div>
                    ) : (
                      <p className="text-sm leading-relaxed text-foreground">
                        {displayedSuggestion}
                        <span className="ml-1 inline-block h-4 w-0.5 animate-pulse bg-foreground/70" />
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Sparkles className="h-5 w-5" />
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </CardAction>
      </CardHeader>

      <CardContent className="py-6">
        {query.isLoading ? (
          <RankListSkeleton count={limit} />
        ) : plantations.length ? (
          <div className="space-y-3">
            {plantations.map((plantation, index) => (
              <div
                key={
                  plantation.plantationId ||
                  `${plantation.plantationName}-${index}`
                }
                className="flex items-center justify-between rounded-lg border border-border/60 bg-background/60 p-3"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted/60">
                    {getRankIcon(index) || (
                      <span className="text-xs font-semibold text-muted-foreground">
                        #{index + 1}
                      </span>
                    )}
                  </div>
                  <div>
                    <p
                      className={cn("text-sm font-medium", getRankStyle(index))}
                    >
                      {plantation.plantationName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatNumber(plantation.harvestCount)} harvest
                      {plantation.harvestCount === 1 ? "" : "s"}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-foreground sm:text-base">
                    {formatNumber(plantation.averageYieldKg, {
                      maximumFractionDigits: 2,
                      minimumFractionDigits: 0,
                    })}
                  </p>
                  <p className="text-xs text-muted-foreground">kg / harvest</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex h-32 items-center justify-center rounded-lg border border-dashed border-border/60 bg-muted/20">
            <p className="text-sm text-muted-foreground">
              No ranking data available for the selected range.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
