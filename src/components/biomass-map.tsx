'use client';

import { useEffect, useState, useRef } from 'react';
import { Map, useMap, AdvancedMarker, Pin, InfoWindow } from '@vis.gl/react-google-maps';
import { useBiomassStore, isPointInSpain } from '@/store/biomass-store';
import { Icons, getBiomassIcon, getColoredBiomassIcon } from './icons';
import type { BiomassSource, BiomassType } from '@/lib/types';
import MapLegend from './map-legend';
import { useTranslation } from '@/hooks/use-translation';
import GeolocateControl from './geolocate-control';

function Markers() {
  const { results, setSelectedSourceId } = useBiomassStore();

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

function CadastralDataLayer() {
    const map = useMap();
    const parcels = useBiomassStore(s => s.cadastralParcels);
    const showCadastral = useBiomassStore(s => s.overlays.cadastral);

    useEffect(() => {
        if (!map) return;

        // Clear previous data features to avoid duplicates
        map.data.forEach(feature => {
            map.data.remove(feature);
        });

        if (showCadastral && parcels.length > 0) {
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
        
        map.data.setStyle({
            fillColor: 'hsl(var(--accent))',
            strokeColor: 'hsl(var(--primary))',
            strokeWeight: 1,
            fillOpacity: showCadastral ? 0.3 : 0,
            clickable: false,
        });

    }, [map, parcels, showCadastral]);
    
    return null;
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
  const { 
      center, 
      setCenter, 
      setMap, 
      selectedSourceId, 
      setSelectedSourceId, 
      setSearchInitiated, 
      setIsOutOfSpainDialogOpen,
      radiusKm,
      searchInitiated
  } = useBiomassStore();
  
  const map = useMap();
  const circleRef = useRef<google.maps.Circle | null>(null);
  
  useEffect(() => {
    if (map) setMap(map);
  }, [map, setMap]);

  useEffect(() => {
      if (!map) return;

      // Create the circle instance only once
      if (!circleRef.current) {
          circleRef.current = new google.maps.Circle({
              strokeColor: 'hsl(var(--primary))',
              strokeOpacity: 0.8,
              strokeWeight: 2,
              fillColor: 'hsl(var(--primary))',
              fillOpacity: 0.1,
              map: map,
              clickable: false, // Ensure circle does not intercept clicks
          });
      }

      // Update circle properties based on state
      if (center && searchInitiated) {
          circleRef.current.setCenter(center);
          circleRef.current.setRadius(radiusKm * 1000);
          circleRef.current.setVisible(true);
      } else {
          circleRef.current.setVisible(false);
      }
  }, [map, center, radiusKm, searchInitiated]);


  const selectedSource = useBiomassStore(s => s.results.find(r => r.id === s.selectedSourceId));
  const selectedPosition = selectedSource ? {
    lat: JSON.parse(selectedSource.geom_geojson).coordinates[1],
    lng: JSON.parse(selectedSource.geom_geojson).coordinates[0],
  } : null;
  
  const handleClick = (e: { detail: { latLng: google.maps.LatLngLiteral | null; } }) => {
    if (!e.detail.latLng) return;

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
        <Markers />
        <CadastralDataLayer />

        {selectedPosition && selectedSource && (
             <InfoWindow
                position={selectedPosition}
                onCloseClick={() => setSelectedSourceId(null)}
                disableAutoPan={true}
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
