// @ts-nocheck
'use server';
import { predictOccupancy, PredictOccupancyInput, PredictOccupancyOutput } from "@/ai/flows/occupancy-prediction";
import { z } from "zod";

const PredictOccupancyActionInputSchema = z.object({
  description: z.string().min(10, { message: "Description must be at least 10 characters long." }),
});

export async function getOccupancyPrediction(input: PredictOccupancyInput): Promise<{ data: PredictOccupancyOutput | null; error: string | null }> {
  
  const validatedInput = PredictOccupancyActionInputSchema.safeParse(input);

  if (!validatedInput.success) {
    return { data: null, error: validatedInput.error.errors.map(e => e.message).join(', ') };
  }
  
  try {
    const output = await predictOccupancy(validatedInput.data);
    return { data: output, error: null };
  } catch (e) {
    console.error(e);
    const errorMessage = e instanceof Error ? e.message : "An unknown error occurred.";
    return { data: null, error: `Failed to get prediction: ${errorMessage}` };
  }
}
