
'use client';

import { useEffect, useState, useRef, useMemo } from 'react';
import { Map, useMap, AdvancedMarker, Pin, InfoWindow } from '@vis.gl/react-google-maps';
import { useBiomassStore } from '@/store/biomass-store';
import { Icons, getBiomassIcon, getColoredBiomassIcon } from './icons';
import type { BiomassSource, AgriculturalPlot, ForestPlot } from '@/lib/types';
import MapLegend from './map-legend';
import AgriculturalLegend from './agricultural-legend';
import ForestLegend from './forest-legend';
import { useTranslation } from '@/hooks/use-translation';
import GeolocateControl from './geolocate-control';
import CoordinatesDisplay from './coordinates-display';
import { Button } from './ui/button';

const getCoordinates = (geom: string): [number, number] | null => {
    try {
        const data = JSON.parse(geom);
        if (data && data.value) {
            const innerValue = data.value;
            try {
                const geoJson = JSON.parse(innerValue);
                if (geoJson.coordinates && Array.isArray(geoJson.coordinates) && geoJson.coordinates.length === 2) {
                    return geoJson.coordinates as [number, number];
                }
            } catch (e) {
                if (typeof innerValue === 'string' && innerValue.startsWith('POINT')) {
                    const match = innerValue.match(/POINT\(([-\d.]+) ([-\d.]+)\)/);
                    if (match && match.length === 3) {
                        return [parseFloat(match[1]), parseFloat(match[2])];
                    }
                }
            }
        }
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
          clickable: false, // Make the circle non-clickable
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

// Function to calculate the center of a polygon
const getPolygonCenter = (geometry: google.maps.Data.Polygon | google.maps.Data.MultiPolygon): google.maps.LatLng => {
    const bounds = new google.maps.LatLngBounds();
    const processPath = (path: google.maps.Data.LinearRing | google.maps.LatLng[]) => {
      const gmapsPath = path instanceof google.maps.Data.LinearRing ? path.getArray() : path;
      for (let i = 0; i < gmapsPath.length; i++) {
        bounds.extend(gmapsPath[i]);
      }
    };
  
    if (geometry.getType() === 'Polygon') {
        (geometry as google.maps.Data.Polygon).getArray().forEach(processPath);
    } else if (geometry.getType() === 'MultiPolygon') {
        (geometry as google.maps.Data.MultiPolygon).getArray().forEach(polygon => polygon.getArray().forEach(processPath));
    }
    
    return bounds.getCenter();
  };

const AgriculturalPolygons = () => {
  const map = useMap();
  const { agriculturalPlots, overlays, setCropTypeColors, cropTypeColors } = useBiomassStore();
  const [selectedPlot, setSelectedPlot] = useState<{[key: string]: any} | null>(null);
  const [infoWindowPos, setInfoWindowPos] = useState<google.maps.LatLng | null>(null);
  const dataLayerRef = useRef<google.maps.Data | null>(null);
  const clickListenerRef = useRef<google.maps.MapsEventListener | null>(null);
  const { t } = useTranslation();

  useEffect(() => {
    if (!agriculturalPlots) return;
    const uniqueCropTypes = [...new Set(agriculturalPlots.map(p => p.cropType))];
    const colors: { [key: string]: string } = {};
    uniqueCropTypes.forEach(type => {
      colors[type] = stringToColor(type);
    });
    setCropTypeColors(colors);
  }, [agriculturalPlots, setCropTypeColors]);

  useEffect(() => {
    if (!map) return;
    
    if (!dataLayerRef.current) {
        dataLayerRef.current = new google.maps.Data({ map });
    }
    const dataLayer = dataLayerRef.current;

    // Clear previous data and listeners
    dataLayer.forEach(feature => dataLayer.remove(feature));
    if (clickListenerRef.current) {
        clickListenerRef.current.remove();
    }
    setSelectedPlot(null);

    if (overlays.agriculturalData && agriculturalPlots.length > 0) {
      try {
        dataLayer.addGeoJson({
          type: 'FeatureCollection',
          features: agriculturalPlots.map(plot => ({
            type: 'Feature',
            geometry: JSON.parse(plot.geometry),
            properties: {
              id: plot.id,
              cropType: plot.cropType,
              province: plot.province,
              area_ha: plot.area_ha,
            },
          })),
        });

        dataLayer.setStyle(feature => {
            const cropType = feature.getProperty('cropType');
            const color = cropTypeColors[cropType] || '#808080';
            return {
            fillColor: color,
            strokeColor: color,
            strokeWeight: 1,
            fillOpacity: 0.35,
            };
        });

        clickListenerRef.current = dataLayer.addListener('click', (event: google.maps.Data.MouseEvent) => {
            const plotData = {
                id: event.feature.getProperty('id'),
                cropType: event.feature.getProperty('cropType'),
                province: event.feature.getProperty('province'),
                area_ha: event.feature.getProperty('area_ha'),
            };
            setSelectedPlot(plotData);
            
            const geometry = event.feature.getGeometry();
            if (geometry) {
                const center = getPolygonCenter(geometry as google.maps.Data.Polygon);
                setInfoWindowPos(center);
            } else if (event.latLng) {
                setInfoWindowPos(event.latLng);
            }
        });
      } catch (error) {
        console.error("Error adding GeoJSON to map:", error);
      }
    }
    
    return () => {
        if (clickListenerRef.current) {
            clickListenerRef.current.remove();
        }
    };

  }, [map, agriculturalPlots, overlays.agriculturalData, cropTypeColors]);


  if (selectedPlot && infoWindowPos) {
    return (
         <InfoWindow
          position={infoWindowPos}
          onCloseClick={() => setSelectedPlot(null)}
          headerDisabled
        >
            <div className="p-1 min-w-48">
             <div className="flex justify-between items-start">
                <div className="flex items-center gap-2 font-bold text-base text-foreground mb-2 pr-4">
                    <Icons.wheat className="w-5 h-5 text-muted-foreground" />
                    <h3 className="capitalize">{selectedPlot.cropType}</h3>
                </div>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setSelectedPlot(null)}><Icons.close className="w-4 h-4" /></Button>
            </div>
            <div className="space-y-2 text-sm">
                <div className="flex items-center">
                    <Icons.pin className="w-4 h-4 text-muted-foreground" />
                    <span className="ml-2 font-semibold">{t('province' as any)}:</span>
                    <span className="ml-1">{selectedPlot.province}</span>
                </div>
                <div className="flex items-center">
                    <Icons.layers className="w-4 h-4 text-muted-foreground" />
                    <span className="ml-2 font-semibold">{t('area' as any)}:</span>
                    <span className="ml-1">{selectedPlot.area_ha.toFixed(2)} ha</span>
                </div>
            </div>
        </div>
        </InfoWindow>
    )
  }

  return null;
};

const ForestPolygons = () => {
    const map = useMap();
    const { forestPlots, overlays, setForestSpeciesColors, forestSpeciesColors } = useBiomassStore();
    const [selectedPlot, setSelectedPlot] = useState<ForestPlot | null>(null);
    const [infoWindowPos, setInfoWindowPos] = useState<google.maps.LatLng | null>(null);
    const dataLayerRef = useRef<google.maps.Data | null>(null);
    const clickListenerRef = useRef<google.maps.MapsEventListener | null>(null);
    const { t } = useTranslation();
  
    useEffect(() => {
      if (!forestPlots) return;
      const uniqueSpecies = [...new Set(forestPlots.map(p => p.species))];
      const colors: { [key: string]: string } = {};
      uniqueSpecies.forEach(type => {
        colors[type] = stringToColor(type);
      });
      setForestSpeciesColors(colors);
    }, [forestPlots, setForestSpeciesColors]);
  
    useEffect(() => {
      if (!map) return;
      
      if (!dataLayerRef.current) {
          dataLayerRef.current = new google.maps.Data({ map });
      }
      const dataLayer = dataLayerRef.current;
  
      dataLayer.forEach(feature => dataLayer.remove(feature));
      if (clickListenerRef.current) {
          clickListenerRef.current.remove();
      }
      setSelectedPlot(null);
  
      if (overlays.forestData && forestPlots.length > 0) {
        try {
          dataLayer.addGeoJson({
            type: 'FeatureCollection',
            features: forestPlots.map(plot => ({
              type: 'Feature',
              geometry: JSON.parse(plot.geometry),
              properties: { ...plot },
            })),
          });
  
          dataLayer.setStyle(feature => {
              const species = feature.getProperty('species');
              const color = forestSpeciesColors[species] || '#808080';
              return {
                fillColor: color,
                strokeColor: color,
                strokeWeight: 1,
                fillOpacity: 0.45,
              };
          });
  
          clickListenerRef.current = dataLayer.addListener('click', (event: google.maps.Data.MouseEvent) => {
              const plotData: ForestPlot = {
                  id: event.feature.getProperty('id'),
                  species: event.feature.getProperty('species'),
                  geometry: '',
              };
              setSelectedPlot(plotData);
              
              const geometry = event.feature.getGeometry();
              if (geometry) {
                  const center = getPolygonCenter(geometry as google.maps.Data.Polygon);
                  setInfoWindowPos(center);
              } else if (event.latLng) {
                  setInfoWindowPos(event.latLng);
              }
          });
        } catch (error) {
          console.error("Error adding Forest GeoJSON to map:", error);
        }
      }
      
      return () => {
          if (clickListenerRef.current) {
              clickListenerRef.current.remove();
          }
      };
  
    }, [map, forestPlots, overlays.forestData, forestSpeciesColors]);
  
  
    if (selectedPlot && infoWindowPos) {
      return (
           <InfoWindow
            position={infoWindowPos}
            onCloseClick={() => setSelectedPlot(null)}
            headerDisabled
          >
              <div className="p-1 min-w-48">
               <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2 font-bold text-base text-foreground mb-2 pr-4">
                      <Icons.trees className="w-5 h-5 text-muted-foreground" />
                      <h3 className="capitalize">{t('forest_species' as any)}</h3>
                  </div>
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setSelectedPlot(null)}><Icons.close className="w-4 h-4" /></Button>
              </div>
              <div className="space-y-2 text-sm">
                  <div className="flex items-center">
                      <span className="ml-2 font-semibold">{selectedPlot.species}</span>
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
  const [mapTypeControlOptions, setMapTypeControlOptions] = useState<google.maps.MapTypeControlOptions | undefined>(undefined);
  
  useEffect(() => {
    if (map) setMap(map);
  }, [map, setMap]);

  useEffect(() => {
    if (typeof window !== 'undefined' && typeof google !== 'undefined') {
        setMapTypeControlOptions({
            position: google.maps.ControlPosition.BOTTOM_LEFT,
        });
    }
  }, []);

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
        mapTypeControl={true}
        mapTypeControlOptions={mapTypeControlOptions}
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
        <ForestPolygons />
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
      <div className="absolute bottom-4 left-4 flex flex-col gap-2">
        <MapLegend />
        <AgriculturalLegend />
        <ForestLegend />
      </div>
      <CoordinatesDisplay />
    </>
  );
}
