
// @ts-nocheck
'use server';
import { predictOccupancy, PredictOccupancyInput, PredictOccupancyOutput } from "@/ai/flows/occupancy-prediction";
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

const GateActionSchema = z.object({
  host: z.string(),
  port: z.number(),
  output: z.number().min(1).max(8),
  action: z.enum(['open', 'close']),
});

function sendRelayCommand(host: string, port: number, command: string, waitForResponse: boolean = true): Promise<string> {
    return new Promise((resolve, reject) => {
        const client = new net.Socket();
        const timeout = 5000; // 5-second timeout

        const timer = setTimeout(() => {
            reject(new Error('Relay command timed out'));
            client.destroy();
        }, timeout);

        client.connect(port, host, () => {
            console.log(`Connected to relay at ${host}:${port}`);
            client.write(command);
            if (!waitForResponse) {
                clearTimeout(timer);
                client.end();
                resolve("Command sent");
            }
        });

        if (waitForResponse) {
            client.on('data', (data) => {
                const response = data.toString().trim();
                console.log(`Received from relay: ${response}`);
                clearTimeout(timer);
                client.end();
                resolve(response);
            });
        }

        client.on('error', (err) => {
            console.error(`Relay connection error: ${err.message}`);
            clearTimeout(timer);
            reject(err);
        });

        client.on('close', () => {
            console.log('Connection to relay closed');
            clearTimeout(timer);
        });
    });
}


export async function controlGate(input: z.infer<typeof GateActionSchema>): Promise<{ success: boolean; message: string }> {
    const validatedInput = GateActionSchema.safeParse(input);
    if (!validatedInput.success) {
        return { success: false, message: validatedInput.error.errors.map(e => e.message).join(', ') };
    }

    const { host, port, output, action } = validatedInput.data;
    
    // Command format is 'all' followed by an 8-digit binary string.
    // '1' activates the output, '0' deactivates it.
    // We create a bitmask for the specified output port.
    let commandString = '00000000'.split('');
    commandString[output - 1] = action === 'open' ? '1' : '0';
    const command = `all${commandString.join('')}`;
    
    try {
        const response = await sendRelayCommand(host, port, command, false); // Don't wait for a response
        return { success: true, message: `Gate ${action} command sent. Relay response: ${response}` };
    } catch (e) {
        const errorMessage = e instanceof Error ? e.message : "An unknown error occurred.";
        return { success: false, message: `Failed to control gate: ${errorMessage}` };
    }
}

const ReadInputActionSchema = z.object({
  host: z.string(),
  port: z.number(),
});

export async function readGateSensor(input: z.infer<typeof ReadInputActionSchema>): Promise<{ success: boolean; data?: string; message: string }> {
    const validatedInput = ReadInputActionSchema.safeParse(input);
    if (!validatedInput.success) {
        return { success: false, message: validatedInput.error.errors.map(e => e.message).join(', ') };
    }

    const { host, port } = validatedInput.data;
    
    try {
        const response = await sendRelayCommand(host, port, 'input', true); // Wait for a response
        // Assuming the response is a binary string like '11110000'
        return { success: true, data: response, message: 'Successfully read gate sensor.' };
    } catch (e) {
        const errorMessage = e instanceof Error ? e.message : "An unknown error occurred.";
        return { success: false, message: `Failed to read gate sensor: ${errorMessage}` };
    }
}
