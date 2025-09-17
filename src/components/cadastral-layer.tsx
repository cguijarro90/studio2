'use client';

import { useEffect, useCallback, useState, useRef } from 'react';
import { useMap } from '@vis.gl/react-google-maps';
import { useBiomassStore } from '@/store/biomass-store';
import { searchCadastralParcels } from '@/app/actions';
import { useDebounce } from '@/hooks/use-debounce';
import type { CadastralParcel } from '@/lib/types';

// This component is no longer used, the logic has been moved to biomass-map.tsx and biomass-mapper-client.tsx
export default function CadastralLayer() {
  return null;
}
