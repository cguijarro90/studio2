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
        setSearchInitiated(true);
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

        const lang = params.get('lang');
        if (lang === 'en' || lang === 'es') setLocale(lang);
      }
      isInitialLoad.current = false;
    }
  }, []); // Changed dependencies to run only once

  // Write to URL when state changes (only if search has been initiated)
  useEffect(() => {
    if (isInitialLoad.current || !searchInitiated) return;

    const params = new URLSearchParams(searchParams.toString());
    let changed = false;

    if (debouncedCenter) {
      const currentLat = parseFloat(params.get('lat') || '0').toFixed(6);
      const currentLng = parseFloat(params.get('lng') || '0').toFixed(6);
      const newLat = debouncedCenter.lat.toFixed(6);
      const newLng = debouncedCenter.lng.toFixed(6);

      if (currentLat !== newLat || currentLng !== newLng) {
        params.set('lat', newLat);
        params.set('lng', newLng);
        changed = true;
      }
    }

    if (params.get('radius') !== debouncedRadiusKm.toString()) {
      params.set('radius', debouncedRadiusKm.toString());
      changed = true;
    }
    
    const currentTypes = params.get('types') || '';
    const newTypes = debouncedBiomassTypes.join(',');
    if (debouncedBiomassTypes.length < BIOMASS_TYPES.length) {
      if (currentTypes !== newTypes) {
        params.set('types', newTypes);
        changed = true;
      }
    } else {
       if(params.has('types')) {
         params.delete('types');
         changed = true;
       }
    }
    
    const currentPage = params.get('page') || '1';
    const newPage = debouncedPage.toString();
    if (debouncedPage > 1) {
       if (currentPage !== newPage) {
           params.set('page', newPage);
           changed = true;
       }
    } else {
        if (params.has('page')) {
            params.delete('page');
            changed = true;
        }
    }

    if (locale !== params.get('lang')) {
        params.set('lang', locale);
        changed = true;
    }
    
    if (changed) {
        router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    }

  }, [debouncedCenter, debouncedRadiusKm, debouncedBiomassTypes, debouncedPage, locale, pathname, router, searchParams, searchInitiated]);
}
