'use client';
import { useState, useEffect, useRef } from 'react';
import { controlGate, readGateSensor } from '@/app/actions';
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  ArrowLeftRight,
  ChevronDown,
  ChevronUp,
  Ticket,
  QrCode,
  TriangleAlert,
  Loader2,
  Car,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
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

// This is a mock for settings until we fetch them from a persistent store
const gateSettings = {
    entryGateIp: "10.0.0.185",
    entryGatePort: 5000,
    entryGateInput: 1,
    entryGateOutput: 1,
    exitGateIp: "192.168.1.11",
    exitGatePort: 5000,
    exitGateInput: 2,
    exitGateOutput: 2,
};

type GateStatus = 'open' | 'closed' | 'moving' | 'obstacle' | 'error';

const statusConfig: Record<
  GateStatus,
  { text: string; color: string; icon: React.ReactNode }
> = {
  open: {
    text: 'Open',
    color: 'bg-green-500',
    icon: <ChevronUp className="size-4" />,
  },
  closed: {
    text: 'Closed',
    color: 'bg-red-500',
    icon: <ChevronDown className="size-4" />,
  },
  moving: {
    text: 'Moving...',
    color: 'bg-yellow-500',
    icon: <Loader2 className="size-4 animate-spin" />,
  },
  obstacle: {
    text: 'Obstacle!',
    color: 'bg-orange-500',
    icon: <TriangleAlert className="size-4" />,
  },
   error: {
    text: 'Error',
    color: 'bg-destructive',
    icon: <TriangleAlert className="size-4" />,
  },
};

