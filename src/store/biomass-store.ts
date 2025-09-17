import { create } from 'zustand';
import type { AppState, AppActions, Locale, Point } from '@/lib/types';
import { BIOMASS_TYPES } from '@/lib/types';

// Bounding box for Spain (mainland, Balearic, Canary Islands, Ceuta, Melilla)
const MAINLAND_BOUNDS = {
  north: 44.0,
  south: 35.9,
  west: -9.5,
  east: 4.5,
};

const CANARIES_BOUNDS = {
    north: 29.5,
    south: 27.6,
    west: -18.2,
    east: -13.3
};

const CEUTA_BOUNDS = {
    north: 35.95,
    south: 35.86,
    west: -5.4,
    east: -5.27
};

const MELILLA_BOUNDS = {
    north: 35.32,
    south: 35.26,
    west: -3.0,
    east: -2.91
};


export const isPointInSpain = (point: Point) => {
  const { lat, lng } = point;
  
  if (lat <= MAINLAND_BOUNDS.north && lat >= MAINLAND_BOUNDS.south && lng <= MAINLAND_BOUNDS.east && lng >= MAINLAND_BOUNDS.west) {
      return true;
  }
  
  if (lat <= CANARIES_BOUNDS.north && lat >= CANARIES_BOUNDS.south && lng <= CANARIES_BOUNDS.east && lng >= CANARIES_BOUNDS.west) {
    return true;
  }

  if (lat <= CEUTA_BOUNDS.north && lat >= CEUTA_BOUNDS.south && lng <= CEUTA_BOUNDS.east && lng >= CEUTA_BOUNDS.west) {
    return true;
  }

  if (lat <= MELILLA_BOUNDS.north && lat >= MELILLA_BOUNDS.south && lng <= MELILLA_BOUNDS.east && lng >= MELILLA_BOUNDS.west) {
    return true;
  }

  return false;
};

const initialState: AppState = {
  center: null,
  radiusKm: 50,
  biomassTypes: [...BIOMASS_TYPES],
  overlays: {
    biomassPlants: true,
    agriculturalData: false,
    forestData: false,
  },
  page: 1,
  results: [],
  totalResults: 0,
  isLoading: false,
  isInitialDialogOpen: false,
  isOutOfSpainDialogOpen: false,
  map: null,
  selectedSourceId: null,
  locale: 'es',
  searchInitiated: false,
  intersectingProvinces: [],
  isLoadingProvinces: false,
};

export const useBiomassStore = create<AppState & AppActions>((set, get) => ({
  ...initialState,
  setCenter: (center) => set({ center, page: 1 }),
  setRadiusKm: (radiusKm) => set({ radiusKm, page: 1 }),
  setBiomassTypes: (biomassTypes) => set({ biomassTypes, page: 1 }),
  setOverlays: (overlays) => set({ overlays }),
  setPage: (page) => set({ page }),
  setResults: (data) => set({ results: data.items, totalResults: data.total }),
  setTotalResults: (total) => set({ totalResults: total }),
  setIsLoading: (isLoading) => set({ isLoading }),
  setIsInitialDialogOpen: (isInitialDialogOpen) => set({ isInitialDialogOpen }),
  setIsOutOfSpainDialogOpen: (isOutOfSpainDialogOpen) => set({ isOutOfSpainDialogOpen }),
  setMap: (map) => set({ map }),
  setSelectedSourceId: (id) => set({ selectedSourceId: id }),
  setLocale: (locale: Locale) => set({ locale }),
  setSearchInitiated: (initiated) => set({ searchInitiated: initiated }),
  setIntersectingProvinces: (provinces) => set({ intersectingProvinces: provinces }),
  setIsLoadingProvinces: (loading) => set({ isLoadingProvinces: loading }),
  resetFilters: () =>
    set({
      radiusKm: initialState.radiusKm,
      biomassTypes: initialState.biomassTypes,
      overlays: initialState.overlays,
      page: 1,
    }),
  resetResults: () => set({ results: [], totalResults: 0, page: 1 }),
}));
