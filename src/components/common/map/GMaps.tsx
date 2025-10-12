import { useEffect, useState } from 'react';
import {
  APIProvider,
  Map,
  AdvancedMarker,
  Pin,
  type MapMouseEvent,
} from '@vis.gl/react-google-maps';

export interface MarkerData {
  id: string;
  position: { lat: number; lng: number };
  title?: string;
  type?: 'tree' | 'plantation';
  color?: string;
}

interface GMapsProps {
  className?: string;
  center?: { lat: number; lng: number };
  zoom?: number;
  onClick?: (event: MapMouseEvent) => void;
  markers?: MarkerData[];
  onMarkerClick?: (marker: MarkerData) => void;
}

const DEFAULT_CENTER = { lat: -2.5489, lng: 118.0149 }; // Indonesia center
const DEFAULT_ZOOM = 5;

export function GMaps({
  className = '',
  center = DEFAULT_CENTER,
  zoom = DEFAULT_ZOOM,
  onClick,
  markers = [],
  onMarkerClick,
}: GMapsProps) {
  const [mapCenter, setMapCenter] = useState(center);
  const [mapZoom, setMapZoom] = useState(zoom);

  // Update map center and zoom when props change
  useEffect(() => {
    setMapCenter(center);
  }, [center]);

  useEffect(() => {
    setMapZoom(zoom);
  }, [zoom]);

  const handleMapClick = (event: MapMouseEvent) => {
    if (onClick && event.detail.latLng) {
      onClick(event);
    }
  };

  const handleMarkerClick = (marker: MarkerData) => {
    if (onMarkerClick) {
      onMarkerClick(marker);
    }
  };

  const getMarkerColor = (marker: MarkerData): string => {
    if (marker.color) return marker.color;
    return marker.type === 'plantation' ? '#3b82f6' : '#22c55e';
  };

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

  return (
    <APIProvider apiKey={apiKey}>
      <div className={className}>
        <Map
          mapId="palm-plantation-map"
          center={mapCenter}
          zoom={mapZoom}
          onClick={handleMapClick}
          gestureHandling="greedy"
          disableDefaultUI={false}
          mapTypeControl={true}
          streetViewControl={false}
          fullscreenControl={true}
          zoomControl={true}
        >
          {markers.map((marker) => (
            <AdvancedMarker
              key={marker.id}
              position={marker.position}
              title={marker.title}
              onClick={() => handleMarkerClick(marker)}
            >
              <Pin
                background={getMarkerColor(marker)}
                borderColor="#ffffff"
                glyphColor="#ffffff"
                scale={1.2}
              />
            </AdvancedMarker>
          ))}
        </Map>
      </div>
    </APIProvider>
  );
}
