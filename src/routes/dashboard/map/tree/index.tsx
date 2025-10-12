import { useState, useCallback } from 'react';
import {
  APIProvider,
  Map,
  AdvancedMarker,
  Pin,
  type MapMouseEvent,
} from '@vis.gl/react-google-maps';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Trash2, Plus, MapPin } from 'lucide-react';
import { usePlantationsPaginated } from '@/hooks/use-plantations';
import { usePlantationCoordinatesPaginated } from '@/hooks/use-plantation-coordinates';
import { useCreateTree, useDeleteTree, useTrees } from '@/hooks/use-trees';
import { CustomPolygon } from '@/components/common/map/Polygon';
import { createFileRoute } from '@tanstack/react-router';
import { DialogQrCode } from '@/components/common/dialog/DialogQrCode';

const defaultCenter = {
  lat: -7.250445,
  lng: 112.768845, // Surabaya
};
export const Route = createFileRoute('/dashboard/map/tree/')({
  component: RouteComponent,
});

function RouteComponent() {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

  // State Management
  const [selectedPlantationId, setSelectedPlantationId] = useState('');
  const [isAddingMode, setIsAddingMode] = useState(false);
  const [mapCenter, setMapCenter] = useState(defaultCenter);
  const [mapZoom, setMapZoom] = useState(13);

  const { data: plantationsData, isLoading: isLoadingPlantations } = usePlantationsPaginated({
    page: 1,
    pageSize: 100,
  });

  // Get plantation area coordinates (for polygon)
  const { data: coordinatesData } = usePlantationCoordinatesPaginated({
    page: 1,
    pageSize: 200,
    filters: selectedPlantationId
      ? [{ field: 'plantationId', operator: '=', value: selectedPlantationId }]
      : [],
    orderBy: [{ field: 'createdAt', desc: false }],
  });

  // Get trees for selected plantation
  const {
    data: treesData,
    isLoading: isLoadingTrees,
    refetch: refetchTrees,
  } = useTrees({
    page: 1,
    pageSize: 200,
    filters: selectedPlantationId
      ? [{ field: 'plantationId', operator: '=', value: selectedPlantationId }]
      : [],
  });

  const createTree = useCreateTree();
  const deleteTree = useDeleteTree();

  const selectedCoordinates =
    coordinatesData?.items?.filter((coord) => coord.plantationId === selectedPlantationId) || [];

  const selectedTrees = treesData?.items || [];

  // Handle map click to add tree
  const handleMapClick = useCallback(
    (event: MapMouseEvent) => {
      if (!isAddingMode || !selectedPlantationId) return;

      const lat = event.detail.latLng?.lat;
      const lng = event.detail.latLng?.lng;

      if (!lat || !lng) return;

      createTree.mutate(
        {
          plantationId: selectedPlantationId,
          latitude: lat,
          longitude: lng,
        },
        {
          onSuccess: () => {
            refetchTrees();
            alert(`Pohon sawit ditambahkan: ${lat.toFixed(6)}, ${lng.toFixed(6)}`);
          },
        }
      );
    },
    [isAddingMode, selectedPlantationId, createTree, refetchTrees]
  );

  // Handle delete tree
  const handleDeleteTree = (treeId: string) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus pohon ini?')) {
      deleteTree.mutate(treeId, {
        onSuccess: () => {
          refetchTrees();
          alert('Pohon dihapus!');
        },
      });
    }
  };

  // Handle plantation selection
  const handlePlantationChange = (plantationId: string) => {
    setSelectedPlantationId(plantationId);
    setIsAddingMode(false);

    // Center map on first coordinate of selected plantation
    const coords = coordinatesData?.items?.filter((coord) => coord.plantationId === plantationId);
    if (coords && coords.length > 0) {
      setMapCenter({
        lat: coords[0].latitude,
        lng: coords[0].longitude,
      });
      setMapZoom(17);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Pemetaan Pohon Sawit</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map Section */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Peta Pohon Sawit</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Controls */}
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex-1 min-w-[200px]">
                <Select
                  value={selectedPlantationId}
                  onValueChange={handlePlantationChange}
                  disabled={isLoadingPlantations}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih Plantation" />
                  </SelectTrigger>
                  <SelectContent>
                    {plantationsData?.items?.map((plantation) => (
                      <SelectItem key={plantation.id} value={plantation.id}>
                        {plantation.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={() => setIsAddingMode(!isAddingMode)}
                disabled={!selectedPlantationId}
                variant={isAddingMode ? 'default' : 'outline'}
              >
                {isAddingMode ? (
                  <>
                    <MapPin className="w-4 h-4 mr-2" />
                    Mode Tambah Aktif
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Tambah Pohon
                  </>
                )}
              </Button>
            </div>

            {isAddingMode && (
              <Alert>
                <AlertDescription>
                  Klik pada peta untuk menambahkan pohon sawit baru pada plantation yang dipilih.
                </AlertDescription>
              </Alert>
            )}

            {/* Google Map */}
            <APIProvider apiKey={apiKey}>
              <div className="w-full h-[600px] rounded-lg overflow-hidden border">
                <Map
                  key={selectedPlantationId || 'default'}
                  defaultCenter={mapCenter}
                  defaultZoom={mapZoom}
                  mapId="plantation-map"
                  onClick={handleMapClick}
                  gestureHandling="greedy"
                  disableDefaultUI={false}
                  style={{ cursor: isAddingMode ? 'crosshair' : 'default' }}
                >
                  {/* Polygon untuk area plantation */}
                  {selectedCoordinates.length >= 3 && (
                    <CustomPolygon
                      path={selectedCoordinates.map((coord) => ({
                        lat: coord.latitude,
                        lng: coord.longitude,
                      }))}
                      options={{
                        fillColor: '#16a34a',
                        fillOpacity: 0.1,
                        strokeColor: '#15803d',
                        strokeOpacity: 0.6,
                        strokeWeight: 2,
                        clickable: false,
                      }}
                    />
                  )}

                  {/* Markers untuk setiap pohon sawit */}
                  {selectedTrees.map((tree) => (
                    <AdvancedMarker
                      key={tree.id}
                      position={{ lat: tree.latitude, lng: tree.longitude }}
                    >
                      <Pin background="#dc2626" borderColor="#991b1b" glyphColor="#ffffff">
                        <div className="text-xs font-bold">🌴</div>
                      </Pin>
                    </AdvancedMarker>
                  ))}
                </Map>
              </div>
            </APIProvider>

            {/* Info */}
            {selectedCoordinates.length >= 3 && (
              <div className="text-sm text-muted-foreground">
                <p className="text-center">
                  Area plantation ditampilkan dengan garis hijau. Titik merah menunjukkan lokasi
                  pohon sawit.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Trees List */}
        <Card>
          <CardHeader>
            <CardTitle>Daftar Pohon Sawit</CardTitle>
          </CardHeader>
          <CardContent>
            {!selectedPlantationId ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                Pilih plantation untuk melihat pohon sawit
              </p>
            ) : isLoadingTrees ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
            ) : selectedTrees.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                Belum ada pohon sawit. Klik "Tambah Pohon" untuk memulai.
              </p>
            ) : (
              <div className="space-y-2 max-h-[500px] overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="border-b sticky top-0 bg-white">
                    <tr>
                      <th className="text-left p-2 w-12">#</th>
                      <th className="text-left p-2">Latitude</th>
                      <th className="text-left p-2">Longitude</th>
                      <th className="w-12"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedTrees.map((tree, index) => (
                      <tr key={tree.id} className="border-b hover:bg-gray-50">
                        <td className="p-2 font-medium">{index + 1}</td>
                        <td className="p-2 text-xs">{tree.latitude.toFixed(6)}</td>
                        <td className="p-2 text-xs">{tree.longitude.toFixed(6)}</td>
                        <td className="p-2 flex gap-1">
                          <DialogQrCode treeId={tree.id} />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteTree(tree.id)}
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Info Card */}
      {selectedPlantationId && (
        <Card>
          <CardHeader>
            <CardTitle>Informasi Plantation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Nama Plantation</p>
                <p className="font-semibold">
                  {plantationsData?.items?.find((p) => p.id === selectedPlantationId)?.name}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Luas Area</p>
                <p className="font-semibold">
                  {
                    plantationsData?.items?.find((p) => p.id === selectedPlantationId)
                      ?.landAreaHectares
                  }{' '}
                  ha
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Jumlah Pohon</p>
                <p className="font-semibold">{selectedTrees.length} pohon</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Kepadatan</p>
                <p className="font-semibold">
                  {selectedTrees.length > 0 &&
                  plantationsData?.items?.find((p) => p.id === selectedPlantationId)
                    ?.landAreaHectares
                    ? Math.round(
                        selectedTrees.length /
                          plantationsData.items.find((p) => p.id === selectedPlantationId)!
                            .landAreaHectares
                      )
                    : 0}{' '}
                  pohon/ha
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
