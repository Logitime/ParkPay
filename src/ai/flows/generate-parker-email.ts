'use server';

/**
 * @fileOverview An AI flow to generate a parking payment reminder email.
 *
 * - generateParkerEmail - A function that generates an email body.
 * - GenerateParkerEmailInput - The input type for the function.
 * - GenerateParkerEmailOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateParkerEmailInputSchema = z.object({
  name: z.string().describe('The name of the parker.'),
  participation: z.string().describe('The type of their parking plan (e.g., monthly, yearly).'),
  balance: z.number().describe('The outstanding balance on their account.'),
  dueDate: z.string().describe('The due date for the payment (e.g., YYYY-MM-DD).'),
});
export type GenerateParkerEmailInput = z.infer<typeof GenerateParkerEmailInputSchema>;

const GenerateParkerEmailOutputSchema = z.object({
  subject: z.string().describe('The subject line for the email.'),
  body: z.string().describe('The full body content of the email.'),
});
export type GenerateParkerEmailOutput = z.infer<
  typeof GenerateParkerEmailOutputSchema
>;

export async function generateParkerEmail(
  input: GenerateParkerEmailInput
): Promise<GenerateParkerEmailOutput> {
  return generateParkerEmailFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateParkerEmailPrompt',
  input: {schema: GenerateParkerEmailInputSchema},
  output: {schema: GenerateParkerEmailOutputSchema},
  prompt: `You are an assistant for a parking management company called ParkPay. Your task is to generate a friendly and professional reminder email to a parker regarding their account balance and upcoming payment.

The email should:
- Greet the parker by name.
- Clearly state their outstanding balance and the due date.
- Mention their participation type.
- Include instructions on how to pay (e.g., "You can pay via our online portal or at the cashier station.").
- Have a friendly closing.

Generate a subject and a body for the email based on the following details:

Parker Name: {{{name}}}
Participation Plan: {{{participation}}}
Balance: {{{balance}}}
Due Date: {{{dueDate}}}

Format the response as a JSON object with "subject" and "body" fields.`,
});

const generateParkerEmailFlow = ai.defineFlow(
  {
    name: 'generateParkerEmailFlow',
    inputSchema: GenerateParkerEmailInputSchema,
    outputSchema: GenerateParkerEmailOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
