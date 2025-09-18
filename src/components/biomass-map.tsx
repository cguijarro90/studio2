'use client';

import { useEffect, useState, useRef } from 'react';
import { Map, useMap, AdvancedMarker, Pin, InfoWindow } from '@vis.gl/react-google-maps';
import { useBiomassStore } from '@/store/biomass-store';
import { Icons, getBiomassIcon, getColoredBiomassIcon } from './icons';
import type { BiomassSource, BiomassType } from '@/lib/types';
import MapLegend from './map-legend';
import { useTranslation } from '@/hooks/use-translation';
import GeolocateControl from './geolocate-control';

function Markers() {
  const { results, setSelectedSourceId } = useBiomassStore();

  const getPinStyle = (type: string) => {
    const lowerCaseType = type?.toLowerCase() || '';
    if (lowerCaseType.includes('biomasa')) {
        return { background: 'hsl(var(--chart-3))', borderColor: 'hsl(var(--chart-3))' };
    }
    if (lowerCaseType.includes('cogeneración')) {
        return { background: 'hsl(var(--chart-2))', borderColor: 'hsl(var(--chart-2))' };
    }
    if (lowerCaseType.includes('residuos')) {
        return { background: 'hsl(var(--chart-4))', borderColor: 'hsl(var(--chart-4))' };
    }
    return { background: 'hsl(var(--chart-1))', borderColor: 'hsl(var(--chart-1))' };
  };

  return (
    <>
      {results.map((poi: BiomassSource) => {
        try {
            const locationObject = JSON.parse(poi.geom_geojson);
            const pointString = locationObject.value;
            const coords = pointString.replace('POINT(', '').replace(')', '').split(' ');
            const lng = parseFloat(coords[0]);
            const lat = parseFloat(coords[1]);

            if (isNaN(lat) || isNaN(lng)) return null;

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
        } catch (e) {
            console.error("Failed to parse coordinates for", poi, e);
            return null;
        }
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
                <span className="ml-2 capitalize">{source.type}</span>
            </div>
             <div className="flex items-center mt-1">
                <Icons.weight className="w-4 h-4 text-muted-foreground" />
                <span className="ml-2">{source.quantity.toLocaleString()} {t('mw')}</span>
            </div>
        </div>
    );
}

export default function BiomassMap() {
  const { center, setCenter, setMap, selectedSourceId, setSelectedSourceId, setSearchInitiated } = useBiomassStore();
  const map = useMap();
  
  useEffect(() => {
    if (map) setMap(map);
  }, [map, setMap]);

  const selectedSource = useBiomassStore(s => s.results.find(r => r.id === s.selectedSourceId));
  
  let selectedPosition: google.maps.LatLngLiteral | null = null;
    if (selectedSource) {
        try {
            const locationObject = JSON.parse(selectedSource.geom_geojson);
            const pointString = locationObject.value;
            const coords = pointString.replace('POINT(', '').replace(')', '').split(' ');
            const lng = parseFloat(coords[0]);
            const lat = parseFloat(coords[1]);
            if (!isNaN(lat) && !isNaN(lng)) {
                selectedPosition = { lat, lng };
            }
        } catch (e) {
            console.error("Failed to parse selected source coordinates", e);
        }
    }


  return (
    <>
      <Map
        defaultCenter={{ lat: 40.416775, lng: -3.703790 }}
        defaultZoom={6}
        center={center || undefined}
        gestureHandling={'greedy'}
        disableDefaultUI={true}
        mapId="a3b021396b3b1df4"
        onClick={(e) => {
          if (e.detail.latLng) {
            setCenter(e.detail.latLng);
            setSelectedSourceId(null);
            setSearchInitiated(true);
          }
        }}
      >
        <Markers />
        <RadiusCircle />
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
