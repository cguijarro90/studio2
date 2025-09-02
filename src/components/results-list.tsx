'use client';

import { useBiomassStore } from '@/store/biomass-store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Icons, getColoredBiomassIcon } from './icons';
import { cn } from '@/lib/utils';

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
  type: string;
  quantity: number;
  distance_m: number;
  geom_geojson: string;
}) {
  const { map, setSelectedSourceId, selectedSourceId } = useBiomassStore();
  const distance_km = (distance_m / 1000).toFixed(2);

  const viewOnMap = () => {
    if (map && geom_geojson) {
      try {
        const geojson = JSON.parse(geom_geojson);
        const [lng, lat] = geojson.coordinates;
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
        <CardTitle className="text-base font-medium capitalize">{name}</CardTitle>
        <Button variant="ghost" size="sm" onClick={viewOnMap}>
          View on map
        </Button>
      </CardHeader>
      <CardContent className="space-y-2 text-sm text-muted-foreground">
        <div className="flex items-center">
          {getColoredBiomassIcon(type)}
          <span className="ml-2 capitalize">{type}</span>
        </div>
        <div className="flex items-center">
          <Icons.weight className="w-4 h-4 text-muted-foreground" />
          <span className="ml-2">{quantity.toLocaleString()} tons</span>
        </div>
        <div className="flex items-center">
          <Icons.distance className="w-4 h-4 text-muted-foreground" />
          <span className="ml-2">{distance_km} km away</span>
        </div>
      </CardContent>
    </Card>
  );
}

function Pagination() {
    const { page, totalResults, setPage, isLoading } = useBiomassStore();
    const limit = 50;
    const totalPages = Math.ceil(totalResults / limit);

    if (totalPages <= 1) return null;

    return (
        <div className="flex items-center justify-between p-4">
            <Button onClick={() => setPage(page - 1)} disabled={page <= 1 || isLoading}>
                Previous
            </Button>
            <span className="text-sm text-muted-foreground">
                Page {page} of {totalPages}
            </span>
            <Button onClick={() => setPage(page + 1)} disabled={page >= totalPages || isLoading}>
                Next
            </Button>
        </div>
    );
}

export default function ResultsList() {
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
            <p>Click on the map or search for a location to begin.</p>
        </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        <p>No results found for the current filters.</p>
        <p className="text-xs">Try expanding your search radius.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
        <div className="p-4 text-sm font-semibold">
            Showing {results.length} of {totalResults} results
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
