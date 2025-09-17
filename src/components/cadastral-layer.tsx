'use client';

import { useEffect, useCallback, useState, useRef } from 'react';
import { useMap } from '@vis.gl/react-google-maps';
import { useBiomassStore } from '@/store/biomass-store';
import { searchCadastralParcels } from '@/app/actions';
import { useDebounce } from '@/hooks/use-debounce';
import type { CadastralParcel } from '@/lib/types';

export default function CadastralLayer() {
  const map = useMap();
  const { center, radiusKm, overlays, searchInitiated } = useBiomassStore();
  const [parcels, setParcels] = useState<CadastralParcel[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const isFetching = useRef(false);

  const debouncedCenter = useDebounce(center, 1000);
  const debouncedRadiusKm = useDebounce(radiusKm, 1000);

  const fetchParcels = useCallback(async () => {
    if (!debouncedCenter || !searchInitiated || isFetching.current || !overlays.cadastral) {
      return;
    }

    isFetching.current = true;
    setIsLoading(true);

    try {
      const results = await searchCadastralParcels({
        lat: debouncedCenter.lat,
        lng: debouncedCenter.lng,
        radius_m: debouncedRadiusKm * 1000,
      });
      setParcels(results);
    } catch (error) {
      console.error('Failed to fetch cadastral parcels:', error);
      setParcels([]);
    } finally {
      setIsLoading(false);
      isFetching.current = false;
    }
  }, [debouncedCenter, debouncedRadiusKm, searchInitiated, overlays.cadastral]);
  
  useEffect(() => {
    // Fetch parcels when the layer is enabled or search area changes
    if (overlays.cadastral) {
      fetchParcels();
    } else {
      setParcels([]); // Clear parcels if layer is disabled
    }
  }, [overlays.cadastral, fetchParcels]);

  useEffect(() => {
    if (!map) return;

    // Clear previous data
    map.data.forEach(feature => {
      map.data.remove(feature);
    });

    if (parcels.length > 0 && overlays.cadastral) {
      parcels.forEach(parcel => {
        try {
          const geojson = JSON.parse(parcel.geom_geojson);
          map.data.addGeoJson({
            type: 'Feature',
            geometry: geojson,
            properties: { id: parcel.id },
          });
        } catch (e) {
          console.error("Failed to parse parcel GeoJSON", e);
        }
      });
    }
    
    // Style the layer
    map.data.setStyle({
      fillColor: 'hsl(var(--accent))',
      strokeColor: 'hsl(var(--primary))',
      strokeWeight: 1,
      fillOpacity: 0.3,
    });

  }, [map, parcels, overlays.cadastral]);
  
  // You might want to show a loading indicator on the map
  // For now, this component doesn't render anything itself.

  return null;
}
