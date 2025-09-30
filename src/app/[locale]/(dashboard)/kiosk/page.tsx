

'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Ticket, Car, ParkingCircle, HandCoins, User, Calendar, Smile, Loader2, DoorOpen, Clock, UserCircle } from 'lucide-react';
import Image from 'next/image';
import QRCode from 'qrcode';
import { cn } from '@/lib/utils';
import { mockParkers } from '@/lib/mock-data';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTranslations } from 'next-intl';


type KioskMode = 'entry' | 'exit';
type EntryState = 'idle' | 'car_present' | 'issuing_ticket' | 'ticket_issued';
type ExitState = 'idle' | 'scanning' | 'visitor_payment' | 'parker_info' | 'goodbye';

const visitorTicket = {
    id: `TKT-${Date.now()}`,
    entryTime: new Date(new Date().getTime() - 2.5 * 60 * 60 * 1000), // 2.5 hours ago
    plate: 'VIS-1234',
    type: 'visitor',
};

const parkerInfo = mockParkers.find(p => p.type === 'tenant');

type GeneratedTicket = {
    id: string;
    gateName: string;
    entryTime: Date;
    operatorName: string;
};

export default function KioskPage() {
    const t = useTranslations('Kiosk');
    const [mode, setMode] = useState<KioskMode>('entry');
    const [entryState, setEntryState] = useState<EntryState>('idle');
    const [exitState, setExitState] = useState<ExitState>('idle');
    const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
    const [generatedTicket, setGeneratedTicket] = useState<GeneratedTicket | null>(null);
    const [progress, setProgress] = useState(0);

    // Simulate sensor and state changes
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (mode === 'entry') {
            const sequence: EntryState[] = ['idle', 'car_present', 'car_present', 'car_present'];
            let i = 0;
            interval = setInterval(() => {
                setEntryState(sequence[i]);
                 if(i === 0) setGeneratedTicket(null); // Reset ticket when going back to idle
                i = (i + 1) % sequence.length;
            }, 3000);
        } else {
            const sequence: ExitState[] = ['idle', 'scanning', 'visitor_payment', 'parker_info', 'goodbye'];
             let i = 0;
            interval = setInterval(() => {
                setExitState(sequence[i]);
                 if(sequence[i] === 'scanning') {
                     setProgress(0);
                 }
                i = (i + 1) % sequence.length;
            }, 5000);
        }
        return () => clearInterval(interval);
    }, [mode]);

    // Progress bar for scanning simulation
     useEffect(() => {
        if (exitState === 'scanning' && progress < 100) {
            const timer = setTimeout(() => setProgress(progress + 20), 500);
            return () => clearTimeout(timer);
        }
    }, [exitState, progress]);

    const handleIssueTicket = async () => {
        setEntryState('issuing_ticket');
        const newTicket: GeneratedTicket = {
            id: `TKT-${Date.now()}`,
            gateName: "Entry Gate 1",
            entryTime: new Date(),
            operatorName: "Kiosk System"
        };
        
        setGeneratedTicket(newTicket);
        
        try {
            const url = await QRCode.toDataURL(newTicket.id, { width: 256 });
            setQrCodeUrl(url);
            setTimeout(() => setEntryState('ticket_issued'), 2000);
        } catch (err) {
            console.error(err);
            setEntryState('car_present'); // Go back to previous state on error
        }
    };

    const renderEntryScreen = () => {
        switch (entryState) {
            case 'car_present':
                return (
                    <div className="text-center">
                        <h2 className="text-5xl font-bold mb-8">{t('welcome')}</h2>
                        <Button 
                            className="w-full h-32 text-2xl bg-green-500 hover:bg-green-600 text-white animate-blink"
                            onClick={handleIssueTicket}
                        >
                            <Ticket className="mr-4 size-10" /> {t('issueTicket')}
                        </Button>
                    </div>
                );
            case 'issuing_ticket':
                return (
                     <div className="text-center flex flex-col items-center">
                        <Loader2 className="size-16 animate-spin text-primary mb-4" />
                        <h2 className="text-3xl font-semibold">{t('printingTicket')}</h2>
                        <p className="text-muted-foreground">{t('pleaseWait')}</p>
                    </div>
                );
            case 'ticket_issued':
                if (!generatedTicket) return null;
                return (
                    <div className="text-center">
                        <h2 className="text-3xl font-bold mb-4">{t('welcomeToParkPay')}</h2>
                        <p className="text-lg mb-4">{t('takeTicket')}</p>
                        
                        <Card className="text-left p-4 bg-gray-50 dark:bg-gray-800">
                             {qrCodeUrl && <Image src={qrCodeUrl} alt="QR Code" width={128} height={128} className="mx-auto my-2" />}
                             <p className="font-mono text-center text-lg mb-4">{generatedTicket.id}</p>
                            <Separator/>
                            <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-4 text-sm">
                                <div className="flex items-center gap-2"><DoorOpen className="size-4 text-muted-foreground" /> <span>{generatedTicket.gateName}</span></div>
                                <div className="flex items-center gap-2"><UserCircle className="size-4 text-muted-foreground" /> <span>{generatedTicket.operatorName}</span></div>
                                <div className="flex items-center gap-2 col-span-2"><Clock className="size-4 text-muted-foreground" /> <span>{generatedTicket.entryTime.toLocaleString()}</span></div>
                            </div>
                        </Card>
                         
                        <Card className="mt-4 bg-blue-50 border-blue-200">
                            <CardContent className="p-4 text-blue-800">
                                <p className="font-semibold text-sm">{t('note')}</p>
                                <p className="text-xs mt-1">{t('keepTicket')}</p>
                            </CardContent>
                        </Card>
                    </div>
                );
            case 'idle':
            default:
                return (
                    <div className="text-center">
                        <ParkingCircle className="size-24 mx-auto text-muted-foreground/30 mb-4" />
                        <h2 className="text-3xl text-muted-foreground/50">{t('driveForward')}</h2>
                    </div>
                );
        }
    };
    
    const renderExitScreen = () => {
        switch(exitState) {
            case 'scanning':
                return (
                    <div className="text-center">
                        <h2 className="text-4xl font-bold mb-6">{t('scanTicket')}</h2>
                        <p className="text-lg text-muted-foreground mb-8">{t('scanDescription')}</p>
                        <Progress value={progress} className="w-full h-4" />
                    </div>
                );
            case 'visitor_payment':
                return (
                    <div className="grid md:grid-cols-2 gap-8 items-center">
                        <div className="text-center md:text-left">
                            <h2 className="text-3xl font-semibold mb-2">{t('feeDue')}</h2>
                            <p className="text-8xl font-bold text-primary mb-6">$13.50</p>
                            <div className="grid grid-cols-2 gap-4 text-left">
                                <div className="flex items-center gap-2"><Car className="size-5 text-muted-foreground" /> <span>{visitorTicket.plate}</span></div>
                                <div className="flex items-center gap-2"><Calendar className="size-5 text-muted-foreground" /> <span>Duration: 2h 30m</span></div>
                            </div>
                            <Card className="mt-6 bg-yellow-50 border-yellow-200">
                                <CardContent className="p-4">
                                    <p className="font-semibold text-yellow-800">{t('paymentInstruction')}</p>
                                </CardContent>
                            </Card>
                        </div>
                         <div className="flex flex-col gap-2">
                             <p className="text-sm font-medium text-center md:text-left">Entry Snapshot</p>
                            <div className="aspect-video w-full bg-muted rounded-md overflow-hidden relative">
                                <Image
                                    src={`https://picsum.photos/seed/${visitorTicket.id}/600/400`}
                                    alt="Vehicle at entry"
                                    layout="fill"
                                    objectFit="cover"
                                    data-ai-hint="vehicle entry"
                                />
                            </div>
                        </div>
                    </div>
                );
            case 'parker_info':
                 if (!parkerInfo) return null;
                return (
                     <div className="text-center">
                        <h2 className="text-3xl font-semibold mb-4">{t('welcomeBack', {name: parkerInfo.name})}</h2>
                         <div className="grid grid-cols-2 gap-6 my-8">
                             <div className="p-4 rounded-lg bg-muted">
                                <p className="text-sm text-muted-foreground">{t('participation')}</p>
                                <p className="text-2xl font-bold capitalize">{parkerInfo.participation}</p>
                            </div>
                            <div className="p-4 rounded-lg bg-muted">
                                <p className="text-sm text-muted-foreground">{t('nextPaymentDue')}</p>
                                <p className="text-2xl font-bold">Aug 15, 2024</p>
                            </div>
                         </div>
                         <Card className="bg-green-50 border-green-200">
                            <CardContent className="p-4">
                                <p className="font-semibold text-green-800">{t('goodStanding')}</p>
                            </CardContent>
                        </Card>
                    </div>
                );
            case 'goodbye':
                return (
                    <div className="text-center flex flex-col items-center">
                        <Smile className="size-20 text-primary mb-4" />
                        <h2 className="text-5xl font-bold mb-2">{t('thankYou')}</h2>
                        <p className="text-2xl text-muted-foreground">{t('driveSafely')}</p>
                    </div>
                );
            case 'idle':
            default:
                 return (
                    <div className="text-center">
                        <ParkingCircle className="size-24 mx-auto text-muted-foreground/30 mb-4" />
                        <h2 className="text-3xl text-muted-foreground/50">{t('welcomeToExit')}</h2>
                    </div>
                );
        }
    };


    return (
        <div className="flex flex-col h-screen bg-gray-100 dark:bg-gray-900">
             <header className="bg-white dark:bg-gray-800 shadow-md p-4 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <ParkingCircle className="size-8 text-primary" />
                    <h1 className="text-2xl font-bold font-headline">{t('title')}</h1>
                </div>
                <div className="w-48">
                    <Select value={mode} onValueChange={(v) => setMode(v as KioskMode)}>
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="entry">{t('entryDisplay')}</SelectItem>
                            <SelectItem value="exit">{t('exitDisplay')}</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </header>
            <main className="flex-1 flex items-center justify-center p-8">
                <Card className="w-full max-w-4xl min-h-[500px]">
                    <CardContent className="p-12 flex items-center justify-center h-full">
                       {mode === 'entry' ? renderEntryScreen() : renderExitScreen()}
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}
