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


function writeToRelay(host: string, port: number, command: string): Promise<void> {
    return new Promise((resolve, reject) => {
        const client = new net.Socket();
        const timeout = 5000;
        let connected = false;

        const connectTimeout = setTimeout(() => {
            if (!connected) {
                client.destroy();
                reject(new Error(`Connection to ${host}:${port} timed out`));
            }
        }, timeout);

        client.on('error', (err) => {
            console.error(`[Relay Write] Connection error to ${host}:${port}:`, err.message);
            client.destroy();
            clearTimeout(connectTimeout);
            reject(err);
        });

        client.connect(port, host, () => {
            connected = true;
            clearTimeout(connectTimeout);
            console.log(`[Relay Write] Connected to ${host}:${port}`);
            console.log(`[Relay Write] Sending command: '${command}'`);
            client.write(command, (err) => {
                if (err) {
                    console.error('[Relay Write] Error sending command:', err);
                    client.destroy();
                    return reject(err);
                }
                console.log('[Relay Write] Command sent. Closing connection.');
                client.end(); // Gracefully close the connection
                resolve();
            });
        });

         client.on('close', () => {
            console.log(`[Relay Write] Connection closed to ${host}:${port}`);
        });
    });
}

function readFromRelay(host: string, port: number, command: string): Promise<string> {
    return new Promise((resolve, reject) => {
        const client = new net.Socket();
        const timeout = 5000;
        let hasResolved = false;

        const timer = setTimeout(() => {
            if (!hasResolved) {
                hasResolved = true;
                client.destroy();
                reject(new Error('Relay command timed out'));
            }
        }, timeout);

        client.on('error', (err) => {
            if (hasResolved) return;
            hasResolved = true;
            console.error(`[Relay Read] Connection error to ${host}:${port}:`, err.message);
            client.destroy();
            clearTimeout(timer);
            reject(err);
        });
        
        client.on('close', () => {
            if (!hasResolved) {
                 hasResolved = true;
                 clearTimeout(timer);
                 reject(new Error('Connection closed before receiving data.'));
            }
            console.log(`[Relay Read] Connection closed to ${host}:${port}`);
        });

        client.connect(port, host, () => {
            console.log(`[Relay Read] Connected to ${host}:${port}`);
            console.log(`[Relay Read] Sending command: '${command}'`);
            client.write(command, (err) => {
                if (err) {
                   if (hasResolved) return;
                   hasResolved = true;
                   console.error('[Relay Read] Error writing command:', err);
                   clearTimeout(timer);
                   client.destroy();
                   return reject(err);
                }
                 console.log('[Relay Read] Command sent successfully.');
            });
        });

        client.on('data', (data) => {
            if (hasResolved) return;
            hasResolved = true;
            const response = data.toString().trim();
            console.log(`[Relay Read] Received from relay: '${response}'`);
            clearTimeout(timer);
            client.end();
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
    
    let commandString = '00000000'.split('');
    if (action === 'open') {
        commandString[output - 1] = '1';
    }
    // For 'close', the default '0' is correct.
    const command = `all${commandString.join('')}`;
    
    try {
        await writeToRelay(host, port, command);
        return { success: true, message: `Gate ${action} command sent successfully.` };
    } catch (e) {
        const errorMessage = e instanceof Error ? e.message : "An unknown error occurred.";
        console.error(`[Relay] Failed to control gate: ${errorMessage}`);
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
        const response = await readFromRelay(host, port, 'input');
        if (response.startsWith('input') && response.length >= 13) {
            const binaryData = response.substring(5, 13); 
            return { success: true, data: binaryData, message: 'Successfully read gate sensor.' };
        }
        return { success: false, message: `Unexpected response from relay: ${response}` };

    } catch (e) {
        const errorMessage = e instanceof Error ? e.message : "An unknown error occurred.";
        console.error(`[Relay] Failed to read gate sensor: ${errorMessage}`);
        return { success: false, message: `Failed to read gate sensor: ${errorMessage}` };
    }
}
