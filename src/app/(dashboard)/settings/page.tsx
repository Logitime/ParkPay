

'use client';

import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Car, DollarSign, ParkingSquare, Settings, User, KeyRound, QrCode, Printer, Clock, Trash2, Mail, Camera } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { mockCashiers } from "@/lib/mock-data";
import { Combobox } from "@/components/ui/combobox";
import { Badge } from "@/components/ui/badge";

type Zone = {
    id: number;
    name: string;
    spots: number;
};

type UserData = {
    id: number;
    name: string;
    email: string;
    role: 'admin' | 'cashier' | 'viewer' | 'operator';
    assignedGateId: number | null;
}

type Tariff = {
    id: string;
    name: string;
    description: string;
    rate: string;
}

type Gate = {
    id: number;
    name: string;
    ip: string;
    port: string;
    input: string;
    output: string;
    rfidReaderPort: string;
    qrReaderPort: string;
    printerPort: string;
    cameraUrl: string;
}

type Shift = {
    id: number;
    name: string;
    startTime: string;
    endTime: string;
    assignedCashierIds: number[];
}

export default function SettingsPage() {
    const { toast } = useToast();

    // General Settings State
    const [darkMode, setDarkMode] = useState(false);
    const [emailNotifications, setEmailNotifications] = useState(true);
    const [smtpHost, setSmtpHost] = useState("smtp.gmail.com");
    const [smtpPort, setSmtpPort] = useState("587");
    const [smtpUser, setSmtpUser] = useState("");
    const [smtpPass, setSmtpPass] = useState("");

    // Gate Settings State
    const [gates, setGates] = useState<Gate[]>([
        { id: 1, name: "Entry Gate", ip: "10.0.0.185", port: "5000", input: "1", output: "1", rfidReaderPort: "COM3", qrReaderPort: "COM5", printerPort: "COM1", cameraUrl: "" },
        { id: 2, name: "Exit Gate", ip: "192.168.1.11", port: "5000", input: "2", output: "2", rfidReaderPort: "COM4", qrReaderPort: "COM6", printerPort: "COM2", cameraUrl: "" },
    ]);
    const [autoOpen, setAutoOpen] = useState(true);
    const [newGateName, setNewGateName] = useState("");
    const [newGateIp, setNewGateIp] = useState("");

    // Zone Settings State
    const [zones, setZones] = useState<Zone[]>([
        { id: 1, name: "Zone A - Surface", spots: 100 },
        { id: 2, name: "Garage P1", spots: 250 },
    ]);
    const [newZoneName, setNewZoneName] = useState("");
    const [newZoneSpots, setNewZoneSpots] = useState("");

    // Tariff Settings State
    const [tariffs, setTariffs] = useState<Tariff[]>([
        { id: 't1', name: "Visitor - 1st Hour", description: "Rate for the first hour of parking.", rate: "$5.00 /hr" },
        { id: 't2', name: "Visitor - Hours 2-4", description: "Rate for the next 3 hours.", rate: "$4.00 /hr" },
        { id: 't3', name: "Visitor - Hours 5-8", description: "Rate for the next 4 hours.", rate: "$3.00 /hr" },
        { id: 't4', name: "Visitor - After 8 Hours", description: "Rate for each hour after the 8th.", rate: "$2.00 /hr" },
        { id: 't5', name: "Monthly Pass", description: "Flat rate for monthly subscribers.", rate: "$1200.00 /mo" },
        { id: 't6', name: "Lost Ticket Fee", description: "Flat fee for lost or damaged tickets.", rate: "$50.00" },
        { id: 't7', name: "VIP Parking", description: "Rate for designated VIP parkers.", rate: "$0.00" },
    ]);
    const [newTariffName, setNewTariffName] = useState("");
    const [newTariffRate, setNewTariffRate] = useState("");
    const [editingTariff, setEditingTariff] = useState<Tariff | null>(null);

    // User Settings State
    const [users, setUsers] = useState<UserData[]>(mockCashiers.map(c => ({...c})));
    const [editingUser, setEditingUser] = useState<UserData | null>(null);
    const [isUserDialogOpen, setIsUserDialogOpen] = useState(false);
    
    const initialUserFormState = {
        name: "",
        email: "",
        role: 'cashier' as UserData['role'],
        assignedGateId: null as number | null,
    };
    const [userForm, setUserForm] = useState<Omit<UserData, 'id'>>(initialUserFormState);


    // Shift Settings State
    const [shifts, setShifts] = useState<Shift[]>([
        { id: 1, name: "Morning Shift", startTime: "08:00", endTime: "16:00", assignedCashierIds: [1] },
        { id: 2, name: "Evening Shift", startTime: "16:00", endTime: "00:00", assignedCashierIds: [2] },
    ]);
    const [editingShift, setEditingShift] = useState<Shift | null>(null);

    const handleSaveChanges = (section: string) => {
        toast({
            title: "Settings Saved",
            description: `${section} settings have been successfully saved.`,
        });
    };

    const handleAddNewGate = () => {
        if (newGateName && newGateIp) {
            const newGate: Gate = {
                id: Date.now(),
                name: newGateName,
                ip: newGateIp,
                port: '5000',
                input: (gates.length + 1).toString(),
                output: (gates.length + 1).toString(),
                rfidReaderPort: "",
                qrReaderPort: "",
                printerPort: "",
                cameraUrl: "",
            };
            setGates([...gates, newGate]);
            setNewGateName("");
            setNewGateIp("");
            toast({
                title: "New Gate Added",
                description: `Gate "${newGateName}" has been created.`,
            });
        }
    };

    const handleGateChange = (id: number, field: keyof Gate, value: string) => {
        setGates(gates.map(gate => gate.id === id ? { ...gate, [field]: value } : gate));
    };

    const handleAddNewZone = () => {
        if (newZoneName && newZoneSpots) {
            setZones([...zones, { id: Date.now(), name: newZoneName, spots: parseInt(newZoneSpots) }]);
            setNewZoneName("");
            setNewZoneSpots("");
            toast({
                title: "New Zone Added",
                description: `Zone "${newZoneName}" has been created.`,
            });
        }
    };
    
    const handleAddNewUser = () => {
        setEditingUser(null);
        setUserForm(initialUserFormState);
        setIsUserDialogOpen(true);
    };

    const handleEditUser = (user: UserData) => {
        setEditingUser(user);
        setUserForm({
            name: user.name,
            email: user.email,
            role: user.role,
            assignedGateId: user.assignedGateId,
        });
        setIsUserDialogOpen(true);
    };

    const handleUserFormChange = (field: keyof typeof userForm, value: any) => {
        setUserForm(prev => ({...prev, [field]: value}));
    };

    const handleSaveUser = () => {
        if (!userForm.name || !userForm.email) {
            toast({
                variant: 'destructive',
                title: 'Validation Error',
                description: 'Name and email are required.',
            });
            return;
        }

        if (editingUser) {
            setUsers(users.map(u => u.id === editingUser.id ? {...editingUser, ...userForm} : u));
            toast({ title: 'User Updated', description: `Details for ${userForm.name} have been updated.` });
        } else {
            const newUser: UserData = {
                id: Date.now(),
                ...userForm,
            };
            setUsers([...users, newUser]);
            toast({ title: 'User Added', description: `${userForm.name} has been added.` });
        }
        setIsUserDialogOpen(false);
    };

    const handleAddNewTariff = () => {
        if (newTariffName && newTariffRate) {
            setTariffs([...tariffs, { id: Date.now().toString(), name: newTariffName, description: "New tariff", rate: newTariffRate }]);
            setNewTariffName("");
            setNewTariffRate("");
            toast({
                title: "New Tariff Added",
                description: `Tariff "${newTariffName}" has been created.`,
            });
        }
    };

    const handleEditTariff = (tariff: Tariff) => {
        setEditingTariff({...tariff});
    };

    const handleTariffChange = (field: keyof Tariff, value: string) => {
        if (editingTariff) {
            setEditingTariff({ ...editingTariff, [field]: value });
        }
    };

    const handleUpdateTariff = () => {
        if (editingTariff) {
            setTariffs(tariffs.map(t => t.id === editingTariff.id ? editingTariff : t));
            toast({
                title: "Tariff Updated",
                description: `Tariff "${editingTariff.name}" has been updated.`,
            });
            setEditingTariff(null);
        }
    };
    
    const handleUpdateShift = (updatedShift: Shift) => {
        setShifts(shifts.map(s => s.id === updatedShift.id ? updatedShift : s));
        setEditingShift(null);
        toast({ title: "Shift Updated", description: `Shift "${updatedShift.name}" has been saved.` });
    };

    const handleAddShift = () => {
        const newShift: Shift = {
            id: Date.now(),
            name: "New Shift",
            startTime: "00:00",
            endTime: "00:00",
            assignedCashierIds: [],
        };
        setShifts([...shifts, newShift]);
        setEditingShift(newShift);
    };

    const handleDeleteShift = (shiftId: number) => {
        setShifts(shifts.filter(s => s.id !== shiftId));
        toast({ title: "Shift Deleted", variant: "destructive" });
    };


    return (
        <div className="flex flex-col h-full">
            <Header title="Settings" />
            <main className="flex-1 p-4 md:p-6 lg:p-8 space-y-8">
                 <Tabs defaultValue="general">
                    <TabsList className="grid w-full grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
                        <TabsTrigger value="general"><Settings className="mr-2" /> General</TabsTrigger>
                        <TabsTrigger value="gates"><Car className="mr-2" /> Gates</TabsTrigger>
                        <TabsTrigger value="zones"><ParkingSquare className="mr-2" /> Zones</TabsTrigger>
                        <TabsTrigger value="tariffs"><DollarSign className="mr-2" /> Tariffs</TabsTrigger>
                        <TabsTrigger value="users"><User className="mr-2" /> Users</TabsTrigger>
                        <TabsTrigger value="shifts"><Clock className="mr-2" /> Shifts</TabsTrigger>
                    </TabsList>
                    <TabsContent value="general">
                        <Card>
                            <CardHeader>
                                <CardTitle>General Settings</CardTitle>
                                <CardDescription>Manage general application settings.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="flex items-center justify-between space-x-2 p-4 border rounded-lg">
                                    <div className="space-y-0.5">
                                        <Label htmlFor="dark-mode">Dark Mode</Label>
                                        <p className="text-xs text-muted-foreground">
                                            Enable or disable dark mode for the application.
                                        </p>
                                    </div>
                                    <Switch id="dark-mode" checked={darkMode} onCheckedChange={setDarkMode} />
                                </div>
                                <div className="flex items-center justify-between space-x-2 p-4 border rounded-lg">
                                    <div className="space-y-0.5">
                                        <Label htmlFor="notifications">Email Notifications</Label>
                                        <p className="text-xs text-muted-foreground">
                                            Receive email notifications for critical system events.
                                        </p>
                                    </div>
                                    <Switch id="notifications" checked={emailNotifications} onCheckedChange={setEmailNotifications} />
                                </div>
                                <Card>
                                    <CardHeader>
                                        <div className="flex items-center gap-2">
                                            <Mail className="size-5" />
                                            <CardTitle className="text-lg">Email (SMTP) Settings</CardTitle>
                                        </div>
                                        <CardDescription>
                                            Configure your Gmail SMTP server for sending notifications. For this to work, you may need to create an "App Password" in your Google Account settings.
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="grid sm:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="smtp-host">SMTP Host</Label>
                                                <Input id="smtp-host" value={smtpHost} onChange={(e) => setSmtpHost(e.target.value)} />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="smtp-port">SMTP Port</Label>
                                                <Input id="smtp-port" value={smtpPort} onChange={(e) => setSmtpPort(e.target.value)} />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="smtp-user">Gmail Address</Label>
                                            <Input id="smtp-user" type="email" placeholder="you@gmail.com" value={smtpUser} onChange={(e) => setSmtpUser(e.target.value)} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="smtp-pass">App Password</Label>
                                            <Input id="smtp-pass" type="password" placeholder="••••••••••••••••" value={smtpPass} onChange={(e) => setSmtpPass(e.target.value)} />
                                        </div>
                                    </CardContent>
                                </Card>
                            </CardContent>
                            <CardContent>
                                <Button onClick={() => handleSaveChanges('General')}>Save General Settings</Button>
                            </CardContent>
                        </Card>
                    </TabsContent>
                    <TabsContent value="gates">
                        <Card>
                            <CardHeader>
                                <CardTitle>Gate Management</CardTitle>
                                <CardDescription>Configure entry and exit gate settings.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {gates.map(gate => (
                                        <Card key={gate.id} className="p-4">
                                            <h3 className="text-lg font-semibold mb-4">{gate.name}</h3>
                                            <div className="space-y-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor={`gate-ip-${gate.id}`}>Relay IP Address</Label>
                                                    <Input id={`gate-ip-${gate.id}`} value={gate.ip} onChange={(e) => handleGateChange(gate.id, 'ip', e.target.value)} placeholder="192.168.1.10" />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor={`gate-port-${gate.id}`}>Network Port</Label>
                                                    <Input id={`gate-port-${gate.id}`} type="number" value={gate.port} onChange={(e) => handleGateChange(gate.id, 'port', e.target.value)} placeholder="5000" />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor={`gate-input-${gate.id}`}>Car Detect Port (Input)</Label>
                                                    <Input id={`gate-input-${gate.id}`} type="number" value={gate.input} onChange={(e) => handleGateChange(gate.id, 'input', e.target.value)} placeholder="1" />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor={`gate-output-${gate.id}`}>Open Gate Port (Output)</Label>
                                                    <Input id={`gate-output-${gate.id}`} type="number" value={gate.output} onChange={(e) => handleGateChange(gate.id, 'output', e.target.value)} placeholder="1" />
                                                </div>
                                                <div className="space-y-2">
                                                     <Label htmlFor={`gate-camera-${gate.id}`}>Camera URL</Label>
                                                      <div className="flex items-center gap-2">
                                                        <Camera className="size-5 text-muted-foreground" />
                                                        <Input id={`gate-camera-${gate.id}`} value={gate.cameraUrl} onChange={(e) => handleGateChange(gate.id, 'cameraUrl', e.target.value)} placeholder="e.g., rtsp://..." />
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor={`gate-rfid-${gate.id}`}>Serial Port for RFID Reader</Label>
                                                     <div className="flex items-center gap-2">
                                                        <KeyRound className="size-5 text-muted-foreground" />
                                                        <Input id={`gate-rfid-${gate.id}`} value={gate.rfidReaderPort} onChange={(e) => handleGateChange(gate.id, 'rfidReaderPort', e.target.value)} placeholder="e.g., COM3" />
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor={`gate-qr-${gate.id}`}>Serial Port for QR Reader</Label>
                                                     <div className="flex items-center gap-2">
                                                        <QrCode className="size-5 text-muted-foreground" />
                                                        <Input id={`gate-qr-${gate.id}`} value={gate.qrReaderPort} onChange={(e) => handleGateChange(gate.id, 'qrReaderPort', e.target.value)} placeholder="e.g., COM5" />
                                                    </div>
                                                </div>
                                                 <div className="space-y-2">
                                                    <Label htmlFor={`gate-printer-${gate.id}`}>Serial Port for Thermal Printer</Label>
                                                     <div className="flex items-center gap-2">
                                                        <Printer className="size-5 text-muted-foreground" />
                                                        <Input id={`gate-printer-${gate.id}`} value={gate.printerPort} onChange={(e) => handleGateChange(gate.id, 'printerPort', e.target.value)} placeholder="e.g., COM1" />
                                                    </div>
                                                </div>
                                            </div>
                                        </Card>
                                    ))}
                                </div>
                                <div className="flex items-center justify-between space-x-2 p-4 border rounded-lg mt-6">
                                    <div className="space-y-0.5">
                                        <Label htmlFor="auto-open">Automatic Opening</Label>
                                        <p className="text-xs text-muted-foreground">
                                            Automatically open gates on valid ticket scan.
                                        </p>
                                    </div>
                                    <Switch id="auto-open" checked={autoOpen} onCheckedChange={setAutoOpen} />
                                </div>
                            </CardContent>
                             <CardContent className="flex flex-col items-start gap-4">
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <Button variant="outline">Add New Gate</Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Add New Gate</DialogTitle>
                                            <DialogDescription>
                                                Enter the details for the new gate.
                                            </DialogDescription>
                                        </DialogHeader>
                                        <div className="grid gap-4 py-4">
                                            <div className="grid grid-cols-4 items-center gap-4">
                                                <Label htmlFor="gate-name" className="text-right">Name</Label>
                                                <Input id="gate-name" value={newGateName} onChange={(e) => setNewGateName(e.target.value)} className="col-span-3" placeholder="e.g., Garage P2 Entry" />
                                            </div>
                                            <div className="grid grid-cols-4 items-center gap-4">
                                                <Label htmlFor="gate-ip-new" className="text-right">IP Address</Label>
                                                <Input id="gate-ip-new" value={newGateIp} onChange={(e) => setNewGateIp(e.target.value)} className="col-span-3" placeholder="192.168.1.12" />
                                            </div>
                                        </div>
                                        <DialogFooter>
                                            <DialogClose asChild>
                                                <Button type="button" onClick={handleAddNewGate}>Add Gate</Button>
                                            </DialogClose>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                                <Button onClick={() => handleSaveChanges('Gate')}>Save All Gate Settings</Button>
                            </CardContent>
                        </Card>
                    </TabsContent>
                    <TabsContent value="zones">
                        <Card>
                            <CardHeader>
                                <CardTitle>Zone Management</CardTitle>
                                <CardDescription>Add, remove, or edit parking zones.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {zones.map(zone => (
                                <div key={zone.id} className="border rounded-lg p-4 flex justify-between items-center">
                                    <div>
                                        <p className="font-medium">{zone.name}</p>
                                        <p className="text-sm text-muted-foreground">{zone.spots} spots</p>
                                    </div>
                                    <Button variant="outline" size="sm">Edit</Button>
                                </div>
                                ))}
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <Button>Add New Zone</Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Add New Zone</DialogTitle>
                                            <DialogDescription>
                                                Enter the details for the new parking zone.
                                            </DialogDescription>
                                        </DialogHeader>
                                        <div className="grid gap-4 py-4">
                                            <div className="grid grid-cols-4 items-center gap-4">
                                                <Label htmlFor="zone-name" className="text-right">Name</Label>
                                                <Input id="zone-name" value={newZoneName} onChange={(e) => setNewZoneName(e.target.value)} className="col-span-3" />
                                            </div>
                                            <div className="grid grid-cols-4 items-center gap-4">
                                                <Label htmlFor="zone-spots" className="text-right">Spots</Label>
                                                <Input id="zone-spots" type="number" value={newZoneSpots} onChange={(e) => setNewZoneSpots(e.target.value)} className="col-span-3" />
                                            </div>
                                        </div>
                                        <DialogFooter>
                                            <DialogClose asChild>
                                                <Button type="button" onClick={handleAddNewZone}>Add Zone</Button>
                                            </DialogClose>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                            </CardContent>
                        </Card>
                    </TabsContent>
                    <TabsContent value="tariffs">
                        <Card>
                            <CardHeader>
                                <CardTitle>Tariff Management</CardTitle>
                                <CardDescription>Set parking rates and rules. These are used by the cashier page.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {tariffs.map(tariff => (
                                    <div key={tariff.id} className="border rounded-lg p-4 flex justify-between items-start">
                                        <div>
                                            <p className="font-medium">{tariff.name}</p>
                                            <p className="text-sm text-muted-foreground">{tariff.description}</p>
                                        </div>
                                        <div className="flex items-center gap-2 flex-shrink-0">
                                            <span className="text-lg font-semibold min-w-[80px] text-right">{tariff.rate}</span>
                                            <Dialog>
                                                <DialogTrigger asChild>
                                                    <Button variant="outline" size="sm" onClick={() => handleEditTariff(tariff)}>Edit</Button>
                                                </DialogTrigger>
                                            </Dialog>
                                        </div>
                                    </div>
                                ))}
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <Button>Add New Tariff</Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Add New Tariff</DialogTitle>
                                            <DialogDescription>
                                                Enter the details for the new tariff.
                                            </DialogDescription>
                                        </DialogHeader>
                                        <div className="grid gap-4 py-4">
                                            <div className="grid grid-cols-4 items-center gap-4">
                                                <Label htmlFor="tariff-name" className="text-right">Name</Label>
                                                <Input id="tariff-name" value={newTariffName} onChange={(e) => setNewTariffName(e.target.value)} className="col-span-3" />
                                            </div>
                                            <div className="grid grid-cols-4 items-center gap-4">
                                                <Label htmlFor="tariff-rate" className="text-right">Rate ($)</Label>
                                                <Input id="tariff-rate" value={newTariffRate} onChange={(e) => setNewTariffRate(e.target.value)} className="col-span-3" />
                                            </div>
                                        </div>
                                        <DialogFooter>
                                            <DialogClose asChild>
                                                <Button type="button" onClick={handleAddNewTariff}>Add Tariff</Button>
                                            </DialogClose>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                            </CardContent>
                             <CardContent>
                                <Button onClick={() => handleSaveChanges('Tariff')}>Save All Tariffs</Button>
                            </CardContent>
                        </Card>
                    </TabsContent>
                    <TabsContent value="users">
                        <Card>
                            <CardHeader>
                                <CardTitle>User Management</CardTitle>
                                <CardDescription>Manage user accounts, roles, and gate assignments.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                               {users.map(user => {
                                   const gate = user.assignedGateId ? gates.find(g => g.id === user.assignedGateId) : null;
                                   return (
                                       <div key={user.id} className="border rounded-lg p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                            <div className="flex-1">
                                                <p className="font-medium">{user.name}</p>
                                                <p className="text-sm text-muted-foreground">{user.email}</p>
                                            </div>
                                            <div className="flex flex-wrap items-center gap-4">
                                                <Badge variant="outline" className="capitalize">{user.role}</Badge>
                                                {gate && <Badge variant="secondary">{gate.name}</Badge>}
                                                <Button variant="ghost" size="sm" onClick={() => handleEditUser(user)}>
                                                    Edit
                                                </Button>
                                            </div>
                                        </div>
                                   )
                               })}
                               <Button onClick={handleAddNewUser}>Add New User</Button>                         
                            </CardContent>
                        </Card>
                    </TabsContent>
                     <TabsContent value="shifts">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle>Shift Management</CardTitle>
                                    <CardDescription>Define work shifts and assign users.</CardDescription>
                                </div>
                                <Button onClick={handleAddShift}>Add New Shift</Button>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {shifts.map(shift => (
                                    <Card key={shift.id}>
                                        <CardHeader className="flex flex-row items-center justify-between">
                                             <p className="font-semibold">{shift.name} ({shift.startTime} - {shift.endTime})</p>
                                             <div>
                                                <Button variant="ghost" size="icon" onClick={() => setEditingShift(shift)}>
                                                   Edit
                                                </Button>
                                                 <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDeleteShift(shift.id)}>
                                                    <Trash2 className="size-4" />
                                                </Button>
                                             </div>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-sm font-medium mb-2">Assigned Users</p>
                                            <div className="flex flex-wrap gap-2">
                                                {shift.assignedCashierIds.map(id => {
                                                    const user = users.find(c => c.id === id);
                                                    return user ? <Badge key={id} variant="secondary">{user.name}</Badge> : null;
                                                })}
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
                {editingTariff && (
                    <Dialog open={!!editingTariff} onOpenChange={(open) => !open && setEditingTariff(null)}>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Edit Tariff</DialogTitle>
                                <DialogDescription>
                                    Update the details for the tariff.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="edit-tariff-name" className="text-right">Name</Label>
                                    <Input id="edit-tariff-name" value={editingTariff.name} onChange={(e) => handleTariffChange('name', e.target.value)} className="col-span-3" />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="edit-tariff-desc" className="text-right">Description</Label>
                                    <Textarea id="edit-tariff-desc" value={editingTariff.description} onChange={(e) => handleTariffChange('description', e.target.value)} className="col-span-3" />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="edit-tariff-rate" className="text-right">Rate</Label>
                                    <Input id="edit-tariff-rate" value={editingTariff.rate} onChange={(e) => handleTariffChange('rate', e.target.value)} className="col-span-3" />
                                </div>
                            </div>
                            <DialogFooter>
                                <DialogClose asChild>
                                    <Button variant="outline" onClick={() => setEditingTariff(null)}>Cancel</Button>
                                </DialogClose>
                                <DialogClose asChild>
                                    <Button type="button" onClick={handleUpdateTariff}>Save Changes</Button>
                                </DialogClose>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                )}
                 {editingShift && (
                    <Dialog open={!!editingShift} onOpenChange={(open) => !open && setEditingShift(null)}>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Edit Shift</DialogTitle>
                                <DialogDescription>
                                    Update the details for the shift.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="edit-shift-name" className="text-right">Shift Name</Label>
                                    <Input id="edit-shift-name" value={editingShift.name} onChange={(e) => setEditingShift({...editingShift, name: e.target.value})} className="col-span-3" />
                                </div>
                                 <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="edit-shift-start" className="text-right">Start Time</Label>
                                    <Input id="edit-shift-start" type="time" value={editingShift.startTime} onChange={(e) => setEditingShift({...editingShift, startTime: e.target.value})} className="col-span-3" />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="edit-shift-end" className="text-right">End Time</Label>
                                    <Input id="edit-shift-end" type="time" value={editingShift.endTime} onChange={(e) => setEditingShift({...editingShift, endTime: e.target.value})} className="col-span-3" />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="edit-shift-cashiers" className="text-right">Assigned Users</Label>
                                    <Combobox
                                        className="col-span-3"
                                        options={users.map(c => ({ value: c.id.toString(), label: c.name }))}
                                        selected={editingShift.assignedCashierIds.map(id => id.toString())}
                                        onSelectedChange={(selected) => {
                                            setEditingShift({ ...editingShift, assignedCashierIds: selected.map(s => parseInt(s)) });
                                        }}
                                        placeholder="Select users..."
                                        searchPlaceholder="Search users..."
                                        notFoundPlaceholder="No users found."
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <DialogClose asChild>
                                    <Button variant="outline" onClick={() => setEditingShift(null)}>Cancel</Button>
                                </DialogClose>
                                <Button type="button" onClick={() => handleUpdateShift(editingShift)}>Save Changes</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                )}
                <Dialog open={isUserDialogOpen} onOpenChange={setIsUserDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{editingUser ? "Edit User" : "Add New User"}</DialogTitle>
                            <DialogDescription>
                                Manage user details, roles, and gate assignments.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                             <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="user-name" className="text-right">Name</Label>
                                <Input id="user-name" value={userForm.name} onChange={(e) => handleUserFormChange('name', e.target.value)} className="col-span-3" />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="user-email" className="text-right">Email</Label>
                                <Input id="user-email" type="email" value={userForm.email} onChange={(e) => handleUserFormChange('email', e.target.value)} className="col-span-3" />
                            </div>
                             <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="user-password" className="text-right">Password</Label>
                                <Button variant="outline" className="col-span-3" onClick={() => toast({ title: "Password Management", description: "In a real app, this would open a secure password reset flow."})}>Set Password</Button>
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="user-role" className="text-right">Role</Label>
                                 <Select value={userForm.role} onValueChange={(value: UserData['role']) => handleUserFormChange('role', value)}>
                                    <SelectTrigger className="col-span-3">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="admin">Admin</SelectItem>
                                        <SelectItem value="cashier">Cashier</SelectItem>
                                        <SelectItem value="operator">Operator</SelectItem>
                                        <SelectItem value="viewer">Viewer</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="user-gate" className="text-right">Assign Gate</Label>
                                <Select 
                                    value={userForm.assignedGateId?.toString() ?? 'none'} 
                                    onValueChange={(value) => handleUserFormChange('assignedGateId', value === 'none' ? null : parseInt(value))}
                                    disabled={userForm.role !== 'cashier' && userForm.role !== 'operator'}
                                >
                                    <SelectTrigger className="col-span-3">
                                        <SelectValue placeholder="Select a gate" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">None</SelectItem>
                                        {(userForm.role === 'cashier' ? gates.filter(g => g.name.toLowerCase().includes('exit')) : gates.filter(g => g.name.toLowerCase().includes('entry'))).map(gate => (
                                            <SelectItem key={gate.id} value={gate.id.toString()}>{gate.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <DialogFooter>
                            <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                            <Button onClick={handleSaveUser}>Save Changes</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </main>
        </div>
    )
}
