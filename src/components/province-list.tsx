'use client';

import { useEffect, useMemo } from 'react';
import * as d3 from 'd3-geo';
import { useBiomassStore } from '@/store/biomass-store';
import { spainProvinces } from '@/lib/provinces';
import { useDebounce } from '@/hooks/use-debounce';
import { useTranslation } from '@/hooks/use-translation';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

export default function ProvinceList() {
  const { t } = useTranslation();
  const { center, radiusKm, searchInitiated, setIntersectingProvinces, intersectingProvinces } = useBiomassStore();

  const debouncedCenter = useDebounce(center, 300);
  const debouncedRadiusKm = useDebounce(radiusKm, 300);

  const provinceFeatures = useMemo(() => {
    return (spainProvinces as any).features;
  }, []);

  useEffect(() => {
    if (!debouncedCenter || !searchInitiated) {
        setIntersectingProvinces([]);
        return;
    }

    const searchArea = d3.geoCircle()
      .center([debouncedCenter.lng, debouncedCenter.lat])
      .radius(debouncedRadiusKm / 111.32)(); // Convert km to degrees approximation

    const foundProvinces: string[] = [];

    for (const province of provinceFeatures) {
      if (d3.geoIntersects(searchArea, province)) {
        foundProvinces.push(province.properties.name);
      }
    }
    
    setIntersectingProvinces(foundProvinces.sort());

  }, [debouncedCenter, debouncedRadiusKm, provinceFeatures, searchInitiated, setIntersectingProvinces]);

  if (!searchInitiated || intersectingProvinces.length === 0) {
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
