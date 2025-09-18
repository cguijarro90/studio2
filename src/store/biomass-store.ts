import { create } from 'zustand';
import type { AppState, AppActions, Locale, Point, BiomassSource } from '@/lib/types';

// Bounding box for Spain (mainland, Balearic, Canary Islands, Ceuta, Melilla)
const BOUNDS = [
  // Mainland and Balearic Islands
  { north: 44.0, south: 35.9, west: -9.31, east: 4.5 },
  // Canary Islands
  { north: 29.5, south: 27.6, west: -18.2, east: -13.3 },
  // Ceuta
  { north: 35.95, south: 35.86, west: -5.4, east: -5.27 },
  // Melilla
  { north: 35.32, south: 35.26, west: -3.0, east: -2.91 }
];

export const isPointInSpain = (point: Point) => {
  const { lat, lng } = point;

  for (const bound of BOUNDS) {
    if (lat <= bound.north && lat >= bound.south && lng >= bound.west && lng <= bound.east) {
      return true; // Point is within one of the valid bounds
    }
  }

  return false; // Point is outside all valid bounds
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
