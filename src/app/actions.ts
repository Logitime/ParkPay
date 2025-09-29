
// @ts-nocheck
'use server';
import { predictOccupancy, PredictOccupancyInput, PredictOccupancyOutput } from "@/ai/flows/occupancy-prediction";
import { generateParkerEmail, GenerateParkerEmailOutput } from "@/ai/flows/generate-parker-email";
import { z } from "zod";
import net from 'net';

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

const GenerateParkerEmailInputSchema = z.object({
  name: z.string().describe('The name of the parker.'),
  participation: z.string().describe('The type of their parking plan (e.g., monthly, yearly).'),
  balance: z.number().describe('The outstanding balance on their account.'),
  dueDate: z.string().describe('The due date for the payment (e.g., YYYY-MM-DD).'),
});
type GenerateParkerEmailInput = z.infer<typeof GenerateParkerEmailInputSchema>;


export async function sendParkerNotification(input: GenerateParkerEmailInput): Promise<{ data: GenerateParkerEmailOutput | null; error: string | null }> {
  const validatedInput = GenerateParkerEmailInputSchema.safeParse(input);

  if (!validatedInput.success) {
    return { data: null, error: validatedInput.error.errors.map(e => e.message).join(', ') };
  }

  try {
    const emailContent = await generateParkerEmail(validatedInput.data);
    
    // In a real-world application, you would add your email sending logic here.
    // For example, using a service like Nodemailer or an API like SendGrid.
    console.log(`Simulating sending email to ${input.name}:`, emailContent);

    return { data: emailContent, error: null };
  } catch (e) {
    console.error(e);
    const errorMessage = e instanceof Error ? e.message : "An unknown error occurred.";
    return { data: null, error: `Failed to generate notification: ${errorMessage}` };
  }
}


const GateActionSchema = z.object({
  host: z.string(),
  port: z.number(),
  output: z.number().min(1).max(8),
  action: z.enum(['open', 'close']),
});

const ReadInputActionSchema = z.object({
  host: z.string(),
  port: z.number(),
});


function sendCommandToRelay(host: string, port: number, command: string): Promise<string> {
    return new Promise((resolve, reject) => {
        const client = new net.Socket();
        const timeout = 2000; // Reduced timeout for quicker feedback
        let hasConnected = false;
        let connectionClosed = false;

        const timer = setTimeout(() => {
            if (connectionClosed) return;
            connectionClosed = true;
            client.destroy();
            resolve('timeout');
        }, timeout);

        client.on('error', (err) => {
            if (connectionClosed) return;
            connectionClosed = true;
            client.destroy();
            clearTimeout(timer);
            resolve('timeout');
        });
        
        client.on('close', () => {
             if (connectionClosed) return;
             connectionClosed = true;
             clearTimeout(timer);
             if (!hasConnected) {
                resolve('timeout');
             }
        });

        client.connect(port, host, () => {
            hasConnected = true;
            client.write(command, (err) => {
                if (err) {
                   client.destroy();
                   return reject(err);
                }
            });
        });

        client.on('data', (data) => {
            clearTimeout(timer); // Clear the timeout on successful data receipt
            const response = data.toString().trim();
            client.end(); // Gracefully close the connection
            resolve(response);
        });
    });
}


export async function controlGate(input: z.infer<typeof GateActionSchema>): Promise<{ success: boolean; message: string }> {
    const validatedInput = GateActionSchema.safeParse(input);
    if (!validatedInput.success) {
        return { success: false, message: validatedInput.error.errors.map(e => e.message).join(', ') };
    }

    const { host, port, output, action } = validatedInput.data;
    
    // According to the doc, command is 'on' or 'off' followed by the channel number.
    const command = action === 'open' ? `on${output}` : `off${output}`;
    const expectedResponse = command;
    
    try {
        const response = await sendCommandToRelay(host, port, command);
        if (response === 'timeout') {
            return { success: false, message: `Relay command timed out for command "${command}"` };
        }
        if (response === expectedResponse) {
            return { success: true, message: `Gate ${action} command sent successfully.` };
        } else {
            const message = `Unexpected response from relay: got '${response}', expected '${expectedResponse}'`;
            return { success: false, message };
        }
    } catch (e) {
        const errorMessage = e instanceof Error ? e.message : "An unknown error occurred.";
        return { success: false, message: `Failed to control gate: ${errorMessage}` };
    }
}


export async function readGateSensor(input: z.infer<typeof ReadInputActionSchema>): Promise<{ success: boolean; data?: string; message: string }> {
    const validatedInput = ReadInputActionSchema.safeParse(input);
    if (!validatedInput.success) {
        return { success: false, message: validatedInput.error.errors.map(e => e.message).join(', ') };
    }

    const { host, port } = validatedInput.data;
    const command = 'input';
    
    try {
        const response = await sendCommandToRelay(host, port, command);
        if (response === 'timeout') {
            return { success: false, message: `Relay command timed out for command "${command}"` };
        }
        // Expecting "input" + 8 binary digits, e.g. "input00000001"
        if (response.startsWith('input') && response.length === 13) { 
            const binaryData = response.substring(5); 
            return { success: true, data: binaryData, message: 'Successfully read gate sensor.' };
        }
        return { success: false, message: `Unexpected response from relay: ${response}` };

    } catch (e) {
        const errorMessage = e instanceof Error ? e.message : "An unknown error occurred.";
        return { success: false, message: `Failed to read gate sensor: ${errorMessage}` };
    }
}

    