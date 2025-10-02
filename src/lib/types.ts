

export const BIOMASS_TECHNOLOGIES = ['Biomasa', 'Cogeneración', 'Residuos', 'Otros'] as const;
export type BiomassType = string;

export type BiomassSource = {
  id: string;
  name: string;
  type: BiomassType;
  quantity: number;
  distance_m: number;
  geom_geojson: string; // JSON string of a GeoJSON point
};

export type AgriculturalPlot = {
  id: string;
  cropType: string;
  province: string;
  area_ha: number;
  potentialTn: number;
  calorificValue: number;
  geometry: string; // GeoJSON string of a Polygon
};

export type ForestPlot = {
    id: string;
    title: string;
    occupiedArea: number;
    area_ha: number;
    mainSpecies: string;
    secondarySpecies?: string;
    tertiarySpecies?: string;
    potentialTn: number;
    calorificValue: number;
    geometry: string; // GeoJSON string of a Polygon
};

export type Point = {
  lat: number;
  lng: number;
};

export type SearchResults = {
  items: BiomassSource[];
  total: number;
  page: number;
  limit: number;
};

export type Locale = 'en' | 'es';

export type AppState = {
  isLiteVersion: boolean;
  center: Point | null;
  radiusKm: number;
  overlays: {
    biomassPlants: boolean;
    agriculturalData: boolean;
    forestData: boolean;
  };
  page: number;
  results: BiomassSource[];
  mapResults: BiomassSource[];
  agriculturalPlots: AgriculturalPlot[];
  forestPlots: ForestPlot[];
  totalResults: number;
  isLoading: boolean;
  isInitialDialogOpen: boolean;
  isOutOfSpainDialogOpen: boolean;
  isForestAnalysisOpen: boolean;
  isAgriculturalAnalysisOpen: boolean;
  isLiteLimitationsDialogOpen: boolean;
  map: google.maps.Map | null;
  selectedSourceId: string | null;
  locale: Locale;
  searchInitiated: boolean;
  cropTypeColors: { [key: string]: string };
  forestSpeciesColors: { [key: string]: string };
};

export type AppActions = {
  setCenter: (center: Point) => void;
  setRadiusKm: (radius: number) => void;
  setOverlays: (overlays: AppState['overlays']) => void;
  setPage: (page: number) => void;
  setResults: (data: SearchResults) => void;
  setMapResults: (results: BiomassSource[]) => void;
  setAgriculturalPlots: (plots: AgriculturalPlot[]) => void;
  setForestPlots: (plots: ForestPlot[]) => void;
  setTotalResults: (total: number) => void;
  setIsLoading: (loading: boolean) => void;
  setIsInitialDialogOpen: (isOpen: boolean) => void;
  setIsOutOfSpainDialogOpen: (isOpen: boolean) => void;
  setIsForestAnalysisOpen: (isOpen: boolean) => void;
  setIsAgriculturalAnalysisOpen: (isOpen: boolean) => void;
  setIsLiteLimitationsDialogOpen: (isOpen: boolean) => void;
  setMap: (map: google.maps.Map | null) => void;
  setSelectedSourceId: (id: string | null) => void;
  setLocale: (locale: Locale) => void;
  setSearchInitiated: (initiated: boolean) => void;
  setCropTypeColors: (colors: { [key: string]: string }) => void;
  setForestSpeciesColors: (colors: { [key: string]: string }) => void;
  resetFilters: () => void;
  resetResults: () => void;
};
