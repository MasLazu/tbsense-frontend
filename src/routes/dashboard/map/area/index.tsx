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
import { createFileRoute } from '@tanstack/react-router';
import { usePlantationsPaginated } from '@/hooks/use-plantations';
import {
  useCreatePlantationCoordinate,
  useDeletePlantationCoordinate,
  usePlantationCoordinatesPaginated,
} from '@/hooks/use-plantation-coordinates';
import { CustomPolygon } from '@/components/common/map/Polygon';

const defaultCenter = {
  lat: -7.250445,
  lng: 112.768845, // Surabaya
};
export const Route = createFileRoute('/dashboard/map/area/')({
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

  const {
    data: coordinatesData,
    isLoading: isLoadingCoordinates,
    refetch: refetchCoordinates,
  } = usePlantationCoordinatesPaginated({
    page: 1,
    pageSize: 200,
    filters: selectedPlantationId
      ? [{ field: 'plantationId', operator: '=', value: selectedPlantationId }]
      : [],
    orderBy: [{ field: 'createdAt', desc: false }],
  });

  const createCoordinate = useCreatePlantationCoordinate();
  const deleteCoordinate = useDeletePlantationCoordinate();

  const selectedCoordinates =
    coordinatesData?.items?.filter((coord) => coord.plantationId === selectedPlantationId) || [];

  // Handle map click to add coordinate
  const handleMapClick = useCallback(
    (event: MapMouseEvent) => {
      if (!isAddingMode || !selectedPlantationId) return;

      const lat = event.detail.latLng?.lat;
      const lng = event.detail.latLng?.lng;

      if (!lat || !lng) return;

      createCoordinate.mutate(
        {
          plantationId: selectedPlantationId,
          latitude: lat,
          longitude: lng,
        },
        {
          onSuccess: () => {
            refetchCoordinates();
          },
        }
      );

      console.log('Adding coordinate:', { lat, lng, plantationId: selectedPlantationId });
      alert(`Koordinat ditambahkan: ${lat.toFixed(6)}, ${lng.toFixed(6)}`);
    },
    [isAddingMode, selectedPlantationId]
  );

  // Handle delete coordinate
  const handleDeleteCoordinate = (coordinateId: string) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus koordinat ini?')) {
      deleteCoordinate.mutate(coordinateId, {
        onSuccess: () => {
          refetchCoordinates();
        },
      });
      console.log('Deleting coordinate:', coordinateId);
      alert('Koordinat dihapus!');
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
      setMapZoom(15);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Pemetaan Area Perkebunan</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map Section */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Peta Area</CardTitle>
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
                    Tambah Koordinat
                  </>
                )}
              </Button>
            </div>

            {isAddingMode && (
              <Alert>
                <AlertDescription>
                  Klik pada peta untuk menambahkan koordinat baru pada plantation yang dipilih.
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
                  {/* Markers untuk setiap koordinat */}
                  {selectedCoordinates.map((coord, index) => (
                    <AdvancedMarker
                      key={coord.id}
                      position={{ lat: coord.latitude, lng: coord.longitude }}
                    >
                      <Pin
                        background={isAddingMode ? '#3b82f6' : '#16a34a'}
                        borderColor={isAddingMode ? '#1e40af' : '#15803d'}
                        glyphColor={'#ffffff'}
                      >
                        <div className="text-xs font-bold">{index + 1}</div>
                      </Pin>
                    </AdvancedMarker>
                  ))}

                  {/* Custom Polygon Overlay */}
                  {selectedCoordinates.length >= 3 && (
                    <CustomPolygon
                      path={selectedCoordinates.map((coord) => ({
                        lat: coord.latitude,
                        lng: coord.longitude,
                      }))}
                      options={{
                        fillColor: '#16a34a',
                        fillOpacity: 0.2,
                        strokeColor: '#15803d',
                        strokeOpacity: 0.8,
                        strokeWeight: 2,
                      }}
                    />
                  )}
                </Map>
              </div>
            </APIProvider>

            {/* Polygon Lines Info */}
            {selectedCoordinates.length >= 3 && (
              <div className="text-sm text-muted-foreground">
                <p className="mt-2 text-center">
                  Garis menghubungkan {selectedCoordinates.length} titik koordinat membentuk area
                  plantation
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Coordinates List */}
        <Card>
          <CardHeader>
            <CardTitle>Daftar Koordinat</CardTitle>
          </CardHeader>
          <CardContent>
            {!selectedPlantationId ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                Pilih plantation untuk melihat koordinat
              </p>
            ) : isLoadingCoordinates ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
            ) : selectedCoordinates.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                Belum ada koordinat. Klik "Tambah Koordinat" untuk memulai.
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
                    {selectedCoordinates.map((coord, index) => (
                      <tr key={coord.id} className="border-b hover:bg-gray-50">
                        <td className="p-2 font-medium">{index + 1}</td>
                        <td className="p-2 text-xs">{coord.latitude.toFixed(6)}</td>
                        <td className="p-2 text-xs">{coord.longitude.toFixed(6)}</td>
                        <td className="p-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteCoordinate(coord.id)}
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
            <CardTitle>Informasi Area</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Nama Plantation</p>
                <p className="font-semibold">
                  {plantationsData?.items?.find((p) => p.id === selectedPlantationId)?.name}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Jumlah Koordinat</p>
                <p className="font-semibold">{selectedCoordinates.length} titik</p>
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
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
