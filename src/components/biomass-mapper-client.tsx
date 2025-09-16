'use client';

import { useEffect, useCallback, useState, useRef } from 'react';
import { useBiomassStore } from '@/store/biomass-store';
import { useQuerySync } from '@/hooks/use-query-sync';
import { searchBiomass } from '@/app/actions';
import { APIProvider } from '@vis.gl/react-google-maps';

import SidePanel from '@/components/side-panel';
import BiomassMap from '@/components/biomass-map';
import InitialFilterDialog from '@/components/initial-filter-dialog';
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import MobilePanelToggle from "@/components/mobile-panel-toggle";

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
  
  // This hook handles syncing state with URL params
  useQuerySync();

  const performSearch = useCallback(async (searchPage = page) => {
    if (!center) {
      resetResults();
      return;
    }

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
  }, [center, radiusKm, biomassTypes, page, setIsLoading, setResults, resetResults]);
  
  // Effect for initial load: geolocate user and show help dialog if no params in URL
  useEffect(() => {
    // This logic runs only on the very first load without any params
    const hasSearchParams = new URLSearchParams(window.location.search).has('lat');

    if (!hasSearchParams) {
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Effect for subsequent searches (pagination)
  useEffect(() => {
    // We don't want to trigger a search on the initial page load,
    // so we check if a search has been initiated.
    // The initial search is handled by `handleSearch`.
    // The page is 1 on initial load, so this will only trigger on page > 1.
    if (searchInitiated) {
        performSearch(page);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);
  
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    return <div className="flex items-center justify-center h-screen bg-destructive text-destructive-foreground">Error: Google Maps API key is not configured.</div>;
  }

  // This is the ONLY place where a new search is initiated.
  const handleSearch = () => {
    if (!searchInitiated) {
        setSearchInitiated(true);
    }
    // Reset to first page for any new search
    if (page !== 1) {
        useBiomassStore.getState().setPage(1); 
    }
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
