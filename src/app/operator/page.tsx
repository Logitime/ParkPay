
'use client';

import { useState, useEffect, useRef } from 'react';
import { useToast } from "@/hooks/use-toast";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Ticket, Car, CheckCircle, MonitorSpeaker, Wifi, WifiOff, Loader2, ChevronUp, ChevronDown, TriangleAlert } from "lucide-react";
import { controlGate, readGateSensor } from "@/app/actions";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import QRCode from 'qrcode';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';


// This would come from settings in a real app
const entryGateConfig = {
    name: "Entry Gate",
    ip: "10.0.0.185",
    port: 5000,
    input: 1,
    output: 1,
}

type GateStatus = 'open' | 'closed' | 'moving' | 'obstacle' | 'error';
type ConnectionStatus = 'online' | 'offline' | 'checking';


const statusConfig: Record<GateStatus, { text: string; color: string; icon: React.ReactNode }> = {
  open: { text: 'Open', color: 'bg-green-500', icon: <ChevronUp className="size-4" /> },
  closed: { text: 'Closed', color: 'bg-red-500', icon: <ChevronDown className="size-4" /> },
  moving: { text: 'Moving...', color: 'bg-yellow-500', icon: <Loader2 className="size-4 animate-spin" /> },
  obstacle: { text: 'Obstacle!', color: 'bg-orange-500', icon: <TriangleAlert className="size-4" /> },
  error: { text: 'Error', color: 'bg-destructive', icon: <TriangleAlert className="size-4" /> },
};


