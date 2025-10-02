'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useBiomassStore } from '@/store/biomass-store';
import type { BiomassType, Locale, Point } from '@/lib/types';
import { useDebounce } from './use-debounce';

export function useQuerySync() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isInitialLoad = useRef(true);

  const {
    center,
    radiusKm,
    page,
    locale,
    searchInitiated,
    isLiteVersion,
    setCenter,
    setRadiusKm,
    setPage,
    setLocale,
    setSearchInitiated,
  } = useBiomassStore();

  const debouncedCenter = useDebounce(center, 500);
  const debouncedRadiusKm = useDebounce(radiusKm, 500);
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
        if (radius) {
          let radiusValue = parseFloat(radius);
          if (isLiteVersion && radiusValue > 5) {
            radiusValue = 5;
          }
          setRadiusKm(radiusValue);
        }

        const pageParam = params.get('page');
        if (pageParam) setPage(parseInt(pageParam, 10));
        
        // Do not initiate search on load, just set the state
        // setSearchInitiated(true); 
      }
      
      const lang = params.get('lang');
      if (lang === 'en' || lang === 'es') setLocale(lang);
      
      isInitialLoad.current = false;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); 

  // Write to URL when state changes (only if search has been initiated)
  useEffect(() => {
    if (isInitialLoad.current || !searchInitiated) {
        if (searchParams.toString() !== '') {
            router.replace(pathname, { scroll: false });
        }
        return;
    };

    const params = new URLSearchParams();

    if (debouncedCenter) {
      params.set('lat', debouncedCenter.lat.toFixed(6));
      params.set('lng', debouncedCenter.lng.toFixed(6));
    }

    if (debouncedRadiusKm) {
        params.set('radius', debouncedRadiusKm.toString());
    }
    
    if (debouncedPage > 1) {
       params.set('page', debouncedPage.toString());
    }

    if (locale) {
        params.set('lang', locale);
    }
    
    const newQuery = params.toString();
    
    if (searchParams.toString() !== newQuery) {
        router.replace(`${pathname}?${newQuery}`, { scroll: false });
    }

  }, [debouncedCenter, debouncedRadiusKm, debouncedPage, locale, pathname, router, searchParams, searchInitiated]);
}
