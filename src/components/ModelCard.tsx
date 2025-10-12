import type { ModelDto } from "@/services/models-service";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Download,
  TrendingUp,
  Calendar,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface ModelCardProps {
  model: ModelDto;
  onDownload: (id: string) => void;
  onSetAsUsed: (id: string) => void;
  isDownloading?: boolean;
}

const getStatusColor = (status: ModelDto["trainingStatus"]) => {
  switch (status) {
    case "Completed":
      return "bg-green-50 text-green-500 border border-green-200";
    case "training":
      return "bg-yellow-50 text-yellow-500 border border-yellow-200";
    case "pending":
      return "bg-orange-50 text-orange-500 border border-orange-200";
    case "failed":
      return "bg-red-50 text-red-500 border border-red-200";
    default:
      return "bg-muted text-muted-foreground";
  }
};

const getR2ScoreColor = (score?: number) => {
  if (!score) return "text-muted-foreground";
  if (score >= 0.8) return "text-blue-500";
  if (score >= 0.6) return "text-green-500";
  if (score >= 0.3) return "text-orange-500";
  return "text-destructive";
};

export const ModelCard = ({
  model,
  onDownload,
  onSetAsUsed,
  isDownloading = false,
}: ModelCardProps) => {
  return (
    <Card
      className={cn(
        "hover:shadow-lg transition-all duration-300",
        model.isUsed && "ring-2 ring-accent"
      )}
    >
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg font-semibold truncate">
              {model.name || "Unnamed Model"}
            </CardTitle>
          </div>
          {model.isUsed && (
            <Badge
              variant="outline"
              className="w-fit border-secondary text-secondary bg-secondary/10"
            >
              <CheckCircle2 className="w-3 h-3 mr-1" />
              Active Model
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex items-center text-sm text-muted-foreground justify-between">
          <div className="flex items-center">
            <Calendar className="w-4 h-4 mr-2" />
            <span>
              {format(new Date(model.trainingDataStart), "MMM d, yyyy")} -{" "}
              {format(new Date(model.trainingDataEnd), "MMM d, yyyy")}
            </span>
          </div>
          <Badge
            className={cn(
              "capitalize shrink-0",
              getStatusColor(model.trainingStatus)
            )}
          >
            {model.trainingStatus}
          </Badge>
        </div>

        {model.trainingStatus === "Completed" && (
          <div className="space-y-2 pt-2 border-t">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground flex items-center">
                <TrendingUp className="w-3 h-3 mr-1" />
                R² Score
              </span>
              <span
                className={cn(
                  "font-mono font-semibold text-lg",
                  getR2ScoreColor(model.r2Score)
                )}
              >
                {model.r2Score?.toFixed(4) || "N/A"}
              </span>
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex gap-2">
        {!model.isUsed && model.trainingStatus === "Completed" && (
          <Button
            variant="default"
            className="flex-1"
            onClick={() => onSetAsUsed(model.id)}
          >
            <CheckCircle2 className="w-4 h-4 mr-2" />
            Set as Active
          </Button>
        )}
        <Button
          variant="outline"
          className={cn(
            model.isUsed || model.trainingStatus !== "Completed"
              ? "w-full"
              : "flex-1"
          )}
          onClick={() => onDownload(model.id)}
          disabled={model.trainingStatus !== "Completed"}
        >
          {isDownloading ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Download className="w-4 h-4 mr-2" />
          )}
          {isDownloading ? "Downloading..." : "Download"}
        </Button>
      </CardFooter>
    </Card>
  );
};
