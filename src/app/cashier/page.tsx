
'use client';

import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Clock, DollarSign, QrCode, Ticket, Car, CheckCircle, MonitorSpeaker } from "lucide-react";
import { controlGate, sendParkerNotification } from "@/app/actions";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
import { mockGates, mockCashiers, initialMockTickets, initialMockTransactions, mockParkers } from "@/lib/mock-data";


// In a real app, this tariff configuration would be fetched from a database via an API call
// For now, we simulate it based on the settings page mock data.
const tariffConfig = {
    firstHour: 5,
    hours2to4: 4,
    hours5to8: 3,
    after8Hours: 2,
    lostTicket: 50,
    freeParkingTypes: ['vip', 'staff', 'owner']
};


const calculateFee = (durationMinutes: number, parkerType?: string, isLostTicket = false) => {
    if (isLostTicket) {
        return tariffConfig.lostTicket;
    }

    if (parkerType && tariffConfig.freeParkingTypes.includes(parkerType)) {
        return 0.00;
    }
    
    if (durationMinutes <= 0) return 0;

    let fee = 0;
    const hours = Math.ceil(durationMinutes / 60);

    if (hours <= 1) {
        fee = tariffConfig.firstHour;
    } else if (hours <= 4) {
        fee = tariffConfig.firstHour + (hours - 1) * tariffConfig.hours2to4;
    } else if (hours <= 8) {
        fee = tariffConfig.firstHour + (3 * tariffConfig.hours2to4) + (hours - 4) * tariffConfig.hours5to8;
    } else { 
        fee = tariffConfig.firstHour + (3 * tariffConfig.hours2to4) + (4 * tariffConfig.hours5to8) + (hours - 8) * tariffConfig.after8Hours;
    }
    
    // Ensure the fee is calculated correctly for the edge case of exactly 1 hour.
    if (durationMinutes > 0 && durationMinutes <= 60) {
        return tariffConfig.firstHour;
    }

    return fee;
}


