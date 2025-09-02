'use server';

import { BigQuery } from '@google-cloud/bigquery';
import { z } from 'zod';
import { suggestBiomassTypes as suggestBiomassTypesFlow } from '@/ai/flows/suggest-biomass-types';
import type { SearchResults, BiomassSource, BiomassType } from '@/lib/types';

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

  const bigquery = new BigQuery({
    projectId: process.env.GOOGLE_PROJECT_ID,
  });

  const typesArray = types && types.length > 0 ? types : [];

  const baseQuery = `
    FROM \`${process.env.GOOGLE_PROJECT_ID}.${process.env.GOOGLE_BIGQUERY_DATASET}.${process.env.GOOGLE_BIGQUERY_TABLE}\`
    WHERE ST_DWithin(geom, ST_GeogPoint(@lng, @lat), @radius_m)
      AND (@types_len = 0 OR type IN UNNEST(@types))
  `;

  const countQuery = `SELECT count(*) as total ${baseQuery}`;
  const dataQuery = `
    SELECT
      id, name, type, quantity,
      ST_Distance(geom, ST_GeogPoint(@lng, @lat)) AS distance_m,
      ST_AsGeoJSON(geom) AS geom_geojson
    ${baseQuery}
    ORDER BY distance_m ASC
    LIMIT @limit OFFSET @offset
  `;

  const queryConfig = {
    query: '',
    params: {
      lat,
      lng,
      radius_m,
      types: typesArray,
      types_len: typesArray.length,
      limit,
      offset,
    },
  };

  try {
    const [[countResult], [dataResult]] = await Promise.all([
      bigquery.query({ ...queryConfig, query: countQuery }),
      bigquery.query({ ...queryConfig, query: dataQuery }),
    ]);

    const total = countResult[0]?.total || 0;
    const items = dataResult as BiomassSource[];
    
    return { items, total, page, limit };
  } catch (error) {
    console.error('BigQuery Error:', error);
    throw new Error('Failed to fetch data from BigQuery.');
  }
}

export async function suggestBiomassTypes(existingTypes: BiomassType[], dataDescription: string) {
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
