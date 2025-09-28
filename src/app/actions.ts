
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
        console.log(`Attempting to connect to ${host}:${port}`);

        const timer = setTimeout(() => {
            console.error(`Connection to ${host}:${port} timed out.`);
            client.destroy();
            reject(new Error('Relay command timed out'));
        }, timeout);

        client.on('error', (err) => {
            console.error(`Relay connection error to ${host}:${port}:`, err);
            clearTimeout(timer);
            client.destroy();
            reject(err);
        });

        client.on('close', () => {
            console.log(`Connection closed to ${host}:${port}`);
            clearTimeout(timer);
        });

        client.connect(port, host, () => {
            console.log(`Connected to relay at ${host}:${port}`);
            console.log(`Sending command: ${command}`);
            client.write(command, (err) => {
                if (err) {
                    console.error(`Error writing command to relay:`, err);
                    clearTimeout(timer);
                    client.destroy();
                    return reject(err);
                }
                console.log(`Command sent successfully.`);
                if (!waitForResponse) {
                    client.end(() => {
                        console.log('Closing connection as no response is expected.');
                        clearTimeout(timer);
                        resolve("Command sent");
                    });
                }
            });
        });

        if (waitForResponse) {
            client.on('data', (data) => {
                const response = data.toString().trim();
                console.log(`Received from relay: ${response}`);
                client.end(() => {
                   console.log('Closing connection after receiving data.');
                   clearTimeout(timer);
                   resolve(response);
                });
            });
        }
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
        await sendRelayCommand(host, port, command, false);
        return { success: true, message: `Gate ${action} command sent successfully.` };
    } catch (e) {
        const errorMessage = e instanceof Error ? e.message : "An unknown error occurred.";
        console.error(`Failed to control gate: ${errorMessage}`);
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
        const response = await sendRelayCommand(host, port, 'input', true);
        if (response.startsWith('input') && response.length === 13) {
            const binaryData = response.substring(5); 
            return { success: true, data: binaryData, message: 'Successfully read gate sensor.' };
        }
        return { success: false, message: `Unexpected response from relay: ${response}` };

    } catch (e) {
        const errorMessage = e instanceof Error ? e.message : "An unknown error occurred.";
        console.error(`Failed to read gate sensor: ${errorMessage}`);
        return { success: false, message: `Failed to read gate sensor: ${errorMessage}` };
    }
}



