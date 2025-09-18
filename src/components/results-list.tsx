'use client';

import { useBiomassStore } from '@/store/biomass-store';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/use-translation';
import type { BiomassSource } from '@/lib/types';
import { getColoredBiomassIcon } from './icons';

function ResultItem({
  id,
  name,
  geom_geojson,
  type,
  quantity,
}: BiomassSource) {
  const { t } = useTranslation();
  const { map, setSelectedSourceId, selectedSourceId } = useBiomassStore();
  
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
    <Card 
        className={cn("transition-all cursor-pointer hover:border-primary", selectedSourceId === id ? "border-primary shadow-lg" : "")}
        onClick={viewOnMap}
    >
      <CardContent className="p-0">
        <div className="flex items-center justify-between p-3">
            <h3 className="text-sm font-medium capitalize text-muted-foreground flex-1 pr-2">{name}</h3>
             <div className="flex items-center gap-2 text-sm text-muted-foreground font-semibold">
                {getColoredBiomassIcon(type, "h-5 w-5")}
                <span>{quantity.toFixed(2)} {t('mw')}</span>
            </div>
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
  const { results, isLoading, center } = useBiomassStore();

  if (isLoading) {
    return (
      <div className="p-4 space-y-4">
        {[...Array(10)].map((_, i) => (
          <div key={i} className="p-4 border rounded-lg">
            <Skeleton className="h-5 w-full" />
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
            {t('results_show').replace('{count}', results.length.toString()).replace('{total}', useBiomassStore.getState().totalResults.toString())}
        </div>
        <div className="flex-1 p-4 pt-0 space-y-2">
        {results.map((item) => (
            <ResultItem key={item.id} {...item} />
        ))}
        </div>
        <Pagination />
    </div>
  );
}
