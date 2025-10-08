import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { PaginationTable, type Column } from "@/components/pagination-table";
import type { PaginationController } from "@/types/pagination";
import {
  useSystemPromptsPaginated,
  useCreateSystemPrompt,
  useUpdateSystemPrompt,
  useDeleteSystemPrompt,
} from "@/hooks/use-system-prompts";
import type {
  SystemPromptDto,
  CreateSystemPromptRequest,
  UpdateSystemPromptRequest,
} from "@/services/system-prompts-service";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";

export const Route = createFileRoute("/dashboard/ai-management/system-prompt")({
  component: RouteComponent,
});

/**
 * Form data interface for create/update
 */
interface SystemPromptFormData {
  name: string;
  prompt: string;
  isActive: boolean;
}

/**
 * Custom hook to create a pagination controller for system prompts
 */
function useSystemPromptsPaginationController(): PaginationController<SystemPromptDto> {
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);
  const [sortKey, setSortKey] = React.useState<keyof SystemPromptDto | null>(
    null
  );
  const [sortDirection, setSortDirection] = React.useState<
    "asc" | "desc" | null
  >(null);
  const [search, setSearch] = React.useState<string>("");

  // Build pagination request
  const paginationRequest = React.useMemo(() => {
    const filters = [];

    // Add search filter if search term exists
    if (search) {
      filters.push({
        field: "name",
        operator: "contains",
        value: search,
      });
    }

    const orderBy =
      sortKey && sortDirection
        ? [{ field: String(sortKey), desc: sortDirection === "desc" }]
        : [];

    return {
      page,
      pageSize,
      filters,
      orderBy,
    };
  }, [page, pageSize, search, sortKey, sortDirection]);

  // Fetch data using React Query
  const { data, isLoading } = useSystemPromptsPaginated(paginationRequest);

  const setSort = React.useCallback(
    (key: keyof SystemPromptDto | null, direction: "asc" | "desc" | null) => {
      setSortKey(key);
      setSortDirection(direction);
      setPage(1); // Reset to first page on sort
    },
    []
  );

  return {
    data: data?.items ?? [],
    totalItems: data?.totalCount ?? 0,
    loading: isLoading,
    page,
    pageSize,
    setPage,
    setPageSize: (size: number) => {
      setPageSize(size);
      setPage(1); // Reset to first page on page size change
    },
    sortKey,
    sortDirection,
    setSort,
    search,
    setSearch: (value: string) => {
      setSearch(value);
      setPage(1); // Reset to first page on search
    },
  };
}

