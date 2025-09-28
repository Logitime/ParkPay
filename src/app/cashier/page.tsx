
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
import { controlGate } from "@/app/actions";
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


// Mock data for demonstration
const mockTickets = [
    { id: "T84B2-3", entryTime: new Date(new Date().getTime() - 3 * 60 * 60 * 1000 - 15 * 60 * 1000), plate: "CD-1123", status: "In-Park" },
    { id: "T84B2-5", entryTime: new Date(new Date().getTime() - 1 * 60 * 60 * 1000 - 45 * 60 * 1000), plate: "EF-6789", status: "In-Park" },
    { id: "V-EL5-9", entryTime: new Date(new Date().getTime() - 10 * 60 * 60 * 1000 - 30 * 60 * 1000), plate: "XY-9876", status: "In-Park", type: 'vip' },
];

const mockTransactions = [
    { ticketId: "T84B2-1", plate: "AD-4589", exit: "11:45 AM", status: "Paid", amount: "$13.00" },
    { ticketId: "T84B2-2", plate: "BC-9102", exit: "12:01 PM", status: "Paid", amount: "$9.00" },
    { ticketId: "T84B2-4", plate: "DE-4455", exit: "11:30 AM", status: "Paid", amount: "$5.00" },
];

// Mock data fetched from settings
const mockGates = [
    { id: 1, name: "Entry Gate", ip: "10.0.0.185", port: "5000", output: "1" },
    { id: 2, name: "Exit Gate", ip: "192.168.1.11", port: "5000", output: "2" },
    { id: 3, name: "Garage P2 Exit", ip: "192.168.1.12", port: "5000", output: "3" },
];

const mockCashiers = [
    { id: 1, name: "John Doe", assignedGateId: 2 },
    { id: 2, name: "Jane Smith", assignedGateId: 3 },
    { id: 3, name: "Admin User", assignedGateId: null }, // Admin can operate any
];

// New complex tariff calculation based on settings.
// In a real app, this would come from a shared config or API.
const calculateFee = (durationMinutes: number, ticketType?: 'vip' | 'lost' | 'monthly') => {
    if (ticketType === 'vip' || ticketType === 'monthly') {
        return 0.00;
    }
    if (ticketType === 'lost') {
        return 50.00; // Lost ticket fee
    }
    
    if (durationMinutes <= 0) return 0;

    let fee = 0;
    const hours = Math.ceil(durationMinutes / 60);

    if (hours <= 1) {
        // 1st hour rate
        fee = 5;
    } else if (hours <= 4) {
        // 1st hour + next 3 hours
        fee = 5 + (hours - 1) * 4;
    } else if (hours <= 8) {
        // 1st hour + next 3 hours + next 4 hours
        fee = 5 + (3 * 4) + (hours - 4) * 3;
    } else { // After 8 hours (up to 24)
        fee = 5 + (3 * 4) + (4 * 3) + (hours - 8) * 2;
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

    const activeCashier = activeCashierId ? mockCashiers.find(c => c.id === parseInt(activeCashierId, 10)) : null;
    const assignedGate = activeCashier?.assignedGateId ? mockGates.find(g => g.id === activeCashier.assignedGateId) : null;
    
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        if (activeTicket) {
            const diff = currentTime.getTime() - activeTicket.entryTime.getTime();
            const totalMinutes = Math.max(0, Math.floor(diff / (1000 * 60)));
            const hours = Math.floor(totalMinutes / 60);
            const minutes = totalMinutes % 60;
            setDuration({ hours, minutes });
            setFee(calculateFee(totalMinutes, activeTicket.type));
        }
    }, [currentTime, activeTicket]);

    const handleFindTicket = () => {
        setPaymentProcessed(false);
        setActiveTicket(null);

        if (ticketId.toLowerCase() === 'lost') {
             const lostTicket = { id: "LOST TICKET", entryTime: new Date(), plate: "N/A", status: "Lost", type: 'lost' };
            setActiveTicket(lostTicket);
            setDuration({hours: 0, minutes: 0});
            setFee(calculateFee(0, 'lost'));
             toast({
                variant: "destructive",
                title: "Lost Ticket",
                description: `Applying lost ticket fee of $50.00.`,
            });
            return;
        }

        const foundTicket = mockTickets.find(t => t.id.toLowerCase() === ticketId.toLowerCase());
        if (foundTicket) {
            setActiveTicket(foundTicket);
            toast({
                title: "Ticket Found",
                description: `Displaying details for ticket ${foundTicket.id}.`,
            });
        } else {
            toast({
                variant: "destructive",
                title: "Ticket Not Found",
                description: "No active ticket found with that ID.",
            });
        }
    };
    
    const handleProcessPayment = () => {
        setPaymentProcessed(true);
        toast({
            title: "Payment Confirmed",
            description: `Payment of $${fee.toFixed(2)} received for ticket ${activeTicket.id}.`,
            className: "bg-green-100 text-green-800"
        });
    }

    const handleOpenGate = async () => {
        if (!activeCashier) {
             toast({ variant: "destructive", title: "No Cashier Selected", description: "Please select a cashier station." });
             return;
        }
        if (!assignedGate) {
             toast({ variant: "destructive", title: "No Gate Assigned", description: `Cashier ${activeCashier.name} is not assigned to an exit gate.` });
             return;
        }
        if (!paymentProcessed) {
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
            // Reset after successful exit
            setTimeout(() => {
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
                                                {mockCashiers.map(c => (
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
                                    placeholder="Enter Ticket ID or 'lost'..." 
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
                                        <div className="flex items-center gap-2">
                                            <Clock className="size-5 text-muted-foreground" />
                                            <div>
                                                <p className="text-muted-foreground">Entry Time</p>
                                                <p className="font-semibold">{activeTicket.entryTime.toLocaleString()}</p>
                                            </div>
                                        </div>
                                    </div>
                                    {(activeTicket.type === 'vip' || activeTicket.type === 'monthly') && 
                                        <Badge className="w-fit">{activeTicket.type.charAt(0).toUpperCase() + activeTicket.type.slice(1)} Parker</Badge>
                                    }
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
                                    <Button variant="outline" disabled={!activeTicket || paymentProcessed}>
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
                            <Button onClick={handleOpenGate} disabled={!activeTicket || !paymentProcessed}>Open {assignedGate?.name || 'Exit Gate'}</Button>
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
                                    {mockTransactions.map((tx) => (
                                    <TableRow key={tx.ticketId}>
                                        <TableCell className="font-medium">{tx.ticketId}</TableCell>
                                        <TableCell>{tx.amount}</TableCell>
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

    