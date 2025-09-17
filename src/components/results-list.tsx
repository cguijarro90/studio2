'use client';

import { useBiomassStore } from '@/store/biomass-store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Icons, getColoredBiomassIcon } from './icons';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/use-translation';
import type { BiomassType } from '@/lib/types';

function ResultItem({
  id,
  name,
  type,
  quantity,
  distance_m,
  geom_geojson,
}: {
  id: string;
  name: string;
  type: BiomassType;
  quantity: number;
  distance_m: number;
  geom_geojson: string;
}) {
  const { t } = useTranslation();
  const { map, setSelectedSourceId, selectedSourceId } = useBiomassStore();
  const distance_km = (distance_m / 1000).toFixed(2);

  const viewOnMap = () => {
    if (map && geom_geojson) {
      try {
        const locationObject = JSON.parse(geom_geojson);
        const pointString = locationObject.value;
        const coords = pointString.replace('POINT(', '').replace(')', '').split(' ');
        const lng = parseFloat(coords[0]);
        const lat = parseFloat(coords[1]);

        if (isNaN(lat) || isNaN(lng)) {
            console.error("Invalid coordinates in result item");
            return;
        }

        map.panTo({ lat, lng });
        map.setZoom(14);
        setSelectedSourceId(id);
      } catch (e) {
        console.error('Failed to parse geojson', e);
      }
    }
  };

  return (
    <Card className={cn("transition-all", selectedSourceId === id ? "border-primary shadow-lg" : "")}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base font-medium capitalize text-muted-foreground">{name}</CardTitle>
        <Button variant="ghost" size="sm" onClick={viewOnMap}>
          {t('view_on_map')}
        </Button>
      </CardHeader>
      <CardContent className="space-y-2 text-sm text-muted-foreground">
        <div className="flex items-center">
          {getColoredBiomassIcon(type)}
          <span className="ml-2 capitalize">{t(type)}</span>
        </div>
        <div className="flex items-center">
          <Icons.weight className="w-4 h-4 text-muted-foreground" />
          <span className="ml-2">{quantity.toLocaleString()} {t('tons')}</span>
        </div>
        <div className="flex items-center">
          <Icons.distance className="w-4 h-4 text-muted-foreground" />
          <span className="ml-2">{distance_km} {t('km_away')}</span>
        </div>
      </CardContent>
    </Card>
  );
}

function Pagination() {
    const { t } = useTranslation();
    const { page, totalResults, setPage, isLoading } = useBiomassStore();
    const limit = 50;
    const totalPages = Math.ceil(totalResults / limit);

    if (totalPages <= 1) return null;

    return (
        <div className="flex items-center justify-between p-4">
            <Button onClick={() => setPage(page - 1)} disabled={page <= 1 || isLoading}>
                {t('previous')}
            </Button>
            <span className="text-sm text-muted-foreground">
                {t('page').replace('{page}', page.toString()).replace('{totalPages}', totalPages.toString())}
            </span>
            <Button onClick={() => setPage(page + 1)} disabled={page >= totalPages || isLoading}>
                {t('next')}
            </Button>
        </div>
    );
}

export default function ResultsList() {
  const { t } = useTranslation();
  const { results, isLoading, totalResults, center } = useBiomassStore();

  if (isLoading) {
    return (
      <div className="p-4 space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="p-4 border rounded-lg">
            <Skeleton className="h-5 w-3/4 mb-4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  if (!center) {
    return (
        <div className="p-4 text-center text-muted-foreground">
            <p>{t('initial_prompt')}</p>
        </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        <p>{t('no_results_title')}</p>
        <p className="text-xs">{t('no_results_subtitle')}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
        <div className="p-4 text-sm font-semibold text-muted-foreground">
            {t('results_show').replace('{count}', results.length.toString()).replace('{total}', totalResults.toString())}
        </div>
        <div className="flex-1 p-4 pt-0 space-y-4">
        {results.map((item) => (
            <ResultItem key={item.id} {...item} />
        ))}
        </div>
        <Pagination />
    </div>
  );
}