export default function OperatorPage() {
    const { toast } = useToast();
    const [gateStatus, setGateStatus] = useState<GateStatus>('closed');
    const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('checking');
    const [carAtEntry, setCarAtEntry] = useState(false);
    const [isPolling, setIsPolling] = useState(true);
    const [generatedTicketId, setGeneratedTicketId] = useState<string | null>(null);
    const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);

    const pollFailures = useRef(0);
    const MAX_FAILURES = 3;

    useEffect(() => {
        let intervalId: NodeJS.Timeout | null = null;
    
        const pollSensor = async () => {
          if (pollFailures.current < MAX_FAILURES) {
            try {
              const response = await readGateSensor({ host: entryGateConfig.ip, port: entryGateConfig.port });
              if (response.success && response.data) {
                const isCarPresent = response.data[8 - entryGateConfig.input] === '1';
                setCarAtEntry(isCarPresent);
                setConnectionStatus('online');
                pollFailures.current = 0; 
                if (gateStatus === 'error') setGateStatus('closed');
              } else {
                 pollFailures.current++;
              }
            } catch (error) {
              pollFailures.current++;
            }
            if (pollFailures.current >= MAX_FAILURES) {
                setConnectionStatus('offline');
                if(gateStatus !== 'moving') setGateStatus('error');
            }
          }
        };
        
        if (isPolling) {
            pollSensor();
            intervalId = setInterval(pollSensor, 2000);
        } else {
            setConnectionStatus('checking');
            setCarAtEntry(false);
        }
        
        return () => {
            if (intervalId) clearInterval(intervalId);
        };
      }, [isPolling, gateStatus]);


    const handleIssueTicket = async () => {
        const ticketId = `TKT-${Date.now()}`;
        setGeneratedTicketId(ticketId);
        try {
            const url = await QRCode.toDataURL(ticketId, { width: 256 });
            setQrCodeUrl(url);
        } catch (err) {
            console.error("Failed to generate QR code:", err);
            setQrCodeUrl(null);
            toast({
                variant: 'destructive',
                title: 'QR Code Generation Failed',
            });
        }
    };

    const handleGateAction = async (action: 'open' | 'close') => {
        const previousStatus = gateStatus;
        setGateStatus('moving');
        
        const { success, message } = await controlGate({
            host: entryGateConfig.ip,
            port: entryGateConfig.port,
            output: entryGateConfig.output,
            action,
        });

        if (success) {
            toast({
                title: `${entryGateConfig.name} Action`,
                description: message,
            });
            setTimeout(() => {
                setGateStatus(action === 'open' ? 'open' : 'closed');
            }, 2000);
        } else {
            setGateStatus(previousStatus === 'moving' ? 'error' : previousStatus);
            toast({
                variant: 'destructive',
                title: "Gate Action Failed",
                description: message,
            });
        }
    };


    return (
        <div className="flex flex-col h-full">
            <Header title="Gate Operator" />
            <main className="flex-1 p-4 md:p-6 lg:p-8 flex items-center justify-center">
                <Card className="w-full max-w-md">
                    <CardHeader>
                        <div className="flex items-start justify-between">
                            <div>
                                <CardTitle>Entry Gate Control</CardTitle>
                                <CardDescription>Manual controls for the main entry gate.</CardDescription>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className={cn('flex items-center gap-2 text-sm font-medium px-2 py-1 rounded-full', 
                                    connectionStatus === 'online' ? 'bg-green-100 text-green-800' : 
                                    connectionStatus === 'offline' ? 'bg-destructive text-destructive-foreground' :
                                    'bg-gray-200 text-gray-600'
                                    )}>
                                    {connectionStatus === 'online' && <Wifi className="size-4" />}
                                    {connectionStatus === 'offline' && <WifiOff className="size-4" />}
                                    {connectionStatus === 'checking' && <Loader2 className="size-4 animate-spin" />}
                                    <span className="capitalize">{connectionStatus}</span>
                                </div>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex items-center space-x-2 rounded-lg border p-3 bg-muted/50">
                            <Label htmlFor="sensor-polling" className="flex-grow">Enable Sensor Polling</Label>
                            <Switch id="sensor-polling" checked={isPolling} onCheckedChange={setIsPolling} />
                        </div>
                        
                        <Separator />

                        <div className="flex flex-col items-center justify-center space-y-4">
                             <div className={cn('flex items-center gap-3 text-lg font-medium px-4 py-2 rounded-full', 
                                gateStatus === 'error' ? 'bg-destructive text-destructive-foreground' : 
                                carAtEntry ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-600'
                                )}>
                                    <Car className="size-6" />
                                    <span>{ gateStatus === 'error' ? 'Sensor Error' : carAtEntry ? 'Car Detected at Gate' : 'No Car Detected'}</span>
                            </div>

                             <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button className="w-full h-12 text-lg" disabled={!carAtEntry || gateStatus === 'error'} onClick={handleIssueTicket}>
                                    <Ticket className="mr-2 size-5" /> Issue Manual Ticket
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                    <AlertDialogTitle>Manual Ticket Issued</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        A new parking ticket has been generated. Provide this to the driver. The gate can now be opened.
                                    </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <div className="flex flex-col items-center justify-center gap-4 py-4">
                                        {qrCodeUrl ? <Image src={qrCodeUrl} alt="QR Code" width={200} height={200} /> : <Loader2 className="size-8 animate-spin" />}
                                        <div className="text-center">
                                            <p className="text-sm text-muted-foreground">Ticket ID</p>
                                            <p className="font-mono font-semibold text-lg">{generatedTicketId}</p>
                                        </div>
                                    </div>
                                    <AlertDialogFooter>
                                    <AlertDialogAction>Done</AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                        
                        <Separator />

                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <h3 className="font-semibold">Manual Override</h3>
                                <div className={cn('flex items-center gap-2 text-sm font-medium px-2 py-1 rounded-full text-white', statusConfig[gateStatus].color)}>
                                    {statusConfig[gateStatus].icon}
                                    <span>{statusConfig[gateStatus].text}</span>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <Button
                                    onClick={() => handleGateAction('open')}
                                    disabled={gateStatus === 'open' || gateStatus === 'moving' || gateStatus === 'error'}
                                    variant="outline"
                                >
                                    <ChevronUp className="mr-2 size-4" /> Open Gate
                                </Button>
                                <Button
                                    onClick={() => handleGateAction('close')}
                                    disabled={gateStatus === 'closed' || gateStatus === 'moving' || gateStatus === 'error'}
                                    variant="outline"
                                >
                                    <ChevronDown className="mr-2 size-4" /> Close Gate
                                </Button>
                            </div>
                        </div>

                    </CardContent>
                </Card>
            </main>
        </div>
    )
}
