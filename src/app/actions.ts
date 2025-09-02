'use server';

import { z } from 'zod';
import { getFirestore, GeoPoint } from 'firebase-admin/firestore';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { suggestBiomassTypes as suggestBiomassTypesFlow } from '@/ai/flows/suggest-biomass-types';
import type { SearchResults, BiomassSource, BiomassType } from '@/lib/types';

if (getApps().length === 0) {
  const serviceAccountString = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (serviceAccountString) {
    try {
      const serviceAccount = JSON.parse(serviceAccountString);
      initializeApp({
        credential: cert(serviceAccount),
        projectId: process.env.GOOGLE_PROJECT_ID,
      });
    } catch (e) {
      console.error('Error parsing FIREBASE_SERVICE_ACCOUNT_KEY:', e);
      // Fallback to default credentials if parsing fails
      initializeApp();
    }
  } else {
    // Use Application Default Credentials
    initializeApp();
  }
}

const searchSchema = z.object({
  lat: z.number(),
  lng: z.number(),
  radius_m: z.number().min(100).max(200000),
  types: z.array(z.string()).optional(),
  page: z.number().min(1),
  limit: z.number().min(1).max(100),
});

function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // metres
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // in metres
}

export async function searchBiomass(
  params: z.infer<typeof searchSchema>
): Promise<SearchResults> {
  const validation = searchSchema.safeParse(params);
  if (!validation.success) {
    throw new Error(`Invalid search parameters: ${validation.error.message}`);
  }

  const { lat, lng, radius_m, types, page, limit } = validation.data;

  try {
    const db = getFirestore();
    let query: FirebaseFirestore.Query<FirebaseFirestore.DocumentData> =
      db.collection('biomass_sources');

    if (types && types.length > 0) {
      query = query.where('type', 'in', types);
    }

    const snapshot = await query.get();
    
    if (snapshot.empty) {
        return { items: [], total: 0, page, limit };
    }

    const allItems: BiomassSource[] = snapshot.docs.map(doc => {
      const data = doc.data();
      const location = data.location as GeoPoint;
      const distance = haversineDistance(
        lat,
        lng,
        location.latitude,
        location.longitude
      );
      
      return {
        id: doc.id,
        name: data.name,
        type: data.type,
        quantity: data.quantity,
        distance_m: distance,
        geom_geojson: JSON.stringify({
          type: 'Point',
          coordinates: [location.longitude, location.latitude],
        }),
      };
    });
    
    const filteredItems = allItems.filter(item => item.distance_m <= radius_m);

    filteredItems.sort((a, b) => a.distance_m - b.distance_m);
    
    const total = filteredItems.length;
    const offset = (page - 1) * limit;
    const items = filteredItems.slice(offset, offset + limit);

    return { items, total, page, limit };
  } catch (error) {
    console.error('Firestore Error:', error);
    if (error instanceof Error) {
        throw new Error(`Failed to fetch data from Firestore: ${error.message}`);
    }
    throw new Error('An unknown error occurred while fetching data from Firestore.');
  }
}

export async function suggestBiomassTypes(
  existingTypes: BiomassType[],
  dataDescription: string
) {
  try {
    const result = await suggestBiomassTypesFlow({
      existingTypes,
      dataDescription,
    });
    return result;
  } catch (error) {
    console.error('AI suggestion error:', error);
    throw new Error('Failed to get AI suggestions.');
  }
}