export default function CashierPage() {
    const { toast } = useToast();
    const [ticketId, setTicketId] = useState("");
    const [activeTicket, setActiveTicket] = useState<any>(null);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [duration, setDuration] = useState({ hours: 0, minutes: 0 });
    const [fee, setFee] = useState(0);
    const [paymentProcessed, setPaymentProcessed] = useState(false);
    const [activeCashierId, setActiveCashierId] = useState<string | undefined>(mockCashiers[0].id.toString());
    const [tickets, setTickets] = useState(initialMockTickets);
    const [transactions, setTransactions] = useState(initialMockTransactions);


    const activeCashier = activeCashierId ? mockCashiers.find(c => c.id === parseInt(activeCashierId, 10)) : null;
    const assignedGate = activeCashier?.assignedGateId ? mockGates.find(g => g.id === activeCashier.assignedGateId) : null;
    
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        if (activeTicket) {
            const isLost = activeTicket.id === 'LOST TICKET';
            let totalMinutes = 0;
            if (!isLost) {
                const diff = currentTime.getTime() - activeTicket.entryTime.getTime();
                totalMinutes = Math.max(0, Math.floor(diff / (1000 * 60)));
            }
            const hours = Math.floor(totalMinutes / 60);
            const minutes = totalMinutes % 60;
            setDuration({ hours, minutes });
            setFee(calculateFee(totalMinutes, activeTicket.type, isLost));
        }
    }, [currentTime, activeTicket]);

    const handleFindTicket = () => {
        setPaymentProcessed(false);
        setActiveTicket(null);

        if (ticketId.toLowerCase() === 'lost') {
             const lostTicket = { id: "LOST TICKET", entryTime: new Date(), plate: "N/A", status: "Lost" };
            setActiveTicket(lostTicket);
             toast({
                variant: "destructive",
                title: "Lost Ticket",
                description: `Applying lost ticket fee of $${tariffConfig.lostTicket.toFixed(2)}.`,
            });
            return;
        }

        // Check registered parkers first (by license plate or access ID)
        const foundParker = mockParkers.find(p => p.plate.toLowerCase() === ticketId.toLowerCase() || p.accessId.toLowerCase() === ticketId.toLowerCase());
        if (foundParker) {
             const parkerTicket = {
                id: foundParker.accessId,
                entryTime: new Date(new Date().getTime() - 2.5 * 60 * 60 * 1000), // Mock entry time for demonstration
                plate: foundParker.plate,
                status: "In-Park",
                type: foundParker.type,
                name: foundParker.name,
                email: foundParker.email,
                participation: foundParker.participation,
            };
            setActiveTicket(parkerTicket);
            toast({
                title: `Registered Parker Found`,
                description: `Displaying details for ${foundParker.name}.`,
            });
            return;
        }

        // Then check temporary tickets
        const foundTicket = tickets.find(t => t.id.toLowerCase() === ticketId.toLowerCase());
        if (foundTicket) {
            setActiveTicket(foundTicket);
            toast({
                title: "Ticket Found",
                description: `Displaying details for ticket ${foundTicket.id}.`,
            });
        } else {
            toast({
                variant: "destructive",
                title: "Ticket or Parker Not Found",
                description: "No active ticket or registered parker found with that ID/Plate.",
            });
        }
    };
    
    const handleProcessPayment = () => {
        if (!activeTicket) return;
        
        const newTransaction = {
            ticketId: activeTicket.id,
            plate: activeTicket.plate,
            exit: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            status: "Paid",
            amount: fee,
        };

        setTransactions([newTransaction, ...transactions]);
        setPaymentProcessed(true);

        toast({
            title: "Payment Confirmed",
            description: `Payment of $${fee.toFixed(2)} received for ticket ${activeTicket.id}.`,
            className: "bg-green-100 text-green-800"
        });
    }

    const handleAutomatedNotification = async (parker: any) => {
        // Simulate checking if a parker's balance has reached a threshold
        // In a real app, you would fetch their actual balance.
        // Here, we'll trigger it for any 'monthly' or 'yearly' parker upon exit.
        if (parker.participation === 'monthly' || parker.participation === 'yearly') {
            
            const totalDue = parker.participation === 'monthly' ? 150 : 1800;
            const currentBalance = totalDue * 0.85; // Simulate being over 80%

            if (currentBalance / totalDue >= 0.8) {
                toast({
                    title: "Automated Notification Sent",
                    description: `Sending a balance reminder to ${parker.name}.`,
                });

                await sendParkerNotification({
                    name: parker.name,
                    participation: parker.participation,
                    balance: currentBalance,
                    dueDate: new Date(new Date().setDate(new Date().getDate() + 15)).toISOString().split('T')[0],
                });
            }
        }
    };

    const handleOpenGate = async () => {
        if (!activeCashier) {
             toast({ variant: "destructive", title: "No Cashier Selected", description: "Please select a cashier station." });
             return;
        }
        if (!assignedGate) {
             toast({ variant: "destructive", title: "No Gate Assigned", description: `Cashier ${activeCashier.name} is not assigned to an exit gate.` });
             return;
        }
        if (!paymentProcessed && fee > 0) {
            toast({ variant: "destructive", title: "Payment Required", description: "Payment must be processed before opening the gate." });
            return;
        }

        const gateToOpen = {
            host: assignedGate.ip,
            port: parseInt(assignedGate.port, 10),
            output: parseInt(assignedGate.output, 10),
        }

        const { success, message } = await controlGate({ ...gateToOpen, action: 'open' });
        
        if (success) {
            toast({
                title: `Opening ${assignedGate.name}`,
                description: "Exit gate opening command sent.",
            });

            // Check if we need to send an automated notification for registered parkers
            if (activeTicket && activeTicket.type !== 'visitor') {
                 handleAutomatedNotification(activeTicket);
            }

            // Reset after successful exit
            setTimeout(() => {
                // Remove the ticket from the active list
                if(activeTicket && activeTicket.id !== 'LOST TICKET') {
                    setTickets(tickets.filter(t => t.id !== activeTicket.id));
                }
                setActiveTicket(null);
                setTicketId("");
                setPaymentProcessed(false);
            }, 3000);
        } else {
             toast({
                variant: "destructive",
                title: "Gate Action Failed",
                description: message,
            });
        }
    }

    const getParkerBadge = (type?: string) => {
        if (!type) return null;

        const parkerType = type.charAt(0).toUpperCase() + type.slice(1);
        if (tariffConfig.freeParkingTypes.includes(type)) {
            return <Badge className="w-fit bg-green-100 text-green-800">{parkerType} (No Fee)</Badge>;
        }
        return <Badge className="w-fit">{parkerType} Parker</Badge>;
    };

    return (
        <div className="flex flex-col h-full">
            <Header title="Cashier Station" />
            <main className="flex-1 p-4 md:p-6 lg:p-8 grid gap-8 md:grid-cols-3">
                <div className="md:col-span-2">
                    <Card>
                        <CardHeader>
                            <div className="flex items-start justify-between">
                                <div>
                                    <CardTitle>Exit Processing</CardTitle>
                                    <CardDescription>Scan ticket, calculate fees, and process payment.</CardDescription>
                                </div>
                                <div className="flex items-center gap-4">
                                     <div className="w-[200px]">
                                        <Select value={activeCashierId} onValueChange={setActiveCashierId}>
                                            <SelectTrigger>
                                                <div className="flex items-center gap-2">
                                                    <MonitorSpeaker className="size-4 text-muted-foreground" />
                                                    <SelectValue placeholder="Select Station" />
                                                </div>
                                            </SelectTrigger>
                                            <SelectContent>
                                                {mockCashiers.filter(c => c.role === 'cashier').map(c => (
                                                    <SelectItem key={c.id} value={c.id.toString()}>{c.name}'s Station</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {assignedGate && <p className="text-xs text-muted-foreground mt-1">Controls: <span className="font-semibold">{assignedGate.name}</span></p>}
                                    </div>
                                    <QrCode className="h-8 w-8 text-primary" />
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex w-full max-w-sm items-center space-x-2">
                                <Input 
                                    type="text" 
                                    placeholder="Ticket ID, Plate, Access ID or 'lost'" 
                                    value={ticketId} 
                                    onChange={(e) => setTicketId(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleFindTicket()}
                                />
                                <Button onClick={handleFindTicket}>Find Ticket</Button>
                            </div>
                            
                            <Separator />
                            
                            {activeTicket ? (
                                <div className="grid gap-6">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                                        <div className="flex items-center gap-2">
                                            <Ticket className="size-5 text-muted-foreground" />
                                            <div>
                                                <p className="text-muted-foreground">Ticket ID</p>
                                                <p className="font-semibold">{activeTicket.id}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Car className="size-5 text-muted-foreground" />
                                            <div>
                                                <p className="text-muted-foreground">License Plate</p>
                                                <p className="font-semibold">{activeTicket.plate}</p>
                                            </div>
                                        </div>
                                         {activeTicket.id !== 'LOST TICKET' && (
                                            <div className="flex items-center gap-2">
                                                <Clock className="size-5 text-muted-foreground" />
                                                <div>
                                                    <p className="text-muted-foreground">Entry Time</p>
                                                    <p className="font-semibold">{activeTicket.entryTime.toLocaleString()}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    {getParkerBadge(activeTicket.type)}

                                    <Card className="bg-muted/50">
                                        <CardContent className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
                                            <div className="flex flex-col items-center justify-center space-y-1">
                                                <p className="text-lg text-muted-foreground">Duration</p>
                                                <p className="text-4xl font-bold">{String(duration.hours).padStart(2, '0')}:{String(duration.minutes).padStart(2, '0')}</p>
                                            </div>
                                            <div className="flex flex-col items-center justify-center space-y-1">
                                                <p className="text-lg text-muted-foreground">Total Fee</p>
                                                <p className="text-4xl font-bold text-primary">${fee.toFixed(2)}</p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                    {paymentProcessed && (
                                         <div className="flex items-center justify-center gap-2 text-green-600">
                                            <CheckCircle className="size-5" />
                                            <p className="font-semibold">Payment confirmed. Ready to open gate.</p>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-64 text-center">
                                    <Ticket className="size-16 text-muted-foreground/50" />
                                    <p className="mt-4 text-muted-foreground">Scan a ticket to begin processing an exit.</p>
                                </div>
                            )}
                        </CardContent>
                        <CardFooter className="flex justify-end gap-2">
                             <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="outline" disabled={!activeTicket || paymentProcessed || fee <= 0}>
                                        <DollarSign className="mr-2"/> Process Payment
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                    <AlertDialogTitle>Confirm Payment</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        You are about to process a cash payment of ${fee.toFixed(2)} for ticket {activeTicket?.id}.
                                    </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleProcessPayment}>Confirm Payment</AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                            <Button onClick={handleOpenGate} disabled={!activeTicket || (!paymentProcessed && fee > 0)}>Open {assignedGate?.name || 'Exit Gate'}</Button>
                        </CardFooter>
                    </Card>
                </div>
                <div className="md:col-span-1">
                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Exits (This Terminal)</CardTitle>
                        </CardHeader>
                        <CardContent>
                             <Table>
                                <TableHeader>
                                    <TableRow>
                                    <TableHead>Ticket</TableHead>
                                    <TableHead>Amount</TableHead>
                                    <TableHead>Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {transactions.map((tx) => (
                                    <TableRow key={tx.ticketId}>
                                        <TableCell className="font-medium">{tx.ticketId}</TableCell>
                                        <TableCell>${tx.amount.toFixed(2)}</TableCell>
                                        <TableCell>
                                            <Badge variant="default" className={'bg-green-100 text-green-800'}>
                                                {tx.status}
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    )
}

    