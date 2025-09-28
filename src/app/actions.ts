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

const ReadInputActionSchema = z.object({
  host: z.string(),
  port: z.number(),
});


function sendCommandToRelay(host: string, port: number, command: string): Promise<string> {
    return new Promise((resolve, reject) => {
        const client = new net.Socket();
        const timeout = 5000;
        let hasConnected = false;
        let connectionClosed = false;

        const timer = setTimeout(() => {
            client.destroy();
            reject(new Error(`Relay command timed out for command "${command}"`));
        }, timeout);

        client.on('error', (err) => {
            if (connectionClosed) return;
            connectionClosed = true;
            console.error(`[Relay] Connection error to ${host}:${port}:`, err.message);
            client.destroy();
            clearTimeout(timer);
            reject(err);
        });
        
        client.on('close', () => {
             if (connectionClosed) return;
             connectionClosed = true;
             console.log(`[Relay] Connection closed to ${host}:${port}`);
             clearTimeout(timer);
             if (!hasConnected) {
                reject(new Error(`Connection to ${host}:${port} failed`));
             }
        });

        client.connect(port, host, () => {
            hasConnected = true;
            console.log(`[Relay] Connected to ${host}:${port}`);
            console.log(`[Relay] Sending command: '${command}'`);
            client.write(command, (err) => {
                if (err) {
                   console.error('[Relay] Error writing command:', err);
                   client.destroy();
                   return reject(err);
                }
                 console.log('[Relay] Command sent successfully.');
            });
        });

        client.on('data', (data) => {
            const response = data.toString().trim();
            console.log(`[Relay] Received from relay: '${response}'`);
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
        if (response === expectedResponse) {
            return { success: true, message: `Gate ${action} command sent successfully.` };
        } else {
            const message = `Unexpected response from relay: got '${response}', expected '${expectedResponse}'`;
            console.error(`[Relay] ${message}`);
            return { success: false, message };
        }
    } catch (e) {
        const errorMessage = e instanceof Error ? e.message : "An unknown error occurred.";
        console.error(`[Relay] Failed to control gate: ${errorMessage}`);
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
        // Expecting "input" + 8 binary digits, e.g. "input00000001"
        if (response.startsWith('input') && response.length === 13) { 
            const binaryData = response.substring(5); 
            return { success: true, data: binaryData, message: 'Successfully read gate sensor.' };
        }
        return { success: false, message: `Unexpected response from relay: ${response}` };

    } catch (e) {
        const errorMessage = e instanceof Error ? e.message : "An unknown error occurred.";
        console.error(`[Relay] Failed to read gate sensor: ${errorMessage}`);
        return { success: false, message: `Failed to read gate sensor: ${errorMessage}` };
    }
}
