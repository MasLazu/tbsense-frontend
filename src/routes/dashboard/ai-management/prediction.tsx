import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  useModelsPaginated,
  useDownloadModel,
  useCreateModel,
  useActivateModel,
} from "@/hooks/use-models";
import { ModelCard } from "@/components/ModelCard";
import { CreateModelDialog } from "@/components/CreateModelDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ChevronLeft,
  ChevronRight,
  Search,
  Brain,
  Loader2,
  RefreshCw,
} from "lucide-react";
import type { CreateModelRequest } from "@/services/models-service";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard/ai-management/prediction")({
  component: RouteComponent,
});

function RouteComponent() {
  const [pageNumber, setPageNumber] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [downloadingModelId, setDownloadingModelId] = useState<string | null>(
    null
  );
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [confirmActivateModel, setConfirmActivateModel] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [isActivating, setIsActivating] = useState(false);
  const pageSize = 12;

  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useModelsPaginated({
    page: pageNumber,
    orderBy: [{ field: "name", desc: false }],
    pageSize,
  });

  const downloadModelMutation = useDownloadModel();
  const createModelMutation = useCreateModel();
  const activateModelMutation = useActivateModel();

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await queryClient.invalidateQueries({
        queryKey: ["models"],
      });
    } catch (error) {
      console.error("Failed to refresh models:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleDownload = async (id: string) => {
    setDownloadingModelId(id);
    try {
      const blob = await downloadModelMutation.mutateAsync(id);

      // Get the model details to use a better filename
      const model = data?.items.find((m) => m.id === id);
      const fileName = model?.filePath
        ? model.filePath.split("/").pop() || `model-${id}.pkl`
        : `model-${id}.pkl`;

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      console.log("Download Started", `Model ${fileName} is being downloaded.`);
    } catch (error) {
      console.error(
        "Download Failed",
        `Failed to download model: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
      // You could show a toast notification here
      alert(
        `Failed to download model: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setDownloadingModelId(null);
    }
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setPageNumber(1);
  };

  const handleSetAsUsed = (id: string, name: string) => {
    setConfirmActivateModel({ id, name });
  };

  const handleConfirmActivate = async () => {
    if (!confirmActivateModel) return;

    setIsActivating(true);
    try {
      await activateModelMutation.mutateAsync(confirmActivateModel.id);
      console.log(
        "Model Activated",
        "This model is now set as the active model."
      );
    } catch (error) {
      console.error(
        "Failed to Activate",
        error instanceof Error
          ? error.message
          : "Failed to set model as active."
      );
    } finally {
      setIsActivating(false);
      setConfirmActivateModel(null);
    }
  };

  const handleCreateModel = async (request: CreateModelRequest) => {
    setIsCreating(true);
    try {
      await createModelMutation.mutateAsync(request);
      console.log(
        "Model Created",
        "Your model has been created and training has started."
      );
    } catch (error) {
      console.error("Creation Failed", "Failed to create the model.");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Brain className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-4xl font-bold">AI Models Training Center</h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Manage and monitor your regression models for tree growth prediction
          </p>
        </div>

        {/* Actions Bar */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search models..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex items-center gap-4">
            {data && (
              <div className="text-sm text-muted-foreground">
                Showing {(pageNumber - 1) * pageSize + 1}-
                {Math.min(pageNumber * pageSize, data.totalCount)} of{" "}
                {data.totalCount} models
              </div>
            )}
            <Button
              variant="outline"
              size="icon"
              onClick={handleRefresh}
              disabled={isRefreshing}
              title="Refresh models"
            >
              <RefreshCw
                className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`}
              />
            </Button>
            <CreateModelDialog
              onCreateModel={handleCreateModel}
              isCreating={isCreating}
            />
          </div>
        </div>

        {/* Models Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : isError ? (
          <div className="text-center py-20">
            <p className="text-destructive">
              Failed to load models. Please try again.
            </p>
          </div>
        ) : data && data.items.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
              {data.items.map((model) => (
                <ModelCard
                  key={model.id}
                  model={model}
                  onDownload={handleDownload}
                  onSetAsUsed={handleSetAsUsed}
                  isDownloading={downloadingModelId === model.id}
                />
              ))}
            </div>

            {/* Pagination */}
            {data.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setPageNumber((prev) => Math.max(1, prev - 1))}
                  disabled={pageNumber === 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>

                <div className="flex items-center gap-1">
                  {Array.from(
                    { length: Math.min(5, data.totalPages) },
                    (_, i) => {
                      let pageNum;
                      if (data.totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (pageNumber <= 3) {
                        pageNum = i + 1;
                      } else if (pageNumber >= data.totalPages - 2) {
                        pageNum = data.totalPages - 4 + i;
                      } else {
                        pageNum = pageNumber - 2 + i;
                      }

                      return (
                        <Button
                          key={pageNum}
                          variant={
                            pageNumber === pageNum ? "default" : "outline"
                          }
                          size="icon"
                          onClick={() => setPageNumber(pageNum)}
                        >
                          {pageNum}
                        </Button>
                      );
                    }
                  )}
                </div>

                <Button
                  variant="outline"
                  size="icon"
                  onClick={() =>
                    setPageNumber((prev) => Math.min(data.totalPages, prev + 1))
                  }
                  disabled={pageNumber === data.totalPages}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20">
            <p className="text-muted-foreground">No models found.</p>
          </div>
        )}

        {/* Confirmation Dialog for Activating Model */}
        <Dialog
          open={!!confirmActivateModel}
          onOpenChange={(open) => !open && setConfirmActivateModel(null)}
        >
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Activate Model</DialogTitle>
              <DialogDescription>
                Are you sure you want to activate the model{" "}
                <strong>{confirmActivateModel?.name}</strong>? This will set it
                as the active model for predictions.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setConfirmActivateModel(null)}
                disabled={isActivating}
              >
                Cancel
              </Button>
              <Button onClick={handleConfirmActivate} disabled={isActivating}>
                {isActivating && (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                )}
                {isActivating ? "Activating..." : "Activate Model"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
