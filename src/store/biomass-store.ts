import { create } from 'zustand';
import type { AppState, AppActions, Locale, Point, BiomassSource } from '@/lib/types';

// Bounding box for Spain (mainland, Balearic, Canary Islands, Ceuta, Melilla)
const MAINLAND_BOUNDS = {
  north: 44.0,
  south: 35.9,
  west: -9.31, // Western boundary of mainland Spain (Cape Touriñán)
  east: 4.5,   // Eastern boundary of mainland Spain
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
  
  // Check mainland Spain and Balearic Islands
  if (lat <= MAINLAND_BOUNDS.north && lat >= MAINLAND_BOUNDS.south && lng <= MAINLAND_BOUNDS.east && lng >= MAINLAND_BOUNDS.west) {
      return true;
  }
  
  // Check Canary Islands
  if (lat <= CANARIES_BOUNDS.north && lat >= CANARIES_BOUNDS.south && lng <= CANARIES_BOUNDS.east && lng >= CANARIES_BOUNDS.west) {
    return true;
  }

  // Check Ceuta
  if (lat <= CEUTA_BOUNDS.north && lat >= CEUTA_BOUNDS.south && lng <= CEUTA_BOUNDS.east && lng >= CEUTA_BOUNDS.west) {
    return true;
  }

  // Check Melilla
  if (lat <= MELILLA_BOUNDS.north && lat >= MELILLA_BOUNDS.south && lng <= MELILLA_BOUNDS.east && lng >= MELILLA_BOUNDS.west) {
    return true;
  }

  return false;
};

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
  resetResults: () => set({ results: [], totalResults: 0, page: 1, mapResults: [], searchInitiated: false }),
}));
