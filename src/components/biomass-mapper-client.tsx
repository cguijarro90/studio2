
'use client';

import { useEffect, useCallback, useState, useRef } from 'react';
import { useBiomassStore } from '@/store/biomass-store';
import { useQuerySync } from '@/hooks/use-query-sync';
import { searchBiomass, searchAgriculturalPlots } from '@/app/actions';
import { APIProvider } from '@vis.gl/react-google-maps';

import SidePanel from '@/components/side-panel';
import BiomassMap from '@/components/biomass-map';
import InitialFilterDialog from '@/components/initial-filter-dialog';
import OutOfSpainDialog from '@/components/out-of-spain-dialog';
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import MobilePanelToggle from "@/components/mobile-panel-toggle";

export default function BiomassMapperClient() {
  const {
    center,
    radiusKm,
    page,
    overlays,
    searchInitiated,
    setIsLoading,
    setResults,
    setMapResults,
    setAgriculturalPlots,
    resetResults,
    setIsInitialDialogOpen,
    setSearchInitiated,
    setPage
  } = useBiomassStore();

  const [isSheetOpen, setIsSheetOpen] = useState(false);
  
  useQuerySync();

  const performListSearch = useCallback(async (searchPage = page) => {
    if (!center) {
      setResults({ items: [], total: 0, page: 1, limit: 50 });
      return;
    }

    try {
      const results = await searchBiomass({
        lat: center.lat,
        lng: center.lng,
        radius_m: radiusKm * 1000,
        page: searchPage,
        limit: 50,
      });
      setResults(results);
    } catch (error) {
      console.error('List search failed:', error);
      setResults({ items: [], total: 0, page: 1, limit: 50 });
    }
  }, [center, radiusKm, page, setResults]);

  const performMapSearch = useCallback(async () => {
    if (!center) {
      setMapResults([]);
      return;
    }
    try {
      const results = await searchBiomass({
        lat: center.lat,
        lng: center.lng,
        radius_m: radiusKm * 1000,
        fetchAll: true,
      });
      setMapResults(results.items);
    } catch (error) {
      console.error('Map search failed:', error);
      setMapResults([]);
    }
  }, [center, radiusKm, setMapResults]);

  const performPlotSearch = useCallback(async () => {
    if (!center) {
      setAgriculturalPlots([]);
      return;
    }
    try {
      const plots = await searchAgriculturalPlots({
        lat: center.lat,
        lng: center.lng,
        radius_m: radiusKm * 1000,
      });
      setAgriculturalPlots(plots);
    } catch (error) {
      console.error('Agricultural plot search failed:', error);
      setAgriculturalPlots([]);
    }
  }, [center, radiusKm, setAgriculturalPlots]);
  
  
  useEffect(() => {
    const hasSearchParams = new URLSearchParams(window.location.search).has('lat');
    if (!hasSearchParams) {
      const timer = setTimeout(() => {
        setIsInitialDialogOpen(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Effect for list pagination
  useEffect(() => {
    if (searchInitiated && page > 1) {
        performListSearch(page);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, searchInitiated]);
  
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    return <div className="flex items-center justify-center h-screen bg-destructive text-destructive-foreground">Error: Google Maps API key is not configured.</div>;
  }

  const handleSearch = async () => {
    if (!center) return;
    
    if (!searchInitiated) {
        setSearchInitiated(true);
    }
    
    const currentPage = useBiomassStore.getState().page;
    if (currentPage !== 1) {
        setPage(1); 
    }

    setIsLoading(true);

    const searchPromises: Promise<any>[] = [];

    if (overlays.biomassPlants) {
        searchPromises.push(performListSearch(1));
        searchPromises.push(performMapSearch());
    } else {
        setResults({ items: [], total: 0, page: 1, limit: 50 });
        setMapResults([]);
    }

     if (overlays.agriculturalData) {
        searchPromises.push(performPlotSearch());
    } else {
        setAgriculturalPlots([]);
    }
    
    await Promise.all(searchPromises);

    setIsLoading(false);
  }

  return (
    <APIProvider apiKey={apiKey} libraries={['places', 'visualization', 'geocoding']}>
      <main className="grid grid-cols-1 md:grid-cols-[1fr,30%] lg:grid-cols-[1fr,30rem] h-screen w-screen bg-background">
        <div className="relative w-full h-full">
          <BiomassMap />
        </div>
        <div className="hidden md:flex md:flex-col h-full border-l border-border bg-card overflow-hidden">
          <SidePanel onSearch={handleSearch} />
        </div>

        <div className="md:hidden">
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetTrigger asChild>
                    <MobilePanelToggle />
                </SheetTrigger>
                <SheetContent side="right" className="w-[85vw] p-0">
                    <SidePanel onSearch={handleSearch} />
                </SheetContent>
            </Sheet>
        </div>
      </main>
      <InitialFilterDialog />
      <OutOfSpainDialog />
    </APIProvider>
  );
}
