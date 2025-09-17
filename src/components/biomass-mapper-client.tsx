'use client';

import { useEffect, useCallback, useState, useRef } from 'react';
import { useBiomassStore } from '@/store/biomass-store';
import { useQuerySync } from '@/hooks/use-query-sync';
import { searchBiomass, searchCadastralParcels } from '@/app/actions';
import { APIProvider } from '@vis.gl/react-google-maps';
import { useDebounce } from '@/hooks/use-debounce';

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
    biomassTypes,
    overlays,
    page,
    searchInitiated,
    setIsLoading,
    setResults,
    resetResults,
    setIsInitialDialogOpen,
    setSearchInitiated,
    setPage,
    setCadastralParcels,
    setIsLoadingParcels
  } = useBiomassStore();

  const [isSheetOpen, setIsSheetOpen] = useState(false);
  
  useQuerySync();

  const debouncedCenter = useDebounce(center, 500);
  const debouncedRadiusKm = useDebounce(radiusKm, 500);

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
  
  const fetchParcels = useCallback(async () => {
    if (!debouncedCenter || !searchInitiated || !overlays.cadastral) {
      setCadastralParcels([]);
      return;
    }

    setIsLoadingParcels(true);
    try {
      const results = await searchCadastralParcels({
        lat: debouncedCenter.lat,
        lng: debouncedCenter.lng,
        radius_m: debouncedRadiusKm * 1000,
      });
      setCadastralParcels(results);
    } catch (error) {
      console.error('Failed to fetch cadastral parcels:', error);
      setCadastralParcels([]);
    } finally {
      setIsLoadingParcels(false);
    }
  }, [debouncedCenter, debouncedRadiusKm, searchInitiated, overlays.cadastral, setCadastralParcels, setIsLoadingParcels]);


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

  useEffect(() => {
    if (searchInitiated) {
      if (page > 1) {
        performSearch(page);
      }
      if(overlays.cadastral) {
        fetchParcels();
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, searchInitiated, overlays.cadastral, fetchParcels]);
  
  useEffect(() => {
    if (overlays.cadastral) {
        fetchParcels();
    } else {
        setCadastralParcels([]);
    }
  }, [overlays.cadastral, fetchParcels, setCadastralParcels]);
  
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    return <div className="flex items-center justify-center h-screen bg-destructive text-destructive-foreground">Error: Google Maps API key is not configured.</div>;
  }

  const handleSearch = () => {
    if (!searchInitiated) {
        setSearchInitiated(true);
    }
    
    const currentPage = useBiomassStore.getState().page;
    if (currentPage !== 1) {
        setPage(1); 
    }
    performSearch(1);
    
    if (useBiomassStore.getState().overlays.cadastral) {
      fetchParcels();
    }
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
