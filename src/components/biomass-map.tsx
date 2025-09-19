
'use client';

import { useEffect, useState, useRef, useMemo } from 'react';
import { Map, useMap, AdvancedMarker, Pin, InfoWindow } from '@vis.gl/react-google-maps';
import { useBiomassStore } from '@/store/biomass-store';
import { Icons, getBiomassIcon, getColoredBiomassIcon } from './icons';
import type { BiomassSource, AgriculturalPlot } from '@/lib/types';
import MapLegend from './map-legend';
import { useTranslation } from '@/hooks/use-translation';
import GeolocateControl from './geolocate-control';
import CoordinatesDisplay from './coordinates-display';
import { Button } from './ui/button';

const getCoordinates = (geom: string): [number, number] | null => {
    try {
        const data = JSON.parse(geom);
        // BigQuery returns GEOGRAPHY data in a wrapper object with a 'value' property
        // which can contain either a GeoJSON string or a WKT string.
        if (data && data.value) {
            const innerValue = data.value;
            try {
                // Case 1: The inner value is a GeoJSON string
                const geoJson = JSON.parse(innerValue);
                if (geoJson.coordinates && Array.isArray(geoJson.coordinates) && geoJson.coordinates.length === 2) {
                    return geoJson.coordinates as [number, number];
                }
            } catch (e) {
                // Case 2: The inner value is a WKT string like "POINT(lng lat)"
                if (typeof innerValue === 'string' && innerValue.startsWith('POINT')) {
                    const match = innerValue.match(/POINT\(([-\d.]+) ([-\d.]+)\)/);
                    if (match && match.length === 3) {
                        return [parseFloat(match[1]), parseFloat(match[2])];
                    }
                }
            }
        }
        // Fallback for simple GeoJSON object
        if (data.coordinates && Array.isArray(data.coordinates) && data.coordinates.length === 2) {
            return data.coordinates as [number, number];
        }

    } catch (e) {
        console.error("Failed to parse coordinates", geom, e);
    }
    return null;
};


