'use server';

/**
 * @fileOverview AI-powered parking occupancy prediction flow.
 *
 * - predictOccupancy - Predicts parking occupancy based on a text description.
 * - PredictOccupancyInput - The input type for the predictOccupancy function.
 * - PredictOccupancyOutput - The return type for the predictOccupancy function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PredictOccupancyInputSchema = z.object({
  description: z
    .string()
    .describe('A description of the parking area, including time of day, day of week, weather conditions, and any events happening nearby.'),
});
export type PredictOccupancyInput = z.infer<typeof PredictOccupancyInputSchema>;

const PredictOccupancyOutputSchema = z.object({
  occupancyLevel: z
    .string()
    .describe(
      'The predicted occupancy level of the parking area (e.g., "low", "medium", "high").'
    ),
  confidence: z
    .number()
    .describe(
      'A confidence score between 0 and 1 indicating the certainty of the prediction.'
    ),
  reason: z
    .string()
    .describe('A brief explanation of why the AI made this prediction.'),
});
export type PredictOccupancyOutput = z.infer<typeof PredictOccupancyOutputSchema>;

export async function predictOccupancy(
  input: PredictOccupancyInput
): Promise<PredictOccupancyOutput> {
  return predictOccupancyFlow(input);
}

const prompt = ai.definePrompt({
  name: 'predictOccupancyPrompt',
  input: {schema: PredictOccupancyInputSchema},
  output: {schema: PredictOccupancyOutputSchema},
  prompt: `You are an AI assistant that predicts the occupancy level of a parking area.

  Based on the following description, predict the occupancy level, confidence, and provide a reason for your prediction.

  Description: {{{description}}}

  Format your response as a JSON object.
  `,
});

const predictOccupancyFlow = ai.defineFlow(
  {
    name: 'predictOccupancyFlow',
    inputSchema: PredictOccupancyInputSchema,
    outputSchema: PredictOccupancyOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
