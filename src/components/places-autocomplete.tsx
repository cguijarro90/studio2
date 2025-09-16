'use client';

import { useRef, useEffect } from 'react';
import { useMap } from '@vis.gl/react-google-maps';
import { useBiomassStore } from '@/store/biomass-store';
import { Input } from '@/components/ui/input';
import { useTranslation } from '@/hooks/use-translation';

export default function PlacesAutocomplete() {
  const { t } = useTranslation();
  const setCenter = useBiomassStore((s) => s.setCenter);
  const map = useMap();
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  useEffect(() => {
    if (!map || !inputRef.current) return;

    autocompleteRef.current = new google.maps.places.Autocomplete(
      inputRef.current,
      {
        fields: ['geometry.location', 'name'],
        types: ['geocode'],
      }
    );

    const listener = autocompleteRef.current.addListener('place_changed', () => {
      const place = autocompleteRef.current?.getPlace();
      if (place?.geometry?.location) {
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        setCenter({ lat, lng });
        map.panTo({ lat, lng });
        map.setZoom(10);
      }
    });

    return () => {
        if(autocompleteRef.current) {
            google.maps.event.clearInstanceListeners(autocompleteRef.current);
        }
    };
  }, [map, setCenter]);

  return (
    <Input
      ref={inputRef}
      placeholder={t('search_location_placeholder')}
      className="w-full"
    />
  );
}
