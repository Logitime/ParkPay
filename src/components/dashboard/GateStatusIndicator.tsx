'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Wifi, WifiOff, Car, Loader2, TriangleAlert } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { readGateSensor } from '@/app/actions';
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

// Mock settings until they are fetched from a persistent store
const gateSettings = {
    entryGateIp: "10.0.0.185",
    entryGatePort: 5000,
    exitGateIp: "192.168.1.11",
    exitGatePort: 5000,
};

type ConnectionStatus = 'online' | 'offline' | 'checking';

export function GateStatusIndicator() {
    const t = useTranslations('Dashboard');
    const [entryStatus, setEntryStatus] = useState<ConnectionStatus>('checking');
    const [exitStatus, setExitStatus] = useState<ConnectionStatus>('checking');
    
    const pollFailures = useRef({ entry: 0, exit: 0 });
    const MAX_FAILURES = 3;
    
    const statusConfig: Record<ConnectionStatus, { text: string; icon: React.ReactNode; color: string }> = {
      online: { text: t('online'), icon: <Wifi className="size-5" />, color: 'text-green-500' },
      offline: { text: t('offline'), icon: <WifiOff className="size-5" />, color: 'text-destructive' },
      checking: { text: t('checking'), icon: <Loader2 className="size-5 animate-spin" />, color: 'text-muted-foreground' },
    };

    useEffect(() => {
        const pollSensors = async () => {
            // Poll entry gate
            try {
                const entryResponse = await readGateSensor({ host: gateSettings.entryGateIp, port: gateSettings.entryGatePort });
                if (entryResponse.success) {
                    setEntryStatus('online');
                    pollFailures.current.entry = 0;
                } else {
                    pollFailures.current.entry++;
                }
            } catch (error) {
                pollFailures.current.entry++;
            }
            if (pollFailures.current.entry >= MAX_FAILURES) {
                setEntryStatus('offline');
            }

            // Poll exit gate
            try {
                const exitResponse = await readGateSensor({ host: gateSettings.exitGateIp, port: gateSettings.exitGatePort });
                if (exitResponse.success) {
                    setExitStatus('online');
                    pollFailures.current.exit = 0;
                } else {
                    pollFailures.current.exit++;
                }
            } catch (error) {
                pollFailures.current.exit++;
            }
            if (pollFailures.current.exit >= MAX_FAILURES) {
                setExitStatus('offline');
            }
        };

        pollSensors(); // Initial check
        const intervalId = setInterval(pollSensors, 5000); // Poll every 5 seconds

        return () => clearInterval(intervalId);
    }, []);


    const GateConnection = ({ name, status }: { name: string, status: ConnectionStatus }) => {
        const config = statusConfig[status];
        return (
            <div className="flex items-center justify-between rounded-lg border p-4 bg-muted/50">
                <div className="flex items-center gap-3">
                    <Car className="size-6 text-muted-foreground" />
                    <span className="font-semibold">{name}</span>
                </div>
                <div className={cn('flex items-center gap-2 text-sm font-medium', config.color)}>
                    {config.icon}
                    <span className="font-bold">{config.text}</span>
                </div>
            </div>
        );
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex items-start justify-between">
                    <div>
                        <CardTitle>{t('gateConnections')}</CardTitle>
                        <CardDescription>{t('gateConnectionsDescription')}</CardDescription>
                    </div>
                     <Wifi className="h-8 w-8 text-primary" />
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-4">
                    <GateConnection name={t('entryGate')} status={entryStatus} />
                    <GateConnection name={t('exitGate')} status={exitStatus} />
                </div>
            </CardContent>
        </Card>
    )
}
