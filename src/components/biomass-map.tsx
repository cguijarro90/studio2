'use client';

import { useEffect, useState, useRef } from 'react';
import { Map, useMap, AdvancedMarker, Pin, InfoWindow, useMapState } from '@vis.gl/react-google-maps';
import { useBiomassStore, isPointInSpain } from '@/store/biomass-store';
import { Icons, getBiomassIcon, getColoredBiomassIcon } from './icons';
import type { BiomassSource, BiomassType, CadastralParcel } from '@/lib/types';
import MapLegend from './map-legend';
import { useTranslation } from '@/hooks/use-translation';
import GeolocateControl from './geolocate-control';

// This unified component will manage all overlays to prevent event conflicts.
function MapOverlays() {
  const map = useMap();
  const { 
    results, 
    setSelectedSourceId, 
    center, 
    radiusKm, 
    searchInitiated, 
    overlays 
  } = useBiomassStore();
  
  const parcels = useBiomassStore(s => s.cadastralParcels);
  
  // State for the radius circle
  const [circle, setCircle] = useState<google.maps.Circle | null>(null);

  // Effect for creating and cleaning up the radius circle
  useEffect(() => {
    if (!map) return;
    const newCircle = new google.maps.Circle({
        strokeColor: 'hsl(var(--primary))',
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: 'hsl(var(--primary))',
        fillOpacity: 0.1,
        map,
        clickable: false, // This is the crucial fix.
    });
    setCircle(newCircle);

    return () => {
      newCircle.setMap(null);
    };
  }, [map]);

  // Effect for updating the circle's position and visibility
  useEffect(() => {
    if (circle) {
      if (center && searchInitiated) {
        circle.setCenter(center);
        circle.setRadius(radiusKm * 1000);
        circle.setVisible(true);
      } else {
        circle.setVisible(false);
      }
    }
  }, [circle, center, radiusKm, searchInitiated]);

  // Effect for cadastral data layer
  useEffect(() => {
    if (!map) return;

    // Clear previous data features
    map.data.forEach(feature => {
      map.data.remove(feature);
    });

    if (overlays.cadastral && parcels.length > 0) {
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
      clickable: false, // Make parcels non-interactive too
    });

  }, [map, parcels, overlays.cadastral]);
  
  const getPinStyle = (type: string) => {
    switch (type) {
      case 'pellets':
        return { background: 'hsl(var(--chart-4))', borderColor: 'hsl(var(--chart-4))' };
      case 'carbon':
        return { background: 'hsl(var(--chart-2))', borderColor: 'hsl(var(--chart-2))' };
      case 'otros':
      default:
        return { background: 'hsl(var(--primary))', borderColor: 'hsl(var(--primary))' };
    }
  };

  return (
    <>
      {/* Biomass Source Markers */}
      {results.map((poi: BiomassSource) => {
        const geojson = JSON.parse(poi.geom_geojson);
        const [lng, lat] = geojson.coordinates;
        const pinStyle = getPinStyle(poi.type);
        return (
          <AdvancedMarker
            key={poi.id}
            position={{ lat, lng }}
            onClick={() => setSelectedSourceId(poi.id)}
          >
            <Pin {...pinStyle} glyphColor="white">
              {getBiomassIcon(poi.type, 'w-5 h-5')}
            </Pin>
          </AdvancedMarker>
        );
      })}
    </>
  );
}


function InfoWindowContent({source}: {source: BiomassSource}) {
    const { t } = useTranslation();
    return (
        <div className="p-2">
            <h3 className="font-bold text-lg">{source.name}</h3>
            <div className="flex items-center mt-2">
                {getColoredBiomassIcon(source.type)}
                <span className="ml-2 capitalize">{t(source.type as BiomassType)}</span>
            </div>
             <div className="flex items-center mt-1">
                <Icons.weight className="w-4 h-4 text-muted-foreground" />
                <span className="ml-2">{source.quantity.toLocaleString()} {t('tons')}</span>
            </div>
        </div>
    );
}

export default function BiomassMap() {
  const { center, setCenter, setMap, selectedSourceId, setSelectedSourceId, setSearchInitiated, setIsOutOfSpainDialogOpen } = useBiomassStore();
  const map = useMap();
  
  useEffect(() => {
    if (map) setMap(map);
  }, [map, setMap]);

  const selectedSource = useBiomassStore(s => s.results.find(r => r.id === s.selectedSourceId));
  const selectedPosition = selectedSource ? {
    lat: JSON.parse(selectedSource.geom_geojson).coordinates[1],
    lng: JSON.parse(selectedSource.geom_geojson).coordinates[0],
  } : null;
  

  const handleClick = (e: { detail: { latLng: google.maps.LatLngLiteral | null; } }) => {
    if (!e.detail.latLng) {
      return;
    }

    const point = e.detail.latLng;

    if (!isPointInSpain(point)) {
      setIsOutOfSpainDialogOpen(true);
    }
    
    setCenter(point);
    setSelectedSourceId(null);
    setSearchInitiated(true);
  };

  return (
    <>
      <Map
        defaultCenter={{ lat: 40.416775, lng: -3.703790 }}
        defaultZoom={6}
        center={center || undefined}
        gestureHandling={'greedy'}
        disableDefaultUI={true}
        mapId="a3b021396b3b1df4"
        onClick={handleClick}
      >
        <MapOverlays />

        {selectedPosition && selectedSource && (
             <InfoWindow
                position={selectedPosition}
                onCloseClick={() => setSelectedSourceId(null)}
              >
                <InfoWindowContent source={selectedSource} />
              </InfoWindow>
        )}
      </Map>
      <GeolocateControl />
      <MapLegend />
    </>
  );
}
