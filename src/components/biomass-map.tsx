'use client';

import { useEffect, useState, useRef } from 'react';
import { Map, useMap, AdvancedMarker, Pin, InfoWindow } from '@vis.gl/react-google-maps';
import { MarkerClusterer } from '@googlemaps/markerclusterer';
import { useBiomassStore } from '@/store/biomass-store';
import { Icons, getBiomassIcon, getColoredBiomassIcon } from './icons';
import type { BiomassSource, BiomassType } from '@/lib/types';
import MapLegend from './map-legend';
import { useTranslation } from '@/hooks/use-translation';
import GeolocateControl from './geolocate-control';

// Helper to safely extract coordinates from various GeoJSON/WKT formats
const getCoordinates = (geom: string): [number, number] | null => {
    try {
        const geojson = JSON.parse(geom);
        // Handle standard GeoJSON Point
        if (geojson.coordinates) {
            return geojson.coordinates;
        }
        // Handle BigQuery's geography type which wraps GeoJSON in a 'value' property
        if (geojson.value) {
            const innerJson = JSON.parse(geojson.value);
            if (innerJson.coordinates) {
                return innerJson.coordinates;
            }
        }
        return null;
    } catch (e) {
        // Fallback for non-JSON strings, like WKT "POINT(lng lat)"
        if (typeof geom === 'string' && geom.startsWith('POINT')) {
            const match = geom.match(/POINT\(([-\d.]+) ([-\d.]+)\)/);
            if (match && match.length === 3) {
                return [parseFloat(match[1]), parseFloat(match[2])];
            }
        }
        console.error("Failed to parse coordinates", geom, e);
        return null;
    }
};


function Markers() {
  const map = useMap();
  const { results, overlays, setSelectedSourceId } = useBiomassStore();
  const clusterer = useRef<MarkerClusterer | null>(null);

  useEffect(() => {
    if (!map) return;
    if (!clusterer.current) {
      clusterer.current = new MarkerClusterer({ map });
    }
  }, [map]);

  useEffect(() => {
    clusterer.current?.clearMarkers();
    if (overlays.clusters && results.length > 0) {
      const markers = results.map(poi => {
        const coordinates = getCoordinates(poi.geom_geojson);
        if (!coordinates) return null;
        const [lng, lat] = coordinates;
        const marker = new google.maps.Marker({ position: { lat, lng } });
        marker.addListener('click', () => {
          setSelectedSourceId(poi.id);
          map?.panTo({ lat, lng });
          map?.setZoom(14);
        });
        return marker;
      }).filter(Boolean) as google.maps.Marker[];
      clusterer.current.addMarkers(markers);
    }
  }, [map, results, overlays.clusters, setSelectedSourceId]);

  if (overlays.clusters) {
    return null; // MarkerClusterer is handling markers
  }

  const getPinStyle = (type: string) => {
    const lowerCaseType = type?.toLowerCase() || '';
    if (lowerCaseType.includes('cogeneración')) {
      return { background: 'hsl(var(--chart-2))', borderColor: 'hsl(var(--chart-2))' };
    }
    if (lowerCaseType.includes('biomasa')) {
      return { background: 'hsl(var(--chart-3))', borderColor: 'hsl(var(--chart-3))' };
    }
    if (lowerCaseType.includes('residuos')) {
      return { background: 'hsl(var(--chart-4))', borderColor: 'hsl(var(--chart-4))' };
    }
    return { background: 'hsl(var(--chart-1))', borderColor: 'hsl(var(--chart-1))' };
  };

  return (
    <>
      {results.map((poi: BiomassSource) => {
        const coordinates = getCoordinates(poi.geom_geojson);
        if (!coordinates) return null;
        const [lng, lat] = coordinates;
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

function Heatmap() {
    const map = useMap();
    const { results, overlays } = useBiomassStore();
    const [heatmap, setHeatmap] = useState<google.maps.visualization.HeatmapLayer | null>(null);

    useEffect(() => {
        if (!map) return;
        if (!heatmap) {
            setHeatmap(new google.maps.visualization.HeatmapLayer({
                map,
                radius: 40,
            }));
        }
        return () => {
            heatmap?.setMap(null);
        };
    }, [map, heatmap]);

    useEffect(() => {
        if (heatmap) {
            if (overlays.heatmap && results.length > 0) {
                const data = results.map(poi => {
                    const coordinates = getCoordinates(poi.geom_geojson);
                    if (!coordinates) return null;
                    const [lng, lat] = coordinates;
                    return new google.maps.LatLng(lat, lng);
                }).filter(Boolean) as google.maps.LatLng[];
                heatmap.setData(data);
                heatmap.setMap(map);
            } else {
                heatmap.setMap(null);
            }
        }
    }, [heatmap, results, overlays.heatmap, map]);

    return null;
}

function InfoWindowContent({source}: {source: BiomassSource}) {
    const { t } = useTranslation();
    return (
        <div className="p-2">
            <h3 className="font-bold text-lg">{source.name}</h3>
            <div className="flex items-center mt-2">
                {getColoredBiomassIcon(source.type)}
                <span className="ml-2 capitalize">{t(source.type as any)}</span>
            </div>
             <div className="flex items-center mt-1">
                <Icons.weight className="w-4 h-4 text-muted-foreground" />
                <span className="ml-2">{source.quantity.toLocaleString()} {t('mw' as any)}</span>
            </div>
        </div>
    );
}

export default function BiomassMap() {
  const { center, setCenter, setMap, selectedSourceId, setSelectedSourceId, setSearchInitiated, map: storeMap } = useBiomassStore();
  const map = useMap();
  
  useEffect(() => {
    if (map) setMap(map);
  }, [map, setMap]);

  const selectedSource = useBiomassStore(s => s.results.find(r => r.id === s.selectedSourceId));
  
  useEffect(() => {
    if (selectedSource && storeMap) {
      const coordinates = getCoordinates(selectedSource.geom_geojson);
      if (coordinates) {
        const [lng, lat] = coordinates;
        storeMap.panTo({ lat, lng });
        storeMap.setZoom(14);
      }
    }
  }, [selectedSource, storeMap]);


  const getSelectedPosition = () => {
    if (!selectedSource) return null;
    const coordinates = getCoordinates(selectedSource.geom_geojson);
    if(!coordinates) return null;
    const [lng, lat] = coordinates;
    return { lat, lng };
  };

  const selectedPosition = getSelectedPosition();

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
        <Heatmap />
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
