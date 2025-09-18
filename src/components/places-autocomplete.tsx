'use client';

import { useRef, useEffect } from 'react';
import { useMap } from '@vis.gl/react-google-maps';
import { useBiomassStore } from '@/store/biomass-store';
import { Input } from '@/components/ui/input';
import { useTranslation } from '@/hooks/use-translation';

export default function PlacesAutocomplete() {
  const { t } = useTranslation();
  const { setCenter, setSearchInitiated, setIsOutOfSpainDialogOpen } = useBiomassStore();
  const map = useMap();
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  useEffect(() => {
    if (!map || !inputRef.current) return;

    autocompleteRef.current = new google.maps.places.Autocomplete(
      inputRef.current,
      {
        fields: ['geometry.location', 'name', 'address_components'],
        types: ['geocode'],
      }
    );

    const listener = autocompleteRef.current.addListener('place_changed', () => {
      const place = autocompleteRef.current?.getPlace();
      
      const isSpain = place?.address_components?.some(
        (component) =>
          component.types.includes("country") && component.short_name === "ES"
      );

      if (!isSpain) {
        setIsOutOfSpainDialogOpen(true);
        if (inputRef.current) {
            inputRef.current.value = "";
        }
        return;
      }
      
      if (place?.geometry?.location) {
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        const point = { lat, lng };
        
        setCenter(point);
        setSearchInitiated(true);
        map.panTo({ lat, lng });
        map.setZoom(10);
      }
    });

    return () => {
        if(autocompleteRef.current) {
            google.maps.event.clearInstanceListeners(autocompleteRef.current);
        }
    };
  }, [map, setCenter, setSearchInitiated, setIsOutOfSpainDialogOpen]);

  return (
    <Input
      ref={inputRef}
      placeholder={t('search_location_placeholder')}
      className="w-full"
    />
  );
}
