

export const BIOMASS_TYPES = ['pellets', 'carbon', 'otros'] as const;
export type BiomassType = (typeof BIOMASS_TYPES)[number];

export type BiomassSource = {
  id: string;
  name: string;
  type: BiomassType;
  quantity: number;
  distance_m: number;
  geom_geojson: string; // JSON string of a GeoJSON point
};

export type CadastralParcel = {
  id: string;
  geom_geojson: string; // JSON string of a GeoJSON polygon
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
  center: Point | null;
  radiusKm: number;
  biomassTypes: BiomassType[];
  overlays: {
    markers: boolean;
    cadastral: boolean;
  };
  page: number;
  results: BiomassSource[];
  totalResults: number;
  isLoading: boolean;
  isInitialDialogOpen: boolean;
  isOutOfSpainDialogOpen: boolean;
  map: google.maps.Map | null;
  selectedSourceId: string | null;
  locale: Locale;
  searchInitiated: boolean;
  intersectingProvinces: string[];
  isLoadingProvinces: boolean;
  cadastralParcels: CadastralParcel[];
  isLoadingParcels: boolean;
};

export type AppActions = {
  setCenter: (center: Point) => void;
  setRadiusKm: (radius: number) => void;
  setBiomassTypes: (types: BiomassType[]) => void;
  setOverlays: (overlays: AppState['overlays']) => void;
  setPage: (page: number) => void;
  setResults: (data: SearchResults) => void;
  setTotalResults: (total: number) => void;
  setIsLoading: (loading: boolean) => void;
  setIsInitialDialogOpen: (isOpen: boolean) => void;
  setIsOutOfSpainDialogOpen: (isOpen: boolean) => void;
  setMap: (map: google.maps.Map | null) => void;
  setSelectedSourceId: (id: string | null) => void;
  setLocale: (locale: Locale) => void;
  setSearchInitiated: (initiated: boolean) => void;
  setIntersectingProvinces: (provinces: string[]) => void;
  setIsLoadingProvinces: (loading: boolean) => void;
  setCadastralParcels: (parcels: CadastralParcel[]) => void;
  setIsLoadingParcels: (loading: boolean) => void;
  resetFilters: () => void;
  resetResults: () => void;
};
