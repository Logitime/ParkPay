
'use client';

import { useState, useEffect, useRef } from 'react';
import { useToast } from "@/hooks/use-toast";
import { controlGate, readGateSensor, saveSnapshot } from "@/app/actions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Ticket, Car, CheckCircle, MonitorSpeaker, Wifi, WifiOff, Loader2, ChevronUp, ChevronDown, TriangleAlert, QrCode } from "lucide-react";
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
import { CameraFeed } from '@/components/dashboard/CameraFeed';
import { useTranslations } from 'next-intl';

type GateStatus = 'open' | 'closed' | 'moving' | 'obstacle' | 'error';
type ConnectionStatus = 'online' | 'offline' | 'checking';

type GateConfig = {
    id: number;
    name: string;
    ip: string;
    port: number;
    input: number;
    output: number;
    cameraUrl: string;
}

const statusConfig: Record<GateStatus, { text: string; color: string; icon: React.ReactNode }> = {
  open: { text: 'Open', color: 'bg-green-500', icon: <ChevronUp className="size-4" /> },
  closed: { text: 'Closed', color: 'bg-red-500', icon: <ChevronDown className="size-4" /> },
  moving: { text: 'Moving...', color: 'bg-yellow-500', icon: <Loader2 className="size-4 animate-spin" /> },
  obstacle: { text: 'Obstacle!', color: 'bg-orange-500', icon: <TriangleAlert className="size-4" /> },
  error: { text: 'Error', color: 'bg-destructive', icon: <TriangleAlert className="size-4" /> },
};


export function GateControl({ gateConfig, isPolling }: { gateConfig: GateConfig, isPolling: boolean}) {
    const t = useTranslations('Gates');
    const { toast } = useToast();
    const [gateStatus, setGateStatus] = useState<GateStatus>('closed');
    const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('checking');
    const [carAtSensor, setCarAtSensor] = useState(false);
    const [generatedTicketId, setGeneratedTicketId] = useState<string | null>(null);
    const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
    const [captureTrigger, setCaptureTrigger] = useState(0);

    const pollFailures = useRef(0);
    const MAX_FAILURES = 3;
    const prevCarAtSensor = useRef(false);

    const isEntryGate = gateConfig.name.toLowerCase().includes('entry');

    // Auto-capture logic
    useEffect(() => {
        if (isEntryGate && carAtSensor && !prevCarAtSensor.current) {
            handleIssueTicketAndCapture();
        } else if (!isEntryGate && carAtSensor && !prevCarAtSensor.current) {
            // For exit gates, just trigger capture, no ticket needed
            setCaptureTrigger(Date.now());
        }
        prevCarAtSensor.current = carAtSensor;
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [carAtSensor, isEntryGate]);

    // Sensor polling logic
    useEffect(() => {
        let intervalId: NodeJS.Timeout | null = null;
    
        const pollSensor = async () => {
          if (pollFailures.current < MAX_FAILURES) {
            try {
              const response = await readGateSensor({ host: gateConfig.ip, port: gateConfig.port });
              if (response.success && response.data) {
                const isCarPresent = response.data[8 - gateConfig.input] === '1';
                setCarAtSensor(isCarPresent);
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
            setConnectionStatus('checking');
            pollSensor();
            intervalId = setInterval(pollSensor, 2000);
        } else {
            setConnectionStatus('checking');
            setCarAtSensor(false);
            pollFailures.current = 0;
            if (intervalId) clearInterval(intervalId);
        }
        
        return () => {
            if (intervalId) clearInterval(intervalId);
        };
      }, [isPolling, gateStatus, gateConfig]);


    const handleIssueTicketAndCapture = async (isManual = false) => {
        const ticketId = `TKT-${Date.now()}`;
        setGeneratedTicketId(ticketId);
        setCaptureTrigger(Date.now()); // Trigger capture
        
        try {
            const url = await QRCode.toDataURL(ticketId, { width: 256 });
            setQrCodeUrl(url);
        } catch (err) {
            console.error("Failed to generate QR code:", err);
            setQrCodeUrl(null);
            if(isManual) {
                toast({
                    variant: 'destructive',
                    title: 'QR Code Generation Failed',
                });
            }
        }
    };

    const handleGateAction = async (action: 'open' | 'close') => {
        const previousStatus = gateStatus;
        setGateStatus('moving');
        
        const { success, message } = await controlGate({
            host: gateConfig.ip,
            port: gateConfig.port,
            output: gateConfig.output,
            action,
        });

        if (success) {
            toast({
                title: `${gateConfig.name} Action`,
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
    
    const currentStatusConfig = statusConfig[gateStatus];


    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card>
                <CardHeader>
                    <div className="flex items-start justify-between">
                        <div>
                            <CardTitle>{t('controlsTitle', {name: gateConfig.name})}</CardTitle>
                            <CardDescription>{t('controlsDescription')}</CardDescription>
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
                    <div className="flex flex-col items-center justify-center space-y-4">
                         <div className={cn('flex items-center gap-3 text-lg font-medium px-4 py-2 rounded-full', 
                            gateStatus === 'error' ? 'bg-destructive text-destructive-foreground' : 
                            carAtSensor ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-600'
                            )}>
                                <Car className="size-6" />
                                <span>{ gateStatus === 'error' ? t('sensorError') : carAtSensor ? t('carDetected') : t('noCarDetected')}</span>
                        </div>

                         {isEntryGate ? (
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button className="w-full h-12 text-lg" disabled={!carAtSensor || gateStatus === 'error'} onClick={() => handleIssueTicketAndCapture(true)}>
                                    <Ticket className="mr-2 size-5" /> {t('issueManualTicket')}
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
                                        <AlertDialogAction onClick={() => handleGateAction('open')}>{t('openGate')}</AlertDialogAction>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        ) : (
                             <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button className="w-full h-12 text-lg" variant="secondary" disabled={gateStatus === 'error'}>
                                        <QrCode className="mr-2 size-5" /> {t('scanExitTicket')}
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                    <AlertDialogTitle>{t('scanResultTitle')}</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        {t('scanResultDescription')}
                                    </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogAction onClick={() => handleGateAction('open')}>{t('openGate')}</AlertDialogAction>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        )}
                    </div>
                    
                    <Separator />

                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="font-semibold">{t('manualOverride')}</h3>
                            <div className={cn('flex items-center gap-2 text-sm font-medium px-2 py-1 rounded-full text-white', currentStatusConfig.color)}>
                                {currentStatusConfig.icon}
                                <span>{t(`status.${gateStatus}` as any)}</span>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <Button
                                onClick={() => handleGateAction('open')}
                                disabled={gateStatus === 'open' || gateStatus === 'moving' || gateStatus === 'error'}
                                variant="outline"
                            >
                                <ChevronUp className="mr-2 size-4" /> {t('openGate')}
                            </Button>
                            <Button
                                onClick={() => handleGateAction('close')}
                                disabled={gateStatus === 'closed' || gateStatus === 'moving' || gateStatus === 'error'}
                                variant="outline"
                            >
                                <ChevronDown className="mr-2 size-4" /> {t('closeGate')}
                            </Button>
                        </div>
                    </div>

                </CardContent>
            </Card>
            <CameraFeed gateName={gateConfig.name} captureTrigger={captureTrigger} imageFileName={generatedTicketId} />
        </div>
    )
}
