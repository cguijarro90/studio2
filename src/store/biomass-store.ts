import { create } from 'zustand';
import type { AppState, AppActions, Locale } from '@/lib/types';
import { BIOMASS_TYPES } from '@/lib/types';

const initialState: AppState = {
  center: null,
  radiusKm: 50,
  biomassTypes: [...BIOMASS_TYPES],
  overlays: {
    markers: true,
    clusters: true,
    heatmap: false,
  },
  page: 1,
  results: [],
  totalResults: 0,
  isLoading: false,
  isInitialDialogOpen: false,
  map: null,
  selectedSourceId: null,
  locale: 'es',
  searchInitiated: false,
  intersectingProvinces: [],
};

export const useBiomassStore = create<AppState & AppActions>((set, get) => ({
  ...initialState,
  setCenter: (center) => set({ center }),
  setRadiusKm: (radiusKm) => set({ radiusKm, page: 1 }),
  setBiomassTypes: (biomassTypes) => set({ biomassTypes, page: 1 }),
  setOverlays: (overlays) => set({ overlays }),
  setPage: (page) => set({ page }),
  setResults: (data) => set({ results: data.items, totalResults: data.total }),
  setTotalResults: (total) => set({ totalResults: total }),
  setIsLoading: (isLoading) => set({ isLoading }),
  setIsInitialDialogOpen: (isInitialDialogOpen) => set({ isInitialDialogOpen }),
  setMap: (map) => set({ map }),
  setSelectedSourceId: (id) => set({ selectedSourceId: id }),
  setLocale: (locale: Locale) => set({ locale }),
  setSearchInitiated: (initiated) => set({ searchInitiated: initiated }),
  setIntersectingProvinces: (provinces) => set({ intersectingProvinces: provinces }),
  resetFilters: () =>
    set({
      radiusKm: initialState.radiusKm,
      biomassTypes: initialState.biomassTypes,
      overlays: initialState.overlays,
      page: 1,
    }),
  resetResults: () => set({ results: [], totalResults: 0, page: 1, searchInitiated: false, intersectingProvinces: [] }),
}));
