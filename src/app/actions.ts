'use server';

import { z } from 'zod';
import { BigQuery } from '@google-cloud/bigquery';
import { suggestBiomassTypes as suggestBiomassTypesFlow } from '@/ai/flows/suggest-biomass-types';
import type { SearchResults, BiomassSource, BiomassType } from '@/lib/types';

const bigquery = new BigQuery();

const searchSchema = z.object({
  lat: z.number(),
  lng: z.number(),
  radius_m: z.number().min(100).max(200000),
  types: z.array(z.string()).optional(),
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

  const { lat, lng, radius_m, types, page, limit } = validation.data;
  const offset = (page - 1) * limit;

  // The BigQuery table name should be in the format `project-id.dataset-id.table-id`
  // You might need to adjust this based on your BigQuery setup.
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
    WHERE ST_D WITHIN(location, ST_GEOGPOINT(@lng, @lat), @radius_m)
  `;

  const queryParams: any = {
    lng: lng,
    lat: lat,
    radius_m: radius_m,
  };

  if (types && types.length > 0) {
    query += ` AND type IN UNNEST(@types)`;
    queryParams.types = types;
  }
  
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
