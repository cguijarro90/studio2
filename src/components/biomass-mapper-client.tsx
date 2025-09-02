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

export default function BiomassMapperClient() {
  const {
    center,
    radiusKm,
    biomassTypes,
    page,
    setCenter,
    setIsLoading,
    setResults,
    resetResults,
    setIsInitialDialogOpen,
  } = useBiomassStore();

  const [isSheetOpen, setIsSheetOpen] = useState(false);
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

  useEffect(() => {
    // Perform search when page changes for pagination
    if (center) {
      performSearch(page);
    }
  }, [page]);


  useEffect(() => {
    if (!center) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newCenter = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setCenter(newCenter);
          performSearch();
        },
        () => {
          // Geolocation failed or was denied, open dialog
          setCenter({ lat: 40.416775, lng: -3.703790 }); // Default to Madrid, Spain
          setIsInitialDialogOpen(true);
        }
      );
    }
  }, [center, setCenter, setIsInitialDialogOpen, performSearch]);

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    return <div className="flex items-center justify-center h-screen bg-destructive text-destructive-foreground">Error: Google Maps API key is not configured.</div>;
  }

  const handleSearch = () => {
    useBiomassStore.getState().setPage(1); // Reset to first page for new search
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
      <InitialFilterDialog onApply={handleSearch}/>
    </APIProvider>
  );
}
