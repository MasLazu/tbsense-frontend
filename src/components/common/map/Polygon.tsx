import { useEffect } from 'react';
import { useMap, useMapsLibrary } from '@vis.gl/react-google-maps';

interface CustomPolygonProps {
  path: google.maps.LatLngLiteral[];
  options?: google.maps.PolygonOptions;
}

export function CustomPolygon({ path, options }: CustomPolygonProps) {
  const map = useMap();
  const maps = useMapsLibrary('maps'); // ambil API Maps

  useEffect(() => {
    if (!map || !maps || path.length < 3) return;

    const polygon = new maps.Polygon({
      paths: path,
      map,
      ...options,
    });

    return () => {
      polygon.setMap(null);
    };
  }, [map, maps, path, options]);

  return null;
}