function Markers() {
  const { mapResults, overlays, setSelectedSourceId } = useBiomassStore();
  
  const shouldShowMarkers = overlays.biomassPlants;

  if (!shouldShowMarkers) {
      return null;
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
      {mapResults.map((poi: BiomassSource) => {
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

// Simple hash function to get a color from a string
const stringToColor = (str: string) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  let color = '#';
  for (let i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 0xFF;
    color += ('00' + value.toString(16)).substr(-2);
  }
  return color;
};

const AgriculturalPolygons = () => {
  const map = useMap();
  const { agriculturalPlots, overlays } = useBiomassStore();
  const [polygons, setPolygons] = useState<google.maps.Polygon[]>([]);
  const [selectedPlot, setSelectedPlot] = useState<AgriculturalPlot | null>(null);
  const [infoWindowPos, setInfoWindowPos] = useState<google.maps.LatLngLiteral | null>(null);
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);

  useEffect(() => {
    if (!map) return;

    if (infoWindowRef.current === null) {
        infoWindowRef.current = new google.maps.InfoWindow({
            pixelOffset: new google.maps.Size(0, -10),
            disableAutoPan: true,
        });
    }

    const iw = infoWindowRef.current;
    
    return () => {
        iw?.close();
    }
  }, [map]);


  const cropTypeColors = useMemo(() => {
    if (!agriculturalPlots) return {};
    const uniqueCropTypes = [...new Set(agriculturalPlots.map(p => p.cropType))];
    const colors: { [key: string]: string } = {};
    uniqueCropTypes.forEach(type => {
      colors[type] = stringToColor(type);
    });
    return colors;
  }, [agriculturalPlots]);

  useEffect(() => {
    if (!map) return;

    // Clear existing polygons
    polygons.forEach(p => p.setMap(null));
    setPolygons([]);

    if (!overlays.agriculturalData || !agriculturalPlots) {
      return;
    }
    
    const newPolygons = agriculturalPlots.map(plot => {
      try {
        const geoJson = JSON.parse(plot.geometry);
        const paths = geoJson.coordinates[0][0].map(([lng, lat]: [number, number]) => ({ lat, lng }));
        
        const polygon = new google.maps.Polygon({
          paths: paths,
          strokeColor: cropTypeColors[plot.cropType],
          strokeOpacity: 0.8,
          strokeWeight: 1,
          fillColor: cropTypeColors[plot.cropType],
          fillOpacity: 0.35,
          clickable: true,
        });

        polygon.addListener('click', (e: google.maps.PolyMouseEvent) => {
            setSelectedPlot(plot);
            setInfoWindowPos(e.latLng!.toJSON());
        });
        
        polygon.setMap(map);
        return polygon;
      } catch (e) {
        console.error("Failed to parse plot geometry", e);
        return null;
      }
    }).filter((p): p is google.maps.Polygon => p !== null);

    setPolygons(newPolygons);

    return () => {
        newPolygons.forEach(p => p.setMap(null));
    };

  }, [map, agriculturalPlots, overlays.agriculturalData, cropTypeColors]);


  if (selectedPlot && infoWindowPos && infoWindowRef.current) {
    return (
         <InfoWindow
          position={infoWindowPos}
          onCloseClick={() => setSelectedPlot(null)}
          headerDisabled
        >
            <div className="p-1 min-w-48">
             <div className="flex justify-between items-start">
                <h3 className="font-bold text-base text-foreground mb-2 pr-4">{selectedPlot.cropType}</h3>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setSelectedPlot(null)}><Icons.close className="w-4 h-4" /></Button>
            </div>
            <div className="space-y-2 text-sm">
                <div className="flex items-center">
                    <Icons.pin className="w-4 h-4 text-muted-foreground" />
                    <span className="ml-2">{selectedPlot.province}</span>
                </div>
                <div className="flex items-center">
                    <Icons.layers className="w-4 h-4 text-muted-foreground" />
                    <span className="ml-2">{selectedPlot.area_ha.toFixed(2)} ha</span>
                </div>
            </div>
        </div>
        </InfoWindow>
    )
  }

  return null;
};


function InfoWindowContent({source, onClose}: {source: BiomassSource, onClose: () => void}) {
    const { t } = useTranslation();
    return (
        <div className="p-1 min-w-48">
             <div className="flex justify-between items-start">
                <h3 className="font-bold text-base text-foreground mb-2 pr-4">{source.name}</h3>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onClose}><Icons.close className="w-4 h-4" /></Button>
            </div>
            <div className="space-y-2 text-sm">
                <div className="flex items-center">
                    {getColoredBiomassIcon(source.type)}
                    <span className="ml-2 capitalize">{t(source.type as any)}</span>
                </div>
                <div className="flex items-center">
                    <Icons.zap className="w-4 h-4 text-muted-foreground" />
                    <span className="ml-2">{source.quantity.toLocaleString()} {t('mw' as any)}</span>
                </div>
            </div>
        </div>
    );
}

const checkIsSpain = (
    latLng: google.maps.LatLng,
    onResult: (isSpain: boolean) => void
  ) => {
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ location: latLng }, (results, status) => {
      if (status === "OK" && results) {
        for (const result of results) {
          for (const component of result.address_components) {
            if (
              component.types.includes("country") &&
              component.short_name === "ES"
            ) {
              onResult(true);
              return;
            }
          }
        }
      }
      onResult(false);
    });
  };

export default function BiomassMap() {
  const { center, setCenter, setMap, selectedSourceId, setSelectedSourceId, map: storeMap, setIsOutOfSpainDialogOpen, setSearchInitiated } = useBiomassStore();
  const selectedSource = useBiomassStore(s => s.results.find(r => r.id === s.selectedSourceId));
  const map = useMap();
  
  useEffect(() => {
    if (map) setMap(map);
  }, [map, setMap]);

  useEffect(() => {
    if (storeMap && center) {
        storeMap.panTo(center);
    }
  }, [center, storeMap]);
  
  useEffect(() => {
    if (selectedSource && storeMap) {
      const coordinates = getCoordinates(selectedSource.geom_geojson);
      if (coordinates) {
        const [lng, lat] = coordinates;
        storeMap.panTo({ lat, lng });
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
        gestureHandling={'greedy'}
        disableDefaultUI={true}
        mapId="a3b021396b3b1df4"
        onClick={(e) => {
            if (e.detail.latLng) {
              const point = e.detail.latLng;
              checkIsSpain(new google.maps.LatLng(point.lat, point.lng), (isSpain) => {
                if (!isSpain) {
                  setIsOutOfSpainDialogOpen(true);
                  return;
                }
                setCenter({ lat: point.lat, lng: point.lng });
                setSelectedSourceId(null);
                setSearchInitiated(true);
              });
            }
          }}
      >
        <Markers />
        <RadiusCircle />
        <AgriculturalPolygons />
        {selectedPosition && selectedSource && (
             <InfoWindow
                position={selectedPosition}
                pixelOffset={[0, -40]}
                onCloseClick={() => setSelectedSourceId(null)}
                headerDisabled
              >
                <InfoWindowContent source={selectedSource} onClose={() => setSelectedSourceId(null)} />
              </InfoWindow>
        )}
      </Map>
      <GeolocateControl />
      <MapLegend />
      <CoordinatesDisplay />
    </>
  );
}
