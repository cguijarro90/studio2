
'use client';

import { useEffect, useCallback, useState } from 'react';
import { useBiomassStore } from '@/store/biomass-store';
import { useQuerySync } from '@/hooks/use-query-sync';
import { searchBiomass } from '@/app/actions';
import { APIProvider } from '@vis.gl/react-google-maps';

import SidePanel from '@/components/side-panel';
import BiomassMap from '@/components/biomass-map';
import InitialFilterDialog from '@/components/initial-filter-dialog';
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import MobilePanelToggle from "@/components/mobile-panel-toggle";
import { useSearchParams } from 'next/navigation';

export default function BiomassMapperClient() {
  const {
    center,
    radiusKm,
    biomassTypes,
    page,
    searchInitiated,
    setCenter,
    setIsLoading,
    setResults,
    resetResults,
    setIsInitialDialogOpen,
    setSearchInitiated,
  } = useBiomassStore();

  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  useQuerySync();
  const searchParams = useSearchParams();

  const performSearch = useCallback(async (searchPage = page) => {
    if (!center) {
      resetResults();
      return;
    }
    
    if(!searchInitiated) setSearchInitiated(true);

    setIsLoading(true);
    try {
      const results = await searchBiomass({
        lat: center.lat,
        lng: center.lng,
        radius_m: radiusKm * 1000,
        types: biomassTypes,
        page: searchPage,
        limit: 50,
      });
      setResults(results);
    } catch (error) {
      console.error('Search failed:', error);
      resetResults();
    } finally {
      setIsLoading(false);
    }
  }, [center, radiusKm, biomassTypes, page, setIsLoading, setResults, resetResults, searchInitiated, setSearchInitiated]);
  
  // Effect for pagination
  useEffect(() => {
    if (searchInitiated && !initialLoad) {
      performSearch(page);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);


  useEffect(() => {
    if (initialLoad) {
      const hasSearchParams = searchParams.has('lat');
      
      if (hasSearchParams && center) {
        // State is hydrated from URL, perform initial search
        performSearch(page);
      } else if (!hasSearchParams) {
        // First visit, no params. Show help dialog and try to geolocate.
        const timer = setTimeout(() => {
            setIsInitialDialogOpen(true);
        }, 2000);

        navigator.geolocation.getCurrentPosition(
          (position) => {
            const newCenter = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            };
            setCenter(newCenter);
          },
          () => {
            console.log("Geolocation failed or was denied.");
          }
        );
        
        return () => clearTimeout(timer);
      }
      setInitialLoad(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialLoad, searchParams, center]);

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    return <div className="flex items-center justify-center h-screen bg-destructive text-destructive-foreground">Error: Google Maps API key is not configured.</div>;
  }

  const handleSearch = () => {
    // Reset to first page for new search
    useBiomassStore.getState().setPage(1); 
    performSearch(1);
  }

  return (
    <APIProvider apiKey={apiKey} libraries={['places', 'visualization']}>
      <main className="grid grid-cols-1 md:grid-cols-[1fr,30%] lg:grid-cols-[1fr,30rem] h-screen w-screen bg-background">
        <div className="relative w-full h-full">
          <BiomassMap />
        </div>
        <div className="hidden md:flex md:flex-col h-full border-l border-border bg-card">
          <SidePanel onSearch={handleSearch} />
        </div>

        {/* Mobile Panel */}
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
    </APIProvider>
  );
}
