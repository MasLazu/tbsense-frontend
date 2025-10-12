import { useEffect, useState } from 'react';
import {
  APIProvider,
  Map,
  AdvancedMarker,
  Pin,
  useMap,
  useMapsLibrary,
  type MapMouseEvent,
} from '@vis.gl/react-google-maps';
import { Button } from '@/components/ui/button';
import { MapPin, Plus, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useCreateTree } from '@/hooks/use-trees';
import { toast } from 'sonner';

interface Coordinate {
  lat: number;
  lng: number;
}

interface Tree {
  id: string;
  latitude: number;
  longitude: number;
  name?: string;
  plantationId: string;
}

interface GMapsProps {
  className?: string;
  selectedPlantationId?: string;
  plantationBoundaries?: Coordinate[];
  trees?: Tree[];
}

export function GMaps({
  className = '',
  selectedPlantationId,
  plantationBoundaries = [],
  trees = [],
}: GMapsProps) {
  const [isAddingTree, setIsAddingTree] = useState(false);
  const [pendingTreeLocation, setPendingTreeLocation] = useState<Coordinate | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);

  const createTreeMutation = useCreateTree();

  const map = useMap(); // akses map instance
  const mapsLib = useMapsLibrary('maps'); // load maps library
  const [polygon, setPolygon] = useState<google.maps.Polygon | null>(null);

  /** 🧭 Hitung titik tengah area */
  const getMapCenter = (): Coordinate => {
    if (plantationBoundaries.length > 0) {
      const avgLat =
        plantationBoundaries.reduce((sum, coord) => sum + coord.lat, 0) /
        plantationBoundaries.length;
      const avgLng =
        plantationBoundaries.reduce((sum, coord) => sum + coord.lng, 0) /
        plantationBoundaries.length;
      return { lat: avgLat, lng: avgLng };
    }
    // Default: Surabaya
    return { lat: -7.2575, lng: 112.7521 };
  };

  /** 🟩 Render polygon boundary secara manual */
  useEffect(() => {
    if (!mapsLib || !map || plantationBoundaries.length === 0) return;

    // Hapus polygon lama
    if (polygon) polygon.setMap(null);

    const newPolygon = new google.maps.Polygon({
      paths: plantationBoundaries,
      strokeColor: '#10b981',
      strokeOpacity: 0.8,
      strokeWeight: 3,
      fillColor: '#10b981',
      fillOpacity: 0.15,
    });

    newPolygon.setMap(map);
    setPolygon(newPolygon);

    // Cleanup
    return () => {
      newPolygon.setMap(null);
    };
  }, [mapsLib, map, plantationBoundaries]);

  /** 📍 Klik pada peta */
  const handleMapClick = (event: MapMouseEvent) => {
    if (!isAddingTree || !selectedPlantationId) return;
    if (!event.detail?.latLng) return;

    const lat = event.detail.latLng.lat;
    const lng = event.detail.latLng.lng;

    setPendingTreeLocation({ lat, lng });
    setShowAddDialog(true);

    console.log('Pending tree:', { lat, lng, plantationId: selectedPlantationId });
  };

  /** ✅ Konfirmasi tambah pohon */
  const handleConfirmAddTree = async () => {
    if (!pendingTreeLocation || !selectedPlantationId) return;

    try {
      await createTreeMutation.mutateAsync({
        plantationId: selectedPlantationId,
        latitude: pendingTreeLocation.lat,
        longitude: pendingTreeLocation.lng,
      });

      toast.success('Tree added successfully!');
      setShowAddDialog(false);
      setPendingTreeLocation(null);
      setIsAddingTree(false);
    } catch (error) {
      toast.error('Failed to add tree');
      console.error('Error adding tree:', error);
    }
  };

  /** ❌ Batal tambah pohon */
  const handleCancelAddTree = () => {
    setShowAddDialog(false);
    setPendingTreeLocation(null);
  };

  /** 🌴 Toggle mode tambah pohon */
  const handleToggleAddTree = () => {
    if (!selectedPlantationId) {
      toast.warning('Please select a plantation first');
      return;
    }
    setIsAddingTree((prev) => !prev);
  };

  const mapCenter = getMapCenter();
  const hasPlantation = !!selectedPlantationId && plantationBoundaries.length > 0;

  return (
    <div className={`relative ${className}`}>
      <APIProvider apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
        <Map
          className="w-full h-full rounded-lg"
          defaultCenter={mapCenter}
          center={hasPlantation ? mapCenter : undefined}
          defaultZoom={hasPlantation ? 16 : 13}
          gestureHandling="greedy"
          disableDefaultUI={false}
          mapTypeId="satellite"
          onClick={handleMapClick}
          clickableIcons={false}
          style={{ cursor: isAddingTree ? 'crosshair' : 'grab' }}
        >
          {/* 🔵 Boundary Corner Markers */}
          {hasPlantation &&
            plantationBoundaries.map((coord, idx) => (
              <AdvancedMarker key={`boundary-${idx}`} position={coord}>
                <Pin background="#3b82f6" borderColor="white" glyphColor="white">
                  <div className="text-xs font-bold">{idx + 1}</div>
                </Pin>
              </AdvancedMarker>
            ))}

          {/* 🌴 Existing Trees */}
          {trees.map((tree) => (
            <AdvancedMarker key={tree.id} position={{ lat: tree.latitude, lng: tree.longitude }}>
              <Pin background="#059669" borderColor="white" glyphColor="white">
                <div className="text-lg">🌴</div>
              </Pin>
            </AdvancedMarker>
          ))}

          {/* 🟠 Pending Tree */}
          {pendingTreeLocation && (
            <AdvancedMarker position={pendingTreeLocation}>
              <Pin background="#f59e0b" borderColor="white" glyphColor="white">
                <div className="text-lg">📍</div>
              </Pin>
            </AdvancedMarker>
          )}
        </Map>
      </APIProvider>

      {/* 🧭 Control Buttons */}
      <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
        <Button
          onClick={handleToggleAddTree}
          variant={isAddingTree ? 'default' : 'secondary'}
          size="sm"
          className="shadow-lg"
          disabled={!selectedPlantationId}
        >
          <Plus className="w-4 h-4 mr-2" />
          {isAddingTree ? 'Adding Tree...' : 'Add Tree'}
        </Button>

        {isAddingTree && (
          <Button
            onClick={() => setIsAddingTree(false)}
            variant="outline"
            size="sm"
            className="shadow-lg"
          >
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
        )}
      </div>

      {/* 📖 Info Panel */}
      {isAddingTree && (
        <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur p-4 rounded-lg shadow-lg border z-10">
          <p className="text-sm font-medium text-gray-700 mb-2">
            🌴 Click on the map to add a new tree
          </p>
          <div className="text-xs text-gray-500">
            <p>• Click inside the plantation area to place a tree</p>
            <p>
              • The tree will be added to:{' '}
              <strong>{selectedPlantationId || 'No plantation selected'}</strong>
            </p>
          </div>
        </div>
      )}

      {/* 📊 Stats Panel */}
      {hasPlantation && (
        <div className="absolute top-4 right-4 bg-white/95 backdrop-blur p-4 rounded-lg shadow-lg border z-10">
          <p className="text-xs font-medium text-gray-500 mb-1">Plantation Stats</p>
          <div className="space-y-1">
            <div className="text-sm">
              <span className="text-gray-600">Trees: </span>
              <strong className="text-gray-900">{trees.length}</strong>
            </div>
            <div className="text-sm">
              <span className="text-gray-600">Area Points: </span>
              <strong className="text-gray-900">{plantationBoundaries.length}</strong>
            </div>
          </div>
        </div>
      )}

      {/* 💬 Confirmation Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Tree</DialogTitle>
            <DialogDescription>
              Are you sure you want to add a tree at this location?
            </DialogDescription>
          </DialogHeader>

          {pendingTreeLocation && (
            <div className="py-4">
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-600">Location:</span>
                </div>
                <div className="font-mono text-xs text-gray-700 ml-6">
                  <div>Latitude: {pendingTreeLocation.lat.toFixed(6)}</div>
                  <div>Longitude: {pendingTreeLocation.lng.toFixed(6)}</div>
                </div>
                <div className="flex items-center gap-2 text-sm mt-3">
                  <span className="text-gray-600">Plantation:</span>
                  <span className="font-medium text-gray-900">{selectedPlantationId}</span>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleCancelAddTree}
              disabled={createTreeMutation.isPending}
            >
              Cancel
            </Button>
            <Button onClick={handleConfirmAddTree} disabled={createTreeMutation.isPending}>
              {createTreeMutation.isPending ? 'Adding...' : 'Add Tree'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
