'use client';

import { useEffect, useCallback } from 'react';
import { useBiomassStore, isPointInSpain } from '@/store/biomass-store';
import { useDebounce } from '@/hooks/use-debounce';
import { useTranslation } from '@/hooks/use-translation';
import { getIntersectingProvinces } from '@/app/actions';
import { Skeleton } from './ui/skeleton';

export default function ProvinceList() {
  const { t } = useTranslation();
  const { center, radiusKm, searchInitiated, setIntersectingProvinces, intersectingProvinces, isLoadingProvinces, setIsLoadingProvinces } = useBiomassStore();

  const debouncedCenter = useDebounce(center, 500);
  const debouncedRadiusKm = useDebounce(radiusKm, 500);

  const fetchProvinces = useCallback(async () => {
    if (!debouncedCenter || !searchInitiated) {
        setIntersectingProvinces([]);
        return;
    }
    // Don't fetch if point is outside Spain
    if (!isPointInSpain(debouncedCenter)) {
      setIntersectingProvinces([]);
      return;
    }
    setIsLoadingProvinces(true);
    try {
        const provinces = await getIntersectingProvinces({
            lat: debouncedCenter.lat,
            lng: debouncedCenter.lng,
            radiusKm: debouncedRadiusKm,
        });
        setIntersectingProvinces(provinces);
    } catch(e) {
        console.error("Failed to fetch provinces", e);
        setIntersectingProvinces([]);
    } finally {
        setIsLoadingProvinces(false);
    }
  }, [debouncedCenter, debouncedRadiusKm, searchInitiated, setIntersectingProvinces, setIsLoadingProvinces]);

  useEffect(() => {
    fetchProvinces();
  }, [fetchProvinces]);
  
  if (!searchInitiated || (center && !isPointInSpain(center))) {
    return null;
  }

  if (isLoadingProvinces) {
      return (
        <div className="p-4 space-y-2">
            <h3 className="text-sm font-semibold mb-2 text-muted-foreground">{t('provinces_in_area')}</h3>
            <div className="flex flex-wrap gap-2">
                <Skeleton className="h-6 w-20 rounded-full" />
                <Skeleton className="h-6 w-24 rounded-full" />
                <Skeleton className="h-6 w-16 rounded-full" />
            </div>
        </div>
      );
  }

  if (intersectingProvinces.length === 0) {
    return null;
  }

  return (
    <div className="p-4">
      <h3 className="text-sm font-semibold mb-2 text-muted-foreground">{t('provinces_in_area')}</h3>
      <div className="flex flex-wrap gap-2">
        {intersectingProvinces.map((province) => (
          <div key={province} className="text-xs bg-muted text-muted-foreground rounded-full px-3 py-1">
            {province}
          </div>
        ))}
      </div>
    </div>
  );
}
