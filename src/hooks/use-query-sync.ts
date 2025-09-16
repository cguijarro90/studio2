'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useBiomassStore } from '@/store/biomass-store';
import type { BiomassType, Locale, Point } from '@/lib/types';
import { BIOMASS_TYPES } from '@/lib/types';
import { useDebounce } from './use-debounce';

export function useQuerySync() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isInitialLoad = useRef(true);

  const {
    center,
    radiusKm,
    biomassTypes,
    page,
    locale,
    searchInitiated,
    setCenter,
    setRadiusKm,
    setBiomassTypes,
    setPage,
    setLocale,
    setSearchInitiated,
  } = useBiomassStore();

  const debouncedCenter = useDebounce(center, 500);
  const debouncedRadiusKm = useDebounce(radiusKm, 500);
  const debouncedBiomassTypes = useDebounce(biomassTypes, 500);
  const debouncedPage = useDebounce(page, 500);

  // Read from URL on initial load
  useEffect(() => {
    if (isInitialLoad.current) {
      const params = new URLSearchParams(searchParams.toString());
      const lat = params.get('lat');
      const lng = params.get('lng');
      
      if (lat && lng) {
        setCenter({ lat: parseFloat(lat), lng: parseFloat(lng) });

        const radius = params.get('radius');
        if (radius) setRadiusKm(parseFloat(radius));

        const types = params.get('types');
        if (types) {
          const validTypes = types.split(',').filter(t => BIOMASS_TYPES.includes(t as BiomassType)) as BiomassType[];
          setBiomassTypes(validTypes);
        }

        const pageParam = params.get('page');
        if (pageParam) setPage(parseInt(pageParam, 10));
        
        // This indicates a search state is being restored from URL
        setSearchInitiated(true); 
      }
      
      const lang = params.get('lang');
      if (lang === 'en' || lang === 'es') setLocale(lang);
      
      isInitialLoad.current = false;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); 

  // Write to URL when state changes (only if search has been initiated)
  useEffect(() => {
    if (isInitialLoad.current || !searchInitiated) return;

    const params = new URLSearchParams();
    let changed = false;

    if (debouncedCenter) {
      params.set('lat', debouncedCenter.lat.toFixed(6));
      params.set('lng', debouncedCenter.lng.toFixed(6));
      changed = true;
    }

    if (debouncedRadiusKm) {
        params.set('radius', debouncedRadiusKm.toString());
        changed = true;
    }
    
    if (debouncedBiomassTypes && debouncedBiomassTypes.length < BIOMASS_TYPES.length) {
        params.set('types', debouncedBiomassTypes.join(','));
        changed = true;
    }
    
    if (debouncedPage > 1) {
       params.set('page', debouncedPage.toString());
       changed = true;
    }

    if (locale) {
        params.set('lang', locale);
        changed = true;
    }
    
    const currentQuery = searchParams.toString();
    const newQuery = params.toString();
    
    if (changed && currentQuery !== newQuery) {
        router.replace(`${pathname}?${newQuery}`, { scroll: false });
    }

  }, [debouncedCenter, debouncedRadiusKm, debouncedBiomassTypes, debouncedPage, locale, pathname, router, searchParams, searchInitiated]);
}