function RouteComponent() {
  const controller = useSystemPromptsPaginationController();

  // Mutation hooks
  const createMutation = useCreateSystemPrompt();
  const updateMutation = useUpdateSystemPrompt();
  const deleteMutation = useDeleteSystemPrompt();

  // Dialog state
  const [createDialogOpen, setCreateDialogOpen] = React.useState(false);
  const [editDialogOpen, setEditDialogOpen] = React.useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [selectedSystemPrompt, setSelectedSystemPrompt] =
    React.useState<SystemPromptDto | null>(null);

  // Form state
  const [formData, setFormData] = React.useState<SystemPromptFormData>({
    name: "",
    prompt: "",
    isActive: true,
  });

  // Reset form
  const resetForm = () => {
    setFormData({
      name: "",
      prompt: "",
      isActive: true,
    });
  };

  // Handle create
  const handleCreateOpen = () => {
    resetForm();
    setCreateDialogOpen(true);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const request: CreateSystemPromptRequest = {
        name: formData.name,
        prompt: formData.prompt,
        isActive: formData.isActive,
      };
      await createMutation.mutateAsync(request);
      setCreateDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error("Failed to create system prompt:", error);
    }
  };

  // Handle edit
  const handleEditOpen = (systemPrompt: SystemPromptDto) => {
    setSelectedSystemPrompt(systemPrompt);
    setFormData({
      name: systemPrompt.name,
      prompt: systemPrompt.prompt,
      isActive: systemPrompt.isActive,
    });
    setEditDialogOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSystemPrompt) return;

    try {
      const request: UpdateSystemPromptRequest = {
        id: selectedSystemPrompt.id,
        name: formData.name || undefined,
        prompt: formData.prompt || undefined,
        isActive: formData.isActive,
      };
      await updateMutation.mutateAsync(request);
      setEditDialogOpen(false);
      setSelectedSystemPrompt(null);
      resetForm();
    } catch (error) {
      console.error("Failed to update system prompt:", error);
    }
  };

  // Handle delete
  const handleDeleteOpen = (systemPrompt: SystemPromptDto) => {
    setSelectedSystemPrompt(systemPrompt);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedSystemPrompt) return;

    try {
      await deleteMutation.mutateAsync(selectedSystemPrompt.id);
      setDeleteDialogOpen(false);
      setSelectedSystemPrompt(null);
    } catch (error) {
      console.error("Failed to delete system prompt:", error);
    }
  };

  // Define columns
  const columns: Column<SystemPromptDto>[] = [
    {
      key: "name",
      label: "Name",
      sortable: true,
      render: (value) => <div className="font-medium">{value as string}</div>,
    },
    {
      key: "prompt",
      label: "Prompt Preview",
      sortable: true,
      render: (value) => (
        <div className="max-w-md truncate text-muted-foreground">
          {value as string}
        </div>
      ),
    },
    {
      key: "isActive",
      label: "Status",
      sortable: true,
      render: (value) => (
        <Badge variant={value ? "default" : "secondary"}>
          {value ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      key: "createdAt",
      label: "Created",
      sortable: true,
      render: (value) => (
        <div className="text-sm text-muted-foreground">
          {new Date(value as string).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </div>
      ),
    },
    {
      key: "updatedAt",
      label: "Updated",
      sortable: true,
      render: (value) => (
        <div className="text-sm text-muted-foreground">
          {value
            ? new Date(value as string).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })
            : "-"}
        </div>
      ),
    },
    {
      key: "id",
      label: "Actions",
      render: (_, row) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={(e) => {
              e.stopPropagation();
              handleEditOpen(row);
            }}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteOpen(row);
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            AI System Prompts
          </h1>
          <p className="text-muted-foreground">
            Configure system prompts that define your AI agent's behavior and
            personality
          </p>
        </div>
      </div>

      <PaginationTable
        columns={columns}
        controller={controller}
        searchable={true}
        searchPlaceholder="Search system prompts by name..."
        pageSizeOptions={[10, 20, 30, 50, 100]}
        actions={
          <Button size="sm" onClick={handleCreateOpen}>
            <Plus className="mr-2 h-4 w-4" />
            Add System Prompt
          </Button>
        }
        expandable={{
          render: (row) => (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="text-sm font-medium text-muted-foreground">
                    System Prompt ID
                  </div>
                  <div className="font-mono text-sm">{row.id}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm font-medium text-muted-foreground">
                    Status
                  </div>
                  <div>
                    <Badge variant={row.isActive ? "default" : "secondary"}>
                      {row.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </div>
                <div className="space-y-1 col-span-2">
                  <div className="text-sm font-medium text-muted-foreground">
                    Name
                  </div>
                  <div className="text-sm font-medium">{row.name}</div>
                </div>
                <div className="space-y-1 col-span-2">
                  <div className="text-sm font-medium text-muted-foreground">
                    Full Prompt
                  </div>
                  <div className="text-sm whitespace-pre-wrap bg-muted p-4 rounded-md max-h-96 overflow-y-auto">
                    {row.prompt || "No prompt provided"}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm font-medium text-muted-foreground">
                    Last Updated
                  </div>
                  <div className="text-sm">
                    {row.updatedAt
                      ? new Date(row.updatedAt).toLocaleString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "Never updated"}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm font-medium text-muted-foreground">
                    Created
                  </div>
                  <div className="text-sm">
                    {new Date(row.createdAt).toLocaleString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
              </div>
              <div className="flex gap-2 pt-2 border-t">
                <Badge variant="secondary">
                  {row.prompt.length} characters
                </Badge>
                <Badge variant={row.isActive ? "default" : "outline"}>
                  {row.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
            </div>
          ),
          getRowId: (row) => row.id,
        }}
      />

      {/* Create Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Create New System Prompt</DialogTitle>
            <DialogDescription>
              Add a new system prompt to define your AI agent's behavior. This
              prompt will guide the AI's responses and actions.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="create-name">
                  Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="create-name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Enter a descriptive name for this prompt"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="create-prompt">
                  System Prompt <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="create-prompt"
                  value={formData.prompt}
                  onChange={(e) =>
                    setFormData({ ...formData, prompt: e.target.value })
                  }
                  placeholder="You are a helpful AI assistant that specializes in agricultural technology. Your responses should be clear, accurate, and focused on helping users manage their plantations effectively..."
                  rows={12}
                  className="resize-none font-mono text-sm"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Define the AI's personality, expertise, tone, and any specific
                  guidelines it should follow.
                </p>
              </div>
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <Label htmlFor="create-active">Active</Label>
                  <p className="text-xs text-muted-foreground">
                    Set this prompt as active for immediate use
                  </p>
                </div>
                <Switch
                  id="create-active"
                  checked={formData.isActive}
                  onCheckedChange={(checked: boolean) =>
                    setFormData({ ...formData, isActive: checked })
                  }
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setCreateDialogOpen(false)}
                disabled={createMutation.isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Create Prompt
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Edit System Prompt</DialogTitle>
            <DialogDescription>
              Update the system prompt to modify your AI agent's behavior and
              response style.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-name">Name</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Enter a descriptive name for this prompt"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-prompt">System Prompt</Label>
                <Textarea
                  id="edit-prompt"
                  value={formData.prompt}
                  onChange={(e) =>
                    setFormData({ ...formData, prompt: e.target.value })
                  }
                  placeholder="Enter the system prompt..."
                  rows={12}
                  className="resize-none font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  Update the AI's behavior guidelines and personality traits.
                </p>
              </div>
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <Label htmlFor="edit-active">Active</Label>
                  <p className="text-xs text-muted-foreground">
                    Toggle to activate or deactivate this prompt
                  </p>
                </div>
                <Switch
                  id="edit-active"
                  checked={formData.isActive}
                  onCheckedChange={(checked: boolean) =>
                    setFormData({ ...formData, isActive: checked })
                  }
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditDialogOpen(false)}
                disabled={updateMutation.isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Update Prompt
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Delete System Prompt</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this system prompt? This action
              cannot be undone and may affect your AI agent's behavior.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="rounded-lg bg-muted p-4 space-y-2">
              <div className="space-y-1">
                <span className="font-medium text-sm">Name:</span>
                <div className="text-sm font-medium">
                  {selectedSystemPrompt?.name}
                </div>
              </div>
              <div className="space-y-1">
                <span className="font-medium text-sm">Prompt Preview:</span>
                <div className="text-sm text-muted-foreground line-clamp-5">
                  {selectedSystemPrompt?.prompt}
                </div>
              </div>
              <div className="space-y-1">
                <span className="font-medium text-sm">Status:</span>
                <div>
                  <Badge
                    variant={
                      selectedSystemPrompt?.isActive ? "default" : "secondary"
                    }
                  >
                    {selectedSystemPrompt?.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>
              <div className="space-y-1">
                <span className="font-medium text-sm">Created:</span>
                <div className="text-sm">
                  {selectedSystemPrompt &&
                    new Date(
                      selectedSystemPrompt.createdAt
                    ).toLocaleDateString()}
                </div>
              </div>
              <div className="space-y-1">
                <span className="font-medium text-sm">Characters:</span>
                <div className="text-sm">
                  {selectedSystemPrompt?.prompt.length ?? 0}
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={deleteMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Delete Prompt
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
