import { createFileRoute } from '@tanstack/react-router';
import { useState, useCallback } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { GMaps, type MarkerData } from '@/components/common/map/GMaps';
import { usePlantationsPaginated } from '@/hooks/use-plantations';
import { useTrees, useCreateTree } from '@/hooks/use-trees';
import { MapPin, Plus, Trash2, Info } from 'lucide-react';
import type { MapMouseEvent } from '@vis.gl/react-google-maps';
import { toast } from 'sonner';

export const Route = createFileRoute('/dashboard/map/area/')({
  component: RouteComponent,
});

function RouteComponent() {
  const [selectedPlantationId, setSelectedPlantationId] = useState<string>('');
  const [isAddingMode, setIsAddingMode] = useState(false);
  const [mapCenter, setMapCenter] = useState({ lat: -2.5489, lng: 118.0149 });
  const [mapZoom, setMapZoom] = useState(5);

  // Fetch plantations
  const { data: plantationsData, isLoading: isLoadingPlantations } = usePlantationsPaginated({
    page: 1,
    pageSize: 100,
  });

  // Fetch all trees
  const { data: treesData, isLoading: isLoadingTrees } = useTrees({
    page: 1,
    pageSize: 1000,
  });

  // Create tree mutation
  const createTreeMutation = useCreateTree();

  const plantations = plantationsData?.items || [];
  const allTrees = treesData?.items || [];

  // Filter trees by selected plantation
  const filteredTrees = selectedPlantationId
    ? allTrees.filter((tree) => tree.plantationId === selectedPlantationId)
    : [];

  const selectedPlantation = plantations.find((p) => p.id === selectedPlantationId);

  // Convert trees to markers
  const treeMarkers: MarkerData[] = filteredTrees.map((tree) => ({
    id: tree.id,
    position: { lat: tree.latitude, lng: tree.longitude },
    title: `Tree ${tree.id}`,
    type: 'tree' as const,
    color: '#22c55e',
  }));

  // Handle plantation selection
  const handlePlantationSelect = (plantationId: string) => {
    setSelectedPlantationId(plantationId);

    // Focus on first tree of the plantation if exists
    const plantationTrees = allTrees.filter((t) => t.plantationId === plantationId);
    if (plantationTrees.length > 0) {
      const firstTree = plantationTrees[0];
      setMapCenter({ lat: firstTree.latitude, lng: firstTree.longitude });
      setMapZoom(15);
    } else {
      // If no trees, show Indonesia with zoom
      setMapCenter({ lat: -2.5489, lng: 118.0149 });
      setMapZoom(10);
      toast.error(
        'No trees found in the selected plantation. You can add new trees by clicking "Add Tree" button.'
      );
    }
  };

  // Handle map click to add coordinate
  const handleMapClick = useCallback(
    async (event: MapMouseEvent) => {
      if (!isAddingMode || !selectedPlantationId) return;

      const latLng = event.detail.latLng;
      if (!latLng) return;

      const lat = latLng.lat;
      const lng = latLng.lng;

      if (lat && lng) {
        try {
          await createTreeMutation.mutateAsync({
            plantationId: selectedPlantationId,
            latitude: lat,
            longitude: lng,
          });

          toast.success('Tree location added successfully');

          setIsAddingMode(false);
        } catch (error) {
          toast.error('Failed to add tree location');
        }
      }
    },
    [isAddingMode, selectedPlantationId, createTreeMutation, toast]
  );

  // Handle marker click
  const handleMarkerClick = (marker: MarkerData) => {
    toast(`Tree ID: ${marker.id}`, { duration: 4000 });
  };

  const toggleAddingMode = () => {
    if (!selectedPlantationId) {
      toast.error('Please select a plantation first');
      return;
    }
    setIsAddingMode(!isAddingMode);
  };

  if (isLoadingPlantations || isLoadingTrees) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Palm Plantation Areas</h1>
          <p className="text-muted-foreground mt-2">
            Distribution patterns and geospatial insights across plantation boundaries.
          </p>
        </div>
        <div className="space-y-4">
          <Skeleton className="h-12 w-64" />
          <Skeleton className="h-96 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Palm Plantation Areas</h1>
        <p className="text-muted-foreground mt-2">
          Distribution patterns and geospatial insights across plantation boundaries.
        </p>
      </div>

      {/* Control Panel */}
      <div className="rounded-lg border bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex flex-col flex-1 min-w-64">
            <label className="text-sm font-medium mb-2">Select Plantation</label>
            <Select value={selectedPlantationId} onValueChange={handlePlantationSelect}>
              <SelectTrigger>
                <SelectValue placeholder="Choose plantation to view" />
              </SelectTrigger>
              <SelectContent>
                {plantations.length === 0 ? (
                  <div className="px-2 py-1.5 text-sm text-muted-foreground">
                    No plantations available
                  </div>
                ) : (
                  plantations.map((plantation) => (
                    <SelectItem key={plantation.id} value={plantation.id}>
                      {plantation.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {selectedPlantation && (
            <div className="flex flex-col">
              <label className="text-sm font-medium mb-2">Statistics</label>
              <div className="flex items-center gap-4 text-sm bg-slate-50 px-3 py-2 rounded-md">
                <span className="flex items-center gap-1">
                  🌴 <strong>{filteredTrees.length}</strong> Trees
                </span>
                <span className="text-slate-300">|</span>
                <span className="flex items-center gap-1">
                  📏 <strong>{selectedPlantation.landAreaHectares}</strong> ha
                </span>
              </div>
            </div>
          )}

          <div className="ml-auto">
            <Button
              onClick={toggleAddingMode}
              variant={isAddingMode ? 'destructive' : 'default'}
              disabled={!selectedPlantationId}
              size="default"
            >
              {isAddingMode ? (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Cancel
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Tree
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Map Section */}
      <div className="rounded-xl border shadow-sm bg-white overflow-hidden">
        <GMaps
          className="w-full h-[500px]"
          center={mapCenter}
          zoom={mapZoom}
          onClick={handleMapClick}
          markers={treeMarkers}
          onMarkerClick={handleMarkerClick}
        />

        {/* Map Footer */}
        <div className="p-4 bg-slate-50 border-t">
          {isAddingMode ? (
            <div className="flex items-start gap-3 text-sm text-blue-600 bg-blue-50 p-3 rounded-lg">
              <MapPin className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Adding Mode Active</p>
                <p className="text-blue-600/80 mt-1">
                  Click anywhere on the map to add a new tree location for{' '}
                  <strong>{selectedPlantation?.name}</strong>
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-3 text-sm text-muted-foreground">
              <Info className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div>
                {selectedPlantation ? (
                  <p>
                    Displaying <strong>{filteredTrees.length}</strong> tree
                    {filteredTrees.length !== 1 ? 's' : ''} in{' '}
                    <strong>{selectedPlantation.name}</strong>. Click markers for details or use
                    "Add Tree" to register new locations.
                  </p>
                ) : (
                  <p>
                    Select a plantation from the dropdown above to view its tree distribution and
                    manage locations.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Legend */}
      {selectedPlantation && (
        <div className="rounded-lg border p-4 bg-white shadow-sm">
          <h3 className="font-semibold text-sm mb-3">Map Legend</h3>
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-green-500 border-2 border-white shadow-sm"></div>
              <span className="text-sm text-muted-foreground">Palm Tree Location</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-slate-400" />
              <span className="text-sm text-muted-foreground">Click marker for tree info</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
