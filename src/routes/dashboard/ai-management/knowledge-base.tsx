import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { PaginationTable, type Column } from "@/components/pagination-table";
import type { PaginationController } from "@/types/pagination";
import {
  useKnowledgeBasesPaginated,
  useCreateKnowledgeBase,
  useUpdateKnowledgeBase,
  useDeleteKnowledgeBase,
} from "@/hooks/use-knowledge-bases";
import type {
  KnowledgeBaseDto,
  CreateKnowledgeBaseRequest,
  UpdateKnowledgeBaseRequest,
} from "@/services/knowledge-bases-service";
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

export const Route = createFileRoute("/dashboard/ai-management/knowledge-base")({
  component: RouteComponent,
});

/**
 * Form data interface for create/update
 */
interface KnowledgeBaseFormData {
  title: string;
  content: string;
}

/**
 * Custom hook to create a pagination controller for knowledge bases
 */
function useKnowledgeBasesPaginationController(): PaginationController<KnowledgeBaseDto> {
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);
  const [sortKey, setSortKey] = React.useState<keyof KnowledgeBaseDto | null>(
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
        field: "title",
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
  const { data, isLoading } = useKnowledgeBasesPaginated(paginationRequest);

  const setSort = React.useCallback(
    (key: keyof KnowledgeBaseDto | null, direction: "asc" | "desc" | null) => {
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
  const controller = useKnowledgeBasesPaginationController();

  // Mutation hooks
  const createMutation = useCreateKnowledgeBase();
  const updateMutation = useUpdateKnowledgeBase();
  const deleteMutation = useDeleteKnowledgeBase();

  // Dialog state
  const [createDialogOpen, setCreateDialogOpen] = React.useState(false);
  const [editDialogOpen, setEditDialogOpen] = React.useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [selectedKnowledgeBase, setSelectedKnowledgeBase] =
    React.useState<KnowledgeBaseDto | null>(null);

  // Form state
  const [formData, setFormData] = React.useState<KnowledgeBaseFormData>({
    title: "",
    content: "",
  });

  // Reset form
  const resetForm = () => {
    setFormData({
      title: "",
      content: "",
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
      const request: CreateKnowledgeBaseRequest = {
        title: formData.title,
        content: formData.content,
      };
      await createMutation.mutateAsync(request);
      setCreateDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error("Failed to create knowledge base:", error);
    }
  };

  // Handle edit
  const handleEditOpen = (knowledgeBase: KnowledgeBaseDto) => {
    setSelectedKnowledgeBase(knowledgeBase);
    setFormData({
      title: knowledgeBase.title,
      content: knowledgeBase.content,
    });
    setEditDialogOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedKnowledgeBase) return;

    try {
      const request: UpdateKnowledgeBaseRequest = {
        id: selectedKnowledgeBase.id,
        title: formData.title || undefined,
        content: formData.content || undefined,
      };
      await updateMutation.mutateAsync(request);
      setEditDialogOpen(false);
      setSelectedKnowledgeBase(null);
      resetForm();
    } catch (error) {
      console.error("Failed to update knowledge base:", error);
    }
  };

  // Handle delete
  const handleDeleteOpen = (knowledgeBase: KnowledgeBaseDto) => {
    setSelectedKnowledgeBase(knowledgeBase);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedKnowledgeBase) return;

    try {
      await deleteMutation.mutateAsync(selectedKnowledgeBase.id);
      setDeleteDialogOpen(false);
      setSelectedKnowledgeBase(null);
    } catch (error) {
      console.error("Failed to delete knowledge base:", error);
    }
  };

  // Define columns
  const columns: Column<KnowledgeBaseDto>[] = [
    {
      key: "title",
      label: "Title",
      sortable: true,
      render: (value) => <div className="font-medium">{value as string}</div>,
    },
    {
      key: "content",
      label: "Content Preview",
      render: (value) => (
        <div className="max-w-md truncate text-muted-foreground">
          {value ? (value as string) : "-"}
        </div>
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
            AI Knowledge Base
          </h1>
          <p className="text-muted-foreground">
            Manage and organize your AI agent's knowledge repository
          </p>
        </div>
      </div>

      <PaginationTable
        columns={columns}
        controller={controller}
        searchable={true}
        searchPlaceholder="Search knowledge base by title..."
        pageSizeOptions={[10, 20, 30, 50, 100]}
        actions={
          <Button size="sm" onClick={handleCreateOpen}>
            <Plus className="mr-2 h-4 w-4" />
            Add Knowledge
          </Button>
        }
        expandable={{
          render: (row) => (
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-1">
                  <div className="text-sm font-medium text-muted-foreground">
                    Knowledge Base ID
                  </div>
                  <div className="font-mono text-sm">{row.id}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm font-medium text-muted-foreground">
                    Full Content
                  </div>
                  <div className="text-sm whitespace-pre-wrap bg-muted p-4 rounded-md max-h-96 overflow-y-auto">
                    {row.content || "No content provided"}
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
              </div>
              <div className="flex gap-2 pt-2 border-t">
                <Badge variant="secondary">
                  {row.content.length} characters
                </Badge>
                <Badge variant="outline">
                  Created: {new Date(row.createdAt).toLocaleDateString()}
                </Badge>
              </div>
            </div>
          ),
          getRowId: (row) => row.id,
        }}
      />

      {/* Create Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Create New Knowledge Base Entry</DialogTitle>
            <DialogDescription>
              Add a new entry to your AI agent's knowledge base. Fill in all
              required fields.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="create-title">
                  Title <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="create-title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="Enter knowledge title"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="create-content">
                  Content <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="create-content"
                  value={formData.content}
                  onChange={(e) =>
                    setFormData({ ...formData, content: e.target.value })
                  }
                  placeholder="Enter the knowledge content..."
                  rows={10}
                  className="resize-none font-mono text-sm"
                  required
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
                Create Knowledge
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Knowledge Base Entry</DialogTitle>
            <DialogDescription>
              Update the knowledge base information. Leave fields empty to keep
              current values.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-title">Title</Label>
                <Input
                  id="edit-title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="Enter knowledge title"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-content">Content</Label>
                <Textarea
                  id="edit-content"
                  value={formData.content}
                  onChange={(e) =>
                    setFormData({ ...formData, content: e.target.value })
                  }
                  placeholder="Enter the knowledge content..."
                  rows={10}
                  className="resize-none font-mono text-sm"
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
                Update Knowledge
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Delete Knowledge Base Entry</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this knowledge base entry? This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="rounded-lg bg-muted p-4 space-y-2">
              <div className="space-y-1">
                <span className="font-medium text-sm">Title:</span>
                <div className="text-sm">{selectedKnowledgeBase?.title}</div>
              </div>
              <div className="space-y-1">
                <span className="font-medium text-sm">Content Preview:</span>
                <div className="text-sm text-muted-foreground line-clamp-3">
                  {selectedKnowledgeBase?.content}
                </div>
              </div>
              <div className="space-y-1">
                <span className="font-medium text-sm">Created:</span>
                <div className="text-sm">
                  {selectedKnowledgeBase &&
                    new Date(
                      selectedKnowledgeBase.createdAt
                    ).toLocaleDateString()}
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
              Delete Knowledge
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
