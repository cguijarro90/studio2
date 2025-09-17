import { create } from 'zustand';
import type { AppState, AppActions, Locale, Point } from '@/lib/types';
import { BIOMASS_TYPES } from '@/lib/types';

// Bounding box for Spain (mainland, Balearic, Canary Islands, Ceuta, Melilla)
const SPAIN_BOUNDS = {
  north: 44.0,
  south: 27.5,
  west: -18.5,
  east: 4.5,
};

// More specific check for mainland/balearic
const MAINLAND_BOUNDS = {
  north: 44.0,
  south: 35.9,
  west: -9.5,
  east: 4.5,
};

export const isPointInSpain = (point: Point) => {
  const { lat, lng } = point;
  
  // Quick check against the larger bounding box
  if (lat > SPAIN_BOUNDS.north || lat < SPAIN_BOUNDS.south || lng > SPAIN_BOUNDS.east || lng < SPAIN_BOUNDS.west) {
    return false;
  }

  // Check against mainland/balearic box
  if (lat <= MAINLAND_BOUNDS.north && lat >= MAINLAND_BOUNDS.south && lng <= MAINLAND_BOUNDS.east && lng >= MAINLAND_BOUNDS.west) {
      return true;
  }

  // If not in mainland, it must be in the Canaries box (already passed general check)
  return true;
};

const initialState: AppState = {
  center: null,
  radiusKm: 50,
  biomassTypes: [...BIOMASS_TYPES],
  overlays: {
    markers: true,
    clusters: true,
    heatmap: false,
    cadastral: false,
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
  setCenter: (center) => set({ center }),
  setRadiusKm: (radiusKm) => set({ radiusKm }),
  setBiomassTypes: (biomassTypes) => set({ biomassTypes }),
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
  resetResults: () => set({ results: [], totalResults: 0, page: 1, searchInitiated: false, intersectingProvinces: [] }),
}));
