'use client';
import { useState } from 'react';
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

type GateStatus = 'open' | 'closed' | 'moving' | 'obstacle';

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
    color: 'bg-destructive',
    icon: <TriangleAlert className="size-4" />,
  },
};

export function GateControl() {
  const [entryGateStatus, setEntryGateStatus] = useState<GateStatus>('closed');
  const [exitGateStatus, setExitGateStatus] = useState<GateStatus>('closed');
  const [obstacle, setObstacle] = useState(false);

  const handleGateAction = (
    gate: 'entry' | 'exit',
    action: 'open' | 'close'
  ) => {
    const setStatus = gate === 'entry' ? setEntryGateStatus : setExitGateStatus;
    const currentStatus = gate === 'entry' ? entryGateStatus : exitGateStatus;

    if (currentStatus === 'moving' || currentStatus === 'obstacle') return;

    setStatus('moving');
    setTimeout(() => {
      if (obstacle) {
        setStatus('obstacle');
      } else {
        setStatus(action === 'open' ? 'open' : 'closed');
      }
    }, 1500);
  };
  
  const handleObstacleToggle = (checked: boolean) => {
    setObstacle(checked);
    if(checked) {
      if(entryGateStatus === 'moving') setEntryGateStatus('obstacle');
      if(exitGateStatus === 'moving') setExitGateStatus('obstacle');
    } else {
      if(entryGateStatus === 'obstacle') setEntryGateStatus('closed');
      if(exitGateStatus === 'obstacle') setExitGateStatus('closed');
    }
  }

  const Gate = ({
    name,
    status,
    onOpen,
    onClose,
  }: {
    name: 'Entry' | 'Exit';
    status: GateStatus;
    onOpen: () => void;
    onClose: () => void;
  }) => {
    const config = statusConfig[status];
    const isEntry = name === 'Entry';

    return (
      <div className="rounded-lg border p-4 space-y-4 bg-background">
        <div className="flex justify-between items-center">
          <h3 className="font-semibold">{name} Gate</h3>
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
            disabled={status === 'open' || status === 'moving' || status === 'obstacle'}
            className="w-full"
            variant="outline"
          >
            <ChevronUp className="mr-2 size-4" /> Open
          </Button>
          <Button
            onClick={onClose}
            disabled={status === 'closed' || status === 'moving' || status === 'obstacle'}
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
                <Button className="w-full" variant="secondary">
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
                <Button className="w-full" variant="secondary">
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
          <TriangleAlert className="size-5 text-destructive" />
          <Label htmlFor="obstacle-mode">Simulate Obstacle</Label>
          <Switch id="obstacle-mode" checked={obstacle} onCheckedChange={handleObstacleToggle} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Gate
                name="Entry"
                status={obstacle && (entryGateStatus === 'moving' || entryGateStatus === 'obstacle') ? 'obstacle' : entryGateStatus}
                onOpen={() => handleGateAction('entry', 'open')}
                onClose={() => handleGateAction('entry', 'close')}
                />
            <Gate
                name="Exit"
                status={obstacle && (exitGateStatus === 'moving' || exitGateStatus === 'obstacle') ? 'obstacle' : exitGateStatus}
                onOpen={() => handleGateAction('exit', 'open')}
                onClose={() => handleGateAction('exit', 'close')}
                />
        </div>
      </CardContent>
    </Card>
  );
}
