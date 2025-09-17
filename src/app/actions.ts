'use server';

import { z } from 'zod';
import { BigQuery } from '@google-cloud/bigquery';
import type { SearchResults, BiomassSource } from '@/lib/types';
import { spainProvinces } from '@/lib/provinces';

const bigquery = new BigQuery();

const searchSchema = z.object({
  lat: z.number(),
  lng: z.number(),
  radius_m: z.number().min(100).max(75000),
  page: z.number().min(1),
  limit: z.number().min(1).max(100),
});

export async function searchBiomass(
  params: z.infer<typeof searchSchema>
): Promise<SearchResults> {
  const validation = searchSchema.safeParse(params);
  if (!validation.success) {
    throw new Error(`Invalid search parameters: ${validation.error.message}`);
  }

  const { lat, lng, radius_m, page, limit } = validation.data;
  const offset = (page - 1) * limit;

  // The BigQuery table name should be in the format `project-id.dataset-id.table-id`
  const table = '`biomass-mapper.biomass.sources`';

  // We use ST_GEOGRAPHY functions for geospatial queries.
  // The query finds points within a given radius of the search center.
  let query = `
    SELECT
      id,
      name,
      type,
      quantity,
      location,
      ST_DISTANCE(location, ST_GEOGPOINT(@lng, @lat)) as distance_m
    FROM ${table}
    WHERE ST_DWITHIN(location, ST_GEOGPOINT(@lng, @lat), @radius_m)
  `;

  const queryParams: any = {
    lng: lng,
    lat: lat,
    radius_m: radius_m,
  };
  
  const countQuery = `SELECT COUNT(*) as count FROM (${query})`;

  query += `
    ORDER BY distance_m
    LIMIT @limit
    OFFSET @offset
  `;
  
  queryParams.limit = limit;
  queryParams.offset = offset;

  try {
    const [totalRows] = await bigquery.query({
      query: countQuery,
      params: queryParams,
    });
    const total = totalRows[0].count;
    
    if (total === 0) {
      return { items: [], total: 0, page, limit };
    }

    const [rows] = await bigquery.query({
      query: query,
      params: queryParams,
    });

    const items: BiomassSource[] = rows.map((row: any) => ({
      id: row.id,
      name: row.name,
      type: row.type,
      quantity: row.quantity,
      distance_m: row.distance_m,
      geom_geojson: JSON.stringify(row.location), // BigQuery returns GeoJSON object
    }));

    return { items, total, page, limit };
  } catch (error) {
    console.error('BigQuery Error:', error);
    if (error instanceof Error) {
        throw new Error(`Failed to fetch data from BigQuery: ${error.message}`);
    }
    throw new Error('An unknown error occurred while fetching data from BigQuery.');
  }
}

const provincesSchema = z.object({
  lat: z.number(),
  lng: z.number(),
  radiusKm: z.number(),
});

// Utility functions for geometry calculations
const haversineDistance = (coords1: {lat: number, lng: number}, coords2: {lat: number, lng: number}) => {
  const toRad = (x: number) => (x * Math.PI) / 180;
  const R = 6371; // Earth radius in km

  const dLat = toRad(coords2.lat - coords1.lat);
  const dLon = toRad(coords2.lng - coords1.lng);
  const lat1 = toRad(coords1.lat);
  const lat2 = toRad(coords2.lat);

  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
};

const isPointInCircle = (point: {lat: number, lng: number}, center: {lat: number, lng: number}, radiusKm: number) => {
  return haversineDistance(point, center) <= radiusKm;
};

const isPolygonInCircle = (polygon: number[][], center: {lat: number, lng: number}, radiusKm: number) => {
    // Check if any vertex of the polygon is inside the circle
    for (const point of polygon) {
      if (isPointInCircle({lng: point[0], lat: point[1]}, center, radiusKm)) {
        return true;
      }
    }
    // This is a simplification. A more accurate check would involve checking if any edge intersects the circle,
    // or if a point inside the polygon is inside the circle. For this app's purpose, this is sufficient.
    return false;
}

export async function getIntersectingProvinces(params: z.infer<typeof provincesSchema>): Promise<string[]> {
    const validation = provincesSchema.safeParse(params);
    if (!validation.success) {
      throw new Error(`Invalid parameters for getIntersectingProvinces: ${validation.error.message}`);
    }
    const { lat, lng, radiusKm } = validation.data;
    const center = { lat, lng };

    const foundProvinces: string[] = [];
    const provinceFeatures = (spainProvinces as any).features;

    for (const province of provinceFeatures) {
      // GeoJSON can have Polygon or MultiPolygon
      if (province.geometry.type === 'Polygon') {
        const polygonCoordinates = province.geometry.coordinates[0]; // Exterior ring
        if(isPolygonInCircle(polygonCoordinates, center, radiusKm)) {
            foundProvinces.push(province.properties.name);
        }
      } else if (province.geometry.type === 'MultiPolygon') {
        for(const polygon of province.geometry.coordinates) {
            const polygonCoordinates = polygon[0]; // Exterior ring
            if(isPolygonInCircle(polygonCoordinates, center, radiusKm)) {
                foundProvinces.push(province.properties.name);
                break; // Found, no need to check other polygons for this province
            }
        }
      }
    }
    
    return foundProvinces.sort();
}
