import { create } from 'zustand';
import type { AppState, AppActions, Locale, Point, BiomassSource, AgriculturalPlot, ForestPlot } from '@/lib/types';

const initialState: AppState = {
  isLiteVersion: true, // Lite version is active by default
  center: null,
  radiusKm: 5,
  overlays: {
    biomassPlants: true,
    agriculturalData: true,
    forestData: true,
  },
  page: 1,
  results: [],
  mapResults: [],
  agriculturalPlots: [],
  forestPlots: [],
  totalResults: 0,
  isLoading: false,
  isInitialDialogOpen: false,
  isOutOfSpainDialogOpen: false,
  isForestAnalysisOpen: false,
  isAgriculturalAnalysisOpen: false,
  isLiteLimitationsDialogOpen: false,
  isContactFormOpen: false,
  map: null,
  selectedSourceId: null,
  locale: 'es',
  searchInitiated: false,
  cropTypeColors: {},
  forestSpeciesColors: {},
};

export const useBiomassStore = create<AppState & AppActions>((set, get) => ({
  ...initialState,
  setCenter: (center) => set({ center, page: 1 }),
  setRadiusKm: (radiusKm) => set((state) => {
    if (state.isLiteVersion && radiusKm > 5) {
      return { radiusKm: 5, page: 1 };
    }
    return { radiusKm, page: 1 };
  }),
  setOverlays: (overlays) => set({ overlays }),
  setPage: (page) => set({ page }),
  setResults: (data) => set({ results: data.items, totalResults: data.total }),
  setMapResults: (results: BiomassSource[]) => set({ mapResults: results }),
  setAgriculturalPlots: (plots: AgriculturalPlot[]) => set({ agriculturalPlots: plots }),
  setForestPlots: (plots: ForestPlot[]) => set({ forestPlots: plots }),
  setTotalResults: (total) => set({ totalResults: total }),
  setIsLoading: (isLoading) => set({ isLoading }),
  setIsInitialDialogOpen: (isInitialDialogOpen) => set({ isInitialDialogOpen }),
  setIsOutOfSpainDialogOpen: (isOutOfSpainDialogOpen) => set({ isOutOfSpainDialogOpen }),
  setIsForestAnalysisOpen: (isOpen) => set({ isForestAnalysisOpen: isOpen }),
  setIsAgriculturalAnalysisOpen: (isOpen) => set({ isAgriculturalAnalysisOpen: isOpen }),
  setIsLiteLimitationsDialogOpen: (isOpen) => set({ isLiteLimitationsDialogOpen: isOpen }),
  setIsContactFormOpen: (isOpen) => set({ isContactFormOpen: isOpen }),
  setMap: (map) => set({ map }),
  setSelectedSourceId: (id) => set({ selectedSourceId: id }),
  setLocale: (locale: Locale) => set({ locale }),
  setSearchInitiated: (initiated) => set({ searchInitiated: initiated }),
  setCropTypeColors: (colors) => set({ cropTypeColors: colors }),
  setForestSpeciesColors: (colors) => set({ forestSpeciesColors: colors }),
  resetFilters: () =>
    set({
      radiusKm: initialState.radiusKm,
      overlays: initialState.overlays,
      page: 1,
    }),
  resetResults: () => set({ results: [], totalResults: 0, page: 1, mapResults: [], agriculturalPlots: [], forestPlots: [] }),
}));
