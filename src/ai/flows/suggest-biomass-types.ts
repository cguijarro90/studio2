'use server';
/**
 * @fileOverview Suggests new types of biomass sources based on current data and trends.
 *
 * - suggestBiomassTypes - A function that handles the suggestion of new biomass types.
 * - SuggestBiomassTypesInput - The input type for the suggestBiomassTypes function.
 * - SuggestBiomassTypesOutput - The return type for the suggestBiomassTypes function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestBiomassTypesInputSchema = z.object({
  existingTypes: z
    .array(z.string())
    .describe('The list of existing biomass types in the application.'),
  dataDescription: z
    .string()
    .describe('A description of the current biomass data available.'),
});
export type SuggestBiomassTypesInput = z.infer<typeof SuggestBiomassTypesInputSchema>;

const SuggestBiomassTypesOutputSchema = z.object({
  suggestedTypes: z
    .array(z.string())
    .describe('A list of suggested new biomass types.'),
  reasoning: z
    .string()
    .describe('The AI reasoning behind the suggested biomass types.'),
});
export type SuggestBiomassTypesOutput = z.infer<typeof SuggestBiomassTypesOutputSchema>;

export async function suggestBiomassTypes(
  input: SuggestBiomassTypesInput
): Promise<SuggestBiomassTypesOutput> {
  return suggestBiomassTypesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestBiomassTypesPrompt',
  input: {schema: SuggestBiomassTypesInputSchema},
  output: {schema: SuggestBiomassTypesOutputSchema},
  prompt: `You are an expert in biomass energy sources. Given the current biomass types and a description of the available data, suggest new biomass types that could be relevant for the application.

Existing Biomass Types: {{existingTypes}}
Data Description: {{dataDescription}}

Suggest at least three new biomass types, and explain your reasoning for each suggestion. Format the output as a JSON object with 'suggestedTypes' (an array of strings) and 'reasoning' (a string explaining the suggestions).`,
});

const suggestBiomassTypesFlow = ai.defineFlow(
  {
    name: 'suggestBiomassTypesFlow',
    inputSchema: SuggestBiomassTypesInputSchema,
    outputSchema: SuggestBiomassTypesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

