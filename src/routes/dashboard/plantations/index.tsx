import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { PaginationTable, type Column } from "@/components/pagination-table";
import type { PaginationController } from "@/types/pagination";
import {
  usePlantationsPaginated,
  useCreatePlantation,
  useUpdatePlantation,
  useDeletePlantation,
} from "@/hooks/use-plantations";
import type {
  PlantationDto,
  CreatePlantationRequest,
  UpdatePlantationRequest,
} from "@/services/plantations-service";
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
import { DatePicker } from "@/components/ui/date-picker";

export const Route = createFileRoute("/dashboard/plantations/")({
  component: RouteComponent,
});

/**
 * Form data interface for create/update
 */
interface PlantationFormData {
  name: string;
  description: string;
  landAreaHectares: string;
  plantedDate: Date | undefined;
}

/**
 * Custom hook to create a pagination controller for plantations
 */
function usePlantationsPaginationController(): PaginationController<PlantationDto> {
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);
  const [sortKey, setSortKey] = React.useState<keyof PlantationDto | null>(
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
  const { data, isLoading } = usePlantationsPaginated(paginationRequest);

  const setSort = React.useCallback(
    (key: keyof PlantationDto | null, direction: "asc" | "desc" | null) => {
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
  const controller = usePlantationsPaginationController();

  // Mutation hooks
  const createMutation = useCreatePlantation();
  const updateMutation = useUpdatePlantation();
  const deleteMutation = useDeletePlantation();

  // Dialog state
  const [createDialogOpen, setCreateDialogOpen] = React.useState(false);
  const [editDialogOpen, setEditDialogOpen] = React.useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [selectedPlantation, setSelectedPlantation] =
    React.useState<PlantationDto | null>(null);

  // Form state
  const [formData, setFormData] = React.useState<PlantationFormData>({
    name: "",
    description: "",
    landAreaHectares: "",
    plantedDate: undefined,
  });

  // Reset form
  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      landAreaHectares: "",
      plantedDate: undefined,
    });
  };

  // Handle create
  const handleCreateOpen = () => {
    resetForm();
    setCreateDialogOpen(true);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.plantedDate) return;

    try {
      const request: CreatePlantationRequest = {
        name: formData.name,
        description: formData.description || undefined,
        landAreaHectares: parseFloat(formData.landAreaHectares),
        plantedDate: formData.plantedDate.toISOString(),
      };
      await createMutation.mutateAsync(request);
      setCreateDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error("Failed to create plantation:", error);
    }
  };

  // Handle edit
  const handleEditOpen = (plantation: PlantationDto) => {
    setSelectedPlantation(plantation);
    setFormData({
      name: plantation.name,
      description: plantation.description || "",
      landAreaHectares: plantation.landAreaHectares.toString(),
      plantedDate: new Date(plantation.plantedDate),
    });
    setEditDialogOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlantation) return;

    try {
      const request: UpdatePlantationRequest = {
        id: selectedPlantation.id,
        name: formData.name || undefined,
        description: formData.description || undefined,
        landAreaHectares: formData.landAreaHectares
          ? parseFloat(formData.landAreaHectares)
          : undefined,
        plantedDate: formData.plantedDate
          ? formData.plantedDate.toISOString()
          : undefined,
      };
      await updateMutation.mutateAsync(request);
      setEditDialogOpen(false);
      setSelectedPlantation(null);
      resetForm();
    } catch (error) {
      console.error("Failed to update plantation:", error);
    }
  };

  // Handle delete
  const handleDeleteOpen = (plantation: PlantationDto) => {
    setSelectedPlantation(plantation);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedPlantation) return;

    try {
      await deleteMutation.mutateAsync(selectedPlantation.id);
      setDeleteDialogOpen(false);
      setSelectedPlantation(null);
    } catch (error) {
      console.error("Failed to delete plantation:", error);
    }
  };

  // Define columns
  const columns: Column<PlantationDto>[] = [
    {
      key: "name",
      label: "Plantation Name",
      sortable: true,
      render: (value) => <div className="font-medium">{value as string}</div>,
    },
    {
      key: "description",
      label: "Description",
      render: (value) => (
        <div className="max-w-md truncate text-muted-foreground">
          {value ? (value as string) : "-"}
        </div>
      ),
    },
    {
      key: "landAreaHectares",
      label: "Land Area",
      sortable: true,
      render: (value) => (
        <div className="flex items-center gap-1">
          <span className="font-mono">{Number(value).toFixed(2)}</span>
          <span className="text-muted-foreground text-xs">ha</span>
        </div>
      ),
    },
    {
      key: "plantedDate",
      label: "Planted Date",
      sortable: true,
      render: (value) => (
        <div className="text-sm">
          {new Date(value as string).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
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
          <h1 className="text-3xl font-bold tracking-tight">Plantations</h1>
          <p className="text-muted-foreground">
            Manage and view all your plantations
          </p>
        </div>
      </div>

      <PaginationTable
        columns={columns}
        controller={controller}
        searchable={true}
        searchPlaceholder="Search plantations by name..."
        pageSizeOptions={[10, 20, 30, 50, 100]}
        actions={
          <Button size="sm" onClick={handleCreateOpen}>
            <Plus className="mr-2 h-4 w-4" />
            Add Plantation
          </Button>
        }
        expandable={{
          render: (row) => (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <div className="text-sm font-medium text-muted-foreground">
                    Plantation ID
                  </div>
                  <div className="font-mono text-sm">{row.id}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm font-medium text-muted-foreground">
                    Full Description
                  </div>
                  <div className="text-sm">
                    {row.description || "No description provided"}
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
                  {Number(row.landAreaHectares).toFixed(2)} hectares
                </Badge>
                <Badge variant="outline">
                  Planted: {new Date(row.plantedDate).toLocaleDateString()}
                </Badge>
              </div>
            </div>
          ),
          getRowId: (row) => row.id,
        }}
      />

      {/* Create Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create New Plantation</DialogTitle>
            <DialogDescription>
              Add a new plantation to your system. Fill in all required fields.
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
                  placeholder="Enter plantation name"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="create-description">Description</Label>
                <Textarea
                  id="create-description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Enter description (optional)"
                  rows={3}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="create-area">
                  Land Area (hectares){" "}
                  <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="create-area"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.landAreaHectares}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      landAreaHectares: e.target.value,
                    })
                  }
                  placeholder="0.00"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="create-date">
                  Planted Date <span className="text-destructive">*</span>
                </Label>
                <DatePicker
                  date={formData.plantedDate}
                  onDateChange={(date) =>
                    setFormData({ ...formData, plantedDate: date })
                  }
                  placeholder="Select planted date"
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
                Create Plantation
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Plantation</DialogTitle>
            <DialogDescription>
              Update the plantation information. Leave fields empty to keep
              current values.
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
                  placeholder="Enter plantation name"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Enter description"
                  rows={3}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-area">Land Area (hectares)</Label>
                <Input
                  id="edit-area"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.landAreaHectares}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      landAreaHectares: e.target.value,
                    })
                  }
                  placeholder="0.00"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-date">Planted Date</Label>
                <DatePicker
                  date={formData.plantedDate}
                  onDateChange={(date) =>
                    setFormData({ ...formData, plantedDate: date })
                  }
                  placeholder="Select planted date"
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
                Update Plantation
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Plantation</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this plantation? This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="rounded-lg bg-muted p-4 space-y-2">
              <div className="flex justify-between">
                <span className="font-medium">Name:</span>
                <span>{selectedPlantation?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Land Area:</span>
                <span>{selectedPlantation?.landAreaHectares} ha</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Planted:</span>
                <span>
                  {selectedPlantation &&
                    new Date(
                      selectedPlantation.plantedDate
                    ).toLocaleDateString()}
                </span>
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
              Delete Plantation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
