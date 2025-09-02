'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useBiomassStore } from '@/store/biomass-store';
import type { BiomassType, Point } from '@/lib/types';
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
    setCenter,
    setRadiusKm,
    setBiomassTypes,
    setPage,
  } = useBiomassStore();

  const debouncedCenter = useDebounce(center, 500);
  const debouncedRadiusKm = useDebounce(radiusKm, 500);
  const debouncedBiomassTypes = useDebounce(biomassTypes, 500);
  const debouncedPage = useDebounce(page, 500);

  useEffect(() => {
    if (isInitialLoad.current) {
      const params = new URLSearchParams(searchParams.toString());
      const lat = params.get('lat');
      const lng = params.get('lng');
      const radius = params.get('radius');
      const types = params.get('types');
      const pageParam = params.get('page');

      if (lat && lng) {
        setCenter({ lat: parseFloat(lat), lng: parseFloat(lng) });
      }
      if (radius) {
        setRadiusKm(parseFloat(radius));
      }
      if (types) {
        const validTypes = types.split(',').filter(t => BIOMASS_TYPES.includes(t as BiomassType)) as BiomassType[];
        setBiomassTypes(validTypes);
      }
      if (pageParam) {
        setPage(parseInt(pageParam, 10));
      }
      isInitialLoad.current = false;
    }
  }, [searchParams, setCenter, setRadiusKm, setBiomassTypes, setPage]);

  useEffect(() => {
    if (isInitialLoad.current) return;

    const params = new URLSearchParams(searchParams.toString());

    if (debouncedCenter) {
      params.set('lat', debouncedCenter.lat.toFixed(6));
      params.set('lng', debouncedCenter.lng.toFixed(6));
    } else {
      params.delete('lat');
      params.delete('lng');
    }

    params.set('radius', debouncedRadiusKm.toString());

    if (debouncedBiomassTypes.length > 0 && debouncedBiomassTypes.length < BIOMASS_TYPES.length) {
      params.set('types', debouncedBiomassTypes.join(','));
    } else {
      params.delete('types');
    }

    if (debouncedPage > 1) {
      params.set('page', debouncedPage.toString());
    } else {
      params.delete('page');
    }

    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [debouncedCenter, debouncedRadiusKm, debouncedBiomassTypes, debouncedPage, pathname, router, searchParams]);
}