export function GateControl() {
  const [entryGateStatus, setEntryGateStatus] = useState<GateStatus>('closed');
  const [exitGateStatus, setExitGateStatus] = useState<GateStatus>('closed');
  const [carAtEntry, setCarAtEntry] = useState(false);
  const [carAtExit, setCarAtExit] = useState(false);
  const [isPolling, setIsPolling] = useState(false);
  const { toast } = useToast();

  const pollFailures = useRef({ entry: 0, exit: 0 });
  const MAX_FAILURES = 3;

  const handleGateAction = async (
    gate: 'entry' | 'exit',
    action: 'open' | 'close'
  ) => {
    const setStatus = gate === 'entry' ? setEntryGateStatus : setExitGateStatus;
    const currentStatus = gate === 'entry' ? entryGateStatus : exitGateStatus;

    if (currentStatus === 'moving') return;

    const previousStatus = currentStatus;
    setStatus('moving');

    const settings = gate === 'entry' ? {
        host: gateSettings.entryGateIp,
        port: gateSettings.entryGatePort,
        output: gateSettings.entryGateOutput,
    } : {
        host: gateSettings.exitGateIp,
        port: gateSettings.exitGatePort,
        output: gateSettings.exitGateOutput,
    };
    
    const { success, message } = await controlGate({ ...settings, action });

    if (success) {
        // Simulate gate movement time
        setTimeout(() => {
             setStatus(action === 'open' ? 'open' : 'closed');
        }, 2000);
        toast({
            title: `Gate Action: ${gate}`,
            description: message,
        });
    } else {
        setStatus(previousStatus === 'moving' ? 'error' : previousStatus);
        toast({
            variant: 'destructive',
            title: `Gate Action Failed: ${gate}`,
            description: message,
        });
    }
  };

  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;

    const pollSensors = async () => {
      // Poll entry gate
      if (pollFailures.current.entry < MAX_FAILURES) {
        try {
          const entryResponse = await readGateSensor({ host: gateSettings.entryGateIp, port: gateSettings.entryGatePort });
          if (entryResponse.success && entryResponse.data) {
            const isCarPresent = entryResponse.data[gateSettings.entryGateInput - 1] === '1';
            setCarAtEntry(isCarPresent);
            pollFailures.current.entry = 0; // Reset on success
            if (entryGateStatus === 'error') setEntryGateStatus('closed'); // Recover from error state
          } else {
             console.error("Error polling entry gate sensor:", entryResponse.message);
             pollFailures.current.entry++;
          }
        } catch (error) {
          console.error("Error polling entry gate sensor:", error);
          pollFailures.current.entry++;
        }
        if (pollFailures.current.entry >= MAX_FAILURES) {
            console.error("Max polling failures reached for entry gate. Stopping polling for this gate.");
            if(entryGateStatus !== 'moving') setEntryGateStatus('error');
        }
      }
      
      // Poll exit gate
       if (pollFailures.current.exit < MAX_FAILURES) {
        try {
            const exitResponse = await readGateSensor({ host: gateSettings.exitGateIp, port: gateSettings.exitGatePort });
            if (exitResponse.success && exitResponse.data) {
                const isCarPresent = exitResponse.data[gateSettings.exitGateInput - 1] === '1';
                setCarAtExit(isCarPresent);
                pollFailures.current.exit = 0; // Reset on success
                if (exitGateStatus === 'error') setExitGateStatus('closed'); // Recover from error state
            } else {
                console.error("Error polling exit gate sensor:", exitResponse.message);
                pollFailures.current.exit++;
            }
        } catch (error) {
            console.error("Error polling exit gate sensor:", error);
            pollFailures.current.exit++;
        }
        if (pollFailures.current.exit >= MAX_FAILURES) {
            console.error("Max polling failures reached for exit gate. Stopping polling for this gate.");
            if(exitGateStatus !== 'moving') setExitGateStatus('error');
        }
       }
    };
    
    if (isPolling) {
        pollSensors(); // Run once immediately
        intervalId = setInterval(pollSensors, 2000); // Then poll every 2 seconds
    }
    
    return () => {
        if (intervalId) {
            clearInterval(intervalId);
        }
    };
  }, [isPolling, entryGateStatus, exitGateStatus]);


  const Gate = ({
    name,
    status,
    carDetected,
    onOpen,
    onClose,
  }: {
    name: 'Entry' | 'Exit';
    status: GateStatus;
    carDetected: boolean;
    onOpen: () => void;
    onClose: () => void;
  }) => {
    const config = statusConfig[status];
    const isEntry = name === 'Entry';
    const isSensorError = (name === 'Entry' && pollFailures.current.entry >= MAX_FAILURES) || (name === 'Exit' && pollFailures.current.exit >= MAX_FAILURES);

    return (
      <div className="rounded-lg border p-4 space-y-4 bg-background">
        <div className="flex justify-between items-center">
          <h3 className="font-semibold">{name} Gate</h3>
           <div className={cn(
               'flex items-center gap-2 text-sm font-medium px-2 py-1 rounded-full', 
               isSensorError ? 'bg-destructive text-destructive-foreground' : 
               carDetected ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-600'
            )}>
                <Car className="size-4" />
                <span>{ isSensorError ? 'Sensor Error' : carDetected ? 'Car Detected' : 'No Car'}</span>
            </div>
          <div
            className={cn(
              'flex items-center gap-2 text-sm font-medium px-2 py-1 rounded-full text-white',
              config.color
            )}
          >
            {config.icon}
            <span>{config.text}</span>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={onOpen}
            disabled={status === 'open' || status === 'moving' || status === 'error'}
            className="w-full"
            variant="outline"
          >
            <ChevronUp className="mr-2 size-4" /> Open
          </Button>
          <Button
            onClick={onClose}
            disabled={status === 'closed' || status === 'moving' || status === 'error'}
            className="w-full"
            variant="outline"
          >
            <ChevronDown className="mr-2 size-4" /> Close
          </Button>
        </div>
        <div className="flex gap-2">
          {isEntry ? (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button className="w-full" variant="secondary" disabled={!carDetected || status === 'error'}>
                  <Ticket className="mr-2 size-4" /> Issue Ticket
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Ticket Issued</AlertDialogTitle>
                  <AlertDialogDescription>
                    A new parking ticket has been printed. The gate will open shortly.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogAction>OK</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          ) : (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button className="w-full" variant="secondary" disabled={status === 'error'}>
                  <QrCode className="mr-2 size-4" /> Scan Ticket
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Scan Result</AlertDialogTitle>
                  <AlertDialogDescription>
                    Ticket validated. Payment of $8.50 confirmed. The gate will open.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogAction>OK</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>
    );
  };

  return (
    <Card>
       <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>Manual Gate Control</CardTitle>
            <CardDescription>Manually open or close entry and exit gates.</CardDescription>
          </div>
          <ArrowLeftRight className="h-8 w-8 text-primary" />
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center space-x-2 rounded-lg border p-3 bg-muted/50">
          <Label htmlFor="sensor-polling">Enable Sensor Polling</Label>
          <Switch id="sensor-polling" checked={isPolling} onCheckedChange={setIsPolling} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Gate
                name="Entry"
                status={entryGateStatus}
                carDetected={carAtEntry}
                onOpen={() => handleGateAction('entry', 'open')}
                onClose={() => handleGateAction('entry', 'close')}
                />
            <Gate
                name="Exit"
                status={exitGateStatus}
                carDetected={carAtExit}
                onOpen={() => handleGateAction('exit', 'open')}
                onClose={() => handleGateAction('exit', 'close')}
                />
        </div>
      </CardContent>
    </Card>
  );
}
