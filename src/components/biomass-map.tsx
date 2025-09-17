'use client';

import { useEffect, useState, useRef } from 'react';
import { Map, useMap, AdvancedMarker, Pin, InfoWindow } from '@vis.gl/react-google-maps';
import { useBiomassStore, isPointInSpain } from '@/store/biomass-store';
import { Icons, getBiomassIcon, getColoredBiomassIcon } from './icons';
import type { BiomassSource, BiomassType } from '@/lib/types';
import MapLegend from './map-legend';
import { useTranslation } from '@/hooks/use-translation';
import GeolocateControl from './geolocate-control';
import CadastralLayer from './cadastral-layer';

function Markers() {
  const map = useMap();
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

function RadiusCircle() {
  const map = useMap();
  const { center, radiusKm, searchInitiated } = useBiomassStore();
  const [circle, setCircle] = useState<google.maps.Circle | null>(null);

  useEffect(() => {
    if (!map) return;

    if (!circle) {
      setCircle(
        new google.maps.Circle({
          strokeColor: 'hsl(var(--primary))',
          strokeOpacity: 0.8,
          strokeWeight: 2,
          fillColor: 'hsl(var(--primary))',
          fillOpacity: 0.1,
          map,
        })
      );
    }

    return () => {
      if (circle) {
        circle.setMap(null);
      }
    };
  }, [map, circle]);

  useEffect(() => {
    if (circle && center && searchInitiated) {
      circle.setCenter(center);
      circle.setRadius(radiusKm * 1000);
      circle.setVisible(true);
    } else {
      circle?.setVisible(false);
    }
  }, [circle, center, radiusKm, searchInitiated]);

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
  const { center, setCenter, setMap, selectedSourceId, setSelectedSourceId, setSearchInitiated, setIsOutOfSpainDialogOpen } = useBiomassStore();
  const map = useMap();
  const isDragging = useRef(false);

  useEffect(() => {
    if (map) setMap(map);
  }, [map, setMap]);

  const selectedSource = useBiomassStore(s => s.results.find(r => r.id === s.selectedSourceId));
  const selectedPosition = selectedSource ? {
    lat: JSON.parse(selectedSource.geom_geojson).coordinates[1],
    lng: JSON.parse(selectedSource.geom_geojson).coordinates[0],
  } : null;
  
  const handleDragStart = () => {
    isDragging.current = true;
  };
  
  const handleDragEnd = () => {
    // We use a small timeout to ensure the click event after a drag is ignored.
    setTimeout(() => {
        isDragging.current = false;
    }, 50);
  };

  const handleClick = (e: { detail: { latLng: google.maps.LatLngLiteral | null; } }) => {
    if (isDragging.current) {
        return;
    }

    if (!e.detail.latLng) {
      return;
    }

    const point = { lat: e.detail.latLng.lat, lng: e.detail.latLng.lng };

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
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <Markers />
        <RadiusCircle />
        <CadastralLayer />
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
