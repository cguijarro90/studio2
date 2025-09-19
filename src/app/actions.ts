'use server';

import { z } from 'zod';
import { BigQuery } from '@google-cloud/bigquery';
import type { SearchResults, BiomassSource, AgriculturalPlot } from '@/lib/types';

const bigquery = new BigQuery({
  projectId: process.env.GOOGLE_PROJECT_ID,
  credentials: {
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  },
});

const searchSchema = z.object({
  lat: z.number(),
  lng: z.number(),
  radius_m: z.number().min(100).max(75000),
  page: z.number().min(1).optional(),
  limit: z.number().min(1).max(100).optional(),
  fetchAll: z.boolean().optional(),
});

export async function searchBiomass(
  params: z.infer<typeof searchSchema>
): Promise<SearchResults> {
  const validation = searchSchema.safeParse(params);
  if (!validation.success) {
    throw new Error(`Invalid search parameters: ${validation.error.message}`);
  }

  const { lat, lng, radius_m, page = 1, limit = 50, fetchAll = false } = validation.data;
  const offset = (page - 1) * limit;

  const table = '`ce-sdx-platform-0007.REE_BRONZE.INSTALACIONES_COGEN_2025_05`';

  // We use ST_GEOGRAPHY functions for geospatial queries.
  // The query finds points within a given radius of the search center.
  let query = `
    SELECT
      objectid as id,
      descripcion as name,
      tecnologia as type,
      mw as quantity,
      geometry as location,
      ST_DISTANCE(geometry, ST_GEOGPOINT(@lng, @lat)) as distance_m
    FROM ${table}
    WHERE ST_DWITHIN(geometry, ST_GEOGPOINT(@lng, @lat), @radius_m)
  `;

  const queryParams: any = {
    lng: lng,
    lat: lat,
    radius_m: radius_m,
  };
  
  const countQuery = `SELECT COUNT(*) as count FROM (${query})`;

  if (!fetchAll) {
      query += `
        ORDER BY distance_m
        LIMIT @limit
        OFFSET @offset
      `;
      queryParams.limit = limit;
      queryParams.offset = offset;
  } else {
      query += ` ORDER BY distance_m LIMIT 1000`; // Limit to 1000 for map view to avoid overload
  }

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
      id: row.id.toString(),
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

const plotSearchSchema = z.object({
  lat: z.number(),
  lng: z.number(),
  radius_m: z.number().min(100).max(75000),
});

export async function searchAgriculturalPlots(
  params: z.infer<typeof plotSearchSchema>
): Promise<AgriculturalPlot[]> {
  const validation = plotSearchSchema.safeParse(params);
  if (!validation.success) {
    throw new Error(`Invalid search parameters: ${validation.error.message}`);
  }

  const { lat, lng, radius_m } = validation.data;

  // Reduce radius for polygon search to avoid performance issues and huge data transfers
  const effective_radius_m = Math.min(radius_m, 10000); // Max 10km radius for plots

  const table = '`ce-sdx-platform-0007.SPAIN_SIGPAC_LINEAS_GOLD.SPAIN_MAPA_FORESTAL`';

  // ST_SIMPLIFY is used to reduce the complexity of polygons, improving performance.
  // The tolerance (100) is in meters. Adjust as needed.
  const query = `
    SELECT
      objectid as id,
      descripcion,
      provincia,
      area_ha,
      ST_ASGEOJSON(ST_SIMPLIFY(geometry, 100)) as geometry
    FROM ${table}
    WHERE ST_DWITHIN(geometry, ST_GEOGPOINT(@lng, @lat), @radius_m)
    LIMIT 500
  `;

  const queryParams = {
    lng,
    lat,
    radius_m: effective_radius_m,
  };

  try {
    const [rows] = await bigquery.query({
      query: query,
      params: queryParams,
    });

    const items: AgriculturalPlot[] = rows.map((row: any) => ({
      id: row.id.toString(),
      cropType: row.descripcion,
      province: row.provincia,
      area_ha: row.area_ha,
      geometry: row.geometry, // This is already a GeoJSON string
    }));

    return items;
  } catch (error) {
    console.error('BigQuery Error fetching plots:', error);
    if (error instanceof Error) {
        throw new Error(`Failed to fetch plot data from BigQuery: ${error.message}`);
    }
    throw new Error('An unknown error occurred while fetching plot data.');
  }
}
