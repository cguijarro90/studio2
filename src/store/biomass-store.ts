import { create } from 'zustand';
import type { AppState, AppActions, Locale, Point, BiomassSource, AgriculturalPlot } from '@/lib/types';

const initialState: AppState = {
  center: null,
  radiusKm: 50,
  overlays: {
    biomassPlants: true,
    agriculturalData: false,
    forestData: false,
  },
  page: 1,
  results: [],
  mapResults: [],
  agriculturalPlots: [],
  totalResults: 0,
  isLoading: false,
  isInitialDialogOpen: false,
  isOutOfSpainDialogOpen: false,
  map: null,
  selectedSourceId: null,
  locale: 'es',
  searchInitiated: false,
};

export const useBiomassStore = create<AppState & AppActions>((set, get) => ({
  ...initialState,
  setCenter: (center) => set({ center, page: 1 }),
  setRadiusKm: (radiusKm) => set({ radiusKm, page: 1 }),
  setOverlays: (overlays) => set({ overlays }),
  setPage: (page) => set({ page }),
  setResults: (data) => set({ results: data.items, totalResults: data.total }),
  setMapResults: (results: BiomassSource[]) => set({ mapResults: results }),
  setAgriculturalPlots: (plots: AgriculturalPlot[]) => set({ agriculturalPlots: plots }),
  setTotalResults: (total) => set({ totalResults: total }),
  setIsLoading: (isLoading) => set({ isLoading }),
  setIsInitialDialogOpen: (isInitialDialogOpen) => set({ isInitialDialogOpen }),
  setIsOutOfSpainDialogOpen: (isOutOfSpainDialogOpen) => set({ isOutOfSpainDialogOpen }),
  setMap: (map) => set({ map }),
  setSelectedSourceId: (id) => set({ selectedSourceId: id }),
  setLocale: (locale: Locale) => set({ locale }),
  setSearchInitiated: (initiated) => set({ searchInitiated: initiated }),
  resetFilters: () =>
    set({
      radiusKm: initialState.radiusKm,
      overlays: initialState.overlays,
      page: 1,
    }),
  resetResults: () => set({ results: [], totalResults: 0, page: 1, mapResults: [], agriculturalPlots: [] }),
}));
