

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
import { useTranslations } from "next-intl";


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
    const t = useTranslations('Settings');
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
            title: t('settingsSaved'),
            description: t('settingsSavedDescription', {section}),
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
                title: t('newGateAdded'),
                description: t('newGateAddedDescription', {name: newGateName}),
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
                title: t('newZoneAdded'),
                description: t('newZoneAddedDescription', {name: newZoneName}),
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
            toast({ title: t('userUpdated'), description: t('userUpdatedDescription', {name: userForm.name}) });
        } else {
            const newUser: UserData = {
                id: Date.now(),
                ...userForm,
            };
            setUsers([...users, newUser]);
            toast({ title: t('userAdded'), description: t('userAddedDescription', {name: userForm.name}) });
        }
        setIsUserDialogOpen(false);
    };

    const handleAddNewTariff = () => {
        if (newTariffName && newTariffRate) {
            setTariffs([...tariffs, { id: Date.now().toString(), name: newTariffName, description: "New tariff", rate: newTariffRate }]);
            setNewTariffName("");
            setNewTariffRate("");
            toast({
                title: t('newTariffAdded'),
                description: t('newTariffAddedDescription', {name: newTariffName}),
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
                title: t('tariffUpdated'),
                description: t('tariffUpdatedDescription', {name: editingTariff.name}),
            });
            setEditingTariff(null);
        }
    };
    
    const handleUpdateShift = (updatedShift: Shift) => {
        setShifts(shifts.map(s => s.id === updatedShift.id ? updatedShift : s));
        setEditingShift(null);
        toast({ title: t('shiftUpdated'), description: t('shiftUpdatedDescription', {name: updatedShift.name}) });
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
        toast({ title: t('deleteShift'), variant: "destructive" });
    };


    return (
        <div className="flex flex-col h-full">
            <Header title={t('title')} />
            <main className="flex-1 p-4 md:p-6 lg:p-8 space-y-8">
                 <Tabs defaultValue="general">
                    <TabsList className="grid w-full grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
                        <TabsTrigger value="general"><Settings className="mr-2" /> {t('general')}</TabsTrigger>
                        <TabsTrigger value="gates"><Car className="mr-2" /> {t('gates')}</TabsTrigger>
                        <TabsTrigger value="zones"><ParkingSquare className="mr-2" /> {t('zones')}</TabsTrigger>
                        <TabsTrigger value="tariffs"><DollarSign className="mr-2" /> {t('tariffs')}</TabsTrigger>
                        <TabsTrigger value="users"><User className="mr-2" /> {t('users')}</TabsTrigger>
                        <TabsTrigger value="shifts"><Clock className="mr-2" /> {t('shifts')}</TabsTrigger>
                    </TabsList>
                    <TabsContent value="general">
                        <Card>
                            <CardHeader>
                                <CardTitle>{t('general')}</CardTitle>
                                <CardDescription>{t('generalDescription')}</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="flex items-center justify-between space-x-2 p-4 border rounded-lg">
                                    <div className="space-y-0.5">
                                        <Label htmlFor="dark-mode">{t('darkMode')}</Label>
                                        <p className="text-xs text-muted-foreground">
                                            {t('darkModeDescription')}
                                        </p>
                                    </div>
                                    <Switch id="dark-mode" checked={darkMode} onCheckedChange={setDarkMode} />
                                </div>
                                <div className="flex items-center justify-between space-x-2 p-4 border rounded-lg">
                                    <div className="space-y-0.5">
                                        <Label htmlFor="notifications">{t('emailNotifications')}</Label>
                                        <p className="text-xs text-muted-foreground">
                                            {t('emailNotificationsDescription')}
                                        </p>
                                    </div>
                                    <Switch id="notifications" checked={emailNotifications} onCheckedChange={setEmailNotifications} />
                                </div>
                                <Card>
                                    <CardHeader>
                                        <div className="flex items-center gap-2">
                                            <Mail className="size-5" />
                                            <CardTitle className="text-lg">{t('emailSettings')}</CardTitle>
                                        </div>
                                        <CardDescription>
                                            {t('emailSettingsDescription')}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="grid sm:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="smtp-host">{t('smtpHost')}</Label>
                                                <Input id="smtp-host" value={smtpHost} onChange={(e) => setSmtpHost(e.target.value)} />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="smtp-port">{t('smtpPort')}</Label>
                                                <Input id="smtp-port" value={smtpPort} onChange={(e) => setSmtpPort(e.target.value)} />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="smtp-user">{t('gmailAddress')}</Label>
                                            <Input id="smtp-user" type="email" placeholder="you@gmail.com" value={smtpUser} onChange={(e) => setSmtpUser(e.target.value)} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="smtp-pass">{t('appPassword')}</Label>
                                            <Input id="smtp-pass" type="password" placeholder="••••••••••••••••" value={smtpPass} onChange={(e) => setSmtpPass(e.target.value)} />
                                        </div>
                                    </CardContent>
                                </Card>
                            </CardContent>
                            <CardContent>
                                <Button onClick={() => handleSaveChanges(t('general'))}>{t('saveGeneral')}</Button>
                            </CardContent>
                        </Card>
                    </TabsContent>
                    <TabsContent value="gates">
                        <Card>
                            <CardHeader>
                                <CardTitle>{t('gateManagement')}</CardTitle>
                                <CardDescription>{t('gateManagementDescription')}</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {gates.map(gate => (
                                        <Card key={gate.id} className="p-4">
                                            <h3 className="text-lg font-semibold mb-4">{gate.name}</h3>
                                            <div className="space-y-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor={`gate-ip-${gate.id}`}>{t('relayIp')}</Label>
                                                    <Input id={`gate-ip-${gate.id}`} value={gate.ip} onChange={(e) => handleGateChange(gate.id, 'ip', e.target.value)} placeholder="192.168.1.10" />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor={`gate-port-${gate.id}`}>{t('networkPort')}</Label>
                                                    <Input id={`gate-port-${gate.id}`} type="number" value={gate.port} onChange={(e) => handleGateChange(gate.id, 'port', e.target.value)} placeholder="5000" />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor={`gate-input-${gate.id}`}>{t('carDetectPort')}</Label>
                                                    <Input id={`gate-input-${gate.id}`} type="number" value={gate.input} onChange={(e) => handleGateChange(gate.id, 'input', e.target.value)} placeholder="1" />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor={`gate-output-${gate.id}`}>{t('openGatePort')}</Label>
                                                    <Input id={`gate-output-${gate.id}`} type="number" value={gate.output} onChange={(e) => handleGateChange(gate.id, 'output', e.target.value)} placeholder="1" />
                                                </div>
                                                <div className="space-y-2">
                                                     <Label htmlFor={`gate-camera-${gate.id}`}>{t('cameraUrl')}</Label>
                                                      <div className="flex items-center gap-2">
                                                        <Camera className="size-5 text-muted-foreground" />
                                                        <Input id={`gate-camera-${gate.id}`} value={gate.cameraUrl} onChange={(e) => handleGateChange(gate.id, 'cameraUrl', e.target.value)} placeholder="e.g., rtsp://..." />
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor={`gate-rfid-${gate.id}`}>{t('rfidPort')}</Label>
                                                     <div className="flex items-center gap-2">
                                                        <KeyRound className="size-5 text-muted-foreground" />
                                                        <Input id={`gate-rfid-${gate.id}`} value={gate.rfidReaderPort} onChange={(e) => handleGateChange(gate.id, 'rfidReaderPort', e.target.value)} placeholder="e.g., COM3" />
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor={`gate-qr-${gate.id}`}>{t('qrPort')}</Label>
                                                     <div className="flex items-center gap-2">
                                                        <QrCode className="size-5 text-muted-foreground" />
                                                        <Input id={`gate-qr-${gate.id}`} value={gate.qrReaderPort} onChange={(e) => handleGateChange(gate.id, 'qrReaderPort', e.target.value)} placeholder="e.g., COM5" />
                                                    </div>
                                                </div>
                                                 <div className="space-y-2">
                                                    <Label htmlFor={`gate-printer-${gate.id}`}>{t('printerPort')}</Label>
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
                                        <Label htmlFor="auto-open">{t('autoOpening')}</Label>
                                        <p className="text-xs text-muted-foreground">
                                            {t('autoOpeningDescription')}
                                        </p>
                                    </div>
                                    <Switch id="auto-open" checked={autoOpen} onCheckedChange={setAutoOpen} />
                                </div>
                            </CardContent>
                             <CardContent className="flex flex-col items-start gap-4">
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <Button variant="outline">{t('addNewGate')}</Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>{t('addNewGate')}</DialogTitle>
                                            <DialogDescription>
                                                {t('addNewGateDescription')}
                                            </DialogDescription>
                                        </DialogHeader>
                                        <div className="grid gap-4 py-4">
                                            <div className="grid grid-cols-4 items-center gap-4">
                                                <Label htmlFor="gate-name" className="text-right">{t('gateName')}</Label>
                                                <Input id="gate-name" value={newGateName} onChange={(e) => setNewGateName(e.target.value)} className="col-span-3" placeholder="e.g., Garage P2 Entry" />
                                            </div>
                                            <div className="grid grid-cols-4 items-center gap-4">
                                                <Label htmlFor="gate-ip-new" className="text-right">{t('ipAddress')}</Label>
                                                <Input id="gate-ip-new" value={newGateIp} onChange={(e) => setNewGateIp(e.target.value)} className="col-span-3" placeholder="192.168.1.12" />
                                            </div>
                                        </div>
                                        <DialogFooter>
                                            <DialogClose asChild>
                                                <Button type="button" onClick={handleAddNewGate}>{t('addGate')}</Button>
                                            </DialogClose>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                                <Button onClick={() => handleSaveChanges(t('gates'))}>{t('saveAllGates')}</Button>
                            </CardContent>
                        </Card>
                    </TabsContent>
                    <TabsContent value="zones">
                        <Card>
                            <CardHeader>
                                <CardTitle>{t('zoneManagement')}</CardTitle>
                                <CardDescription>{t('zoneManagementDescription')}</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {zones.map(zone => (
                                <div key={zone.id} className="border rounded-lg p-4 flex justify-between items-center">
                                    <div>
                                        <p className="font-medium">{zone.name}</p>
                                        <p className="text-sm text-muted-foreground">{zone.spots} {t('spots')}</p>
                                    </div>
                                    <Button variant="outline" size="sm">{t('edit')}</Button>
                                </div>
                                ))}
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <Button>{t('addNewZone')}</Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>{t('addNewZone')}</DialogTitle>
                                            <DialogDescription>
                                                {t('addNewZoneDescription')}
                                            </DialogDescription>
                                        </DialogHeader>
                                        <div className="grid gap-4 py-4">
                                            <div className="grid grid-cols-4 items-center gap-4">
                                                <Label htmlFor="zone-name" className="text-right">{t('gateName')}</Label>
                                                <Input id="zone-name" value={newZoneName} onChange={(e) => setNewZoneName(e.target.value)} className="col-span-3" />
                                            </div>
                                            <div className="grid grid-cols-4 items-center gap-4">
                                                <Label htmlFor="zone-spots" className="text-right">{t('spots')}</Label>
                                                <Input id="zone-spots" type="number" value={newZoneSpots} onChange={(e) => setNewZoneSpots(e.target.value)} className="col-span-3" />
                                            </div>
                                        </div>
                                        <DialogFooter>
                                            <DialogClose asChild>
                                                <Button type="button" onClick={handleAddNewZone}>{t('addZone')}</Button>
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
                                <CardTitle>{t('tariffManagement')}</CardTitle>
                                <CardDescription>{t('tariffManagementDescription')}</CardDescription>
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
                                                    <Button variant="outline" size="sm" onClick={() => handleEditTariff(tariff)}>{t('edit')}</Button>
                                                </DialogTrigger>
                                            </Dialog>
                                        </div>
                                    </div>
                                ))}
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <Button>{t('addNewTariff')}</Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>{t('addNewTariff')}</DialogTitle>
                                            <DialogDescription>
                                                {t('addNewTariffDescription')}
                                            </DialogDescription>
                                        </DialogHeader>
                                        <div className="grid gap-4 py-4">
                                            <div className="grid grid-cols-4 items-center gap-4">
                                                <Label htmlFor="tariff-name" className="text-right">{t('gateName')}</Label>
                                                <Input id="tariff-name" value={newTariffName} onChange={(e) => setNewTariffName(e.target.value)} className="col-span-3" />
                                            </div>
                                            <div className="grid grid-cols-4 items-center gap-4">
                                                <Label htmlFor="tariff-rate" className="text-right">{t('rate')}</Label>
                                                <Input id="tariff-rate" value={newTariffRate} onChange={(e) => setNewTariffRate(e.target.value)} className="col-span-3" />
                                            </div>
                                        </div>
                                        <DialogFooter>
                                            <DialogClose asChild>
                                                <Button type="button" onClick={handleAddNewTariff}>{t('addTariff')}</Button>
                                            </DialogClose>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                            </CardContent>
                             <CardContent>
                                <Button onClick={() => handleSaveChanges(t('tariffs'))}>{t('saveAllTariffs')}</Button>
                            </CardContent>
                        </Card>
                    </TabsContent>
                    <TabsContent value="users">
                        <Card>
                            <CardHeader>
                                <CardTitle>{t('userManagement')}</CardTitle>
                                <CardDescription>{t('userManagementDescription')}</CardDescription>
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
                                                    {t('edit')}
                                                </Button>
                                            </div>
                                        </div>
                                   )
                               })}
                               <Button onClick={handleAddNewUser}>{t('addNewUser')}</Button>                         
                            </CardContent>
                        </Card>
                    </TabsContent>
                     <TabsContent value="shifts">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle>{t('shiftManagement')}</CardTitle>
                                    <CardDescription>{t('shiftManagementDescription')}</CardDescription>
                                </div>
                                <Button onClick={handleAddShift}>{t('addNewShift')}</Button>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {shifts.map(shift => (
                                    <Card key={shift.id}>
                                        <CardHeader className="flex flex-row items-center justify-between">
                                             <p className="font-semibold">{shift.name} ({shift.startTime} - {shift.endTime})</p>
                                             <div>
                                                <Button variant="ghost" size="icon" onClick={() => setEditingShift(shift)}>
                                                   {t('edit')}
                                                </Button>
                                                 <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDeleteShift(shift.id)}>
                                                    <Trash2 className="size-4" />
                                                </Button>
                                             </div>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-sm font-medium mb-2">{t('assignedUsers')}</p>
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
                                <DialogTitle>{t('editTariff')}</DialogTitle>
                                <DialogDescription>
                                    {t('editTariffDescription')}
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="edit-tariff-name" className="text-right">{t('gateName')}</Label>
                                    <Input id="edit-tariff-name" value={editingTariff.name} onChange={(e) => handleTariffChange('name', e.target.value)} className="col-span-3" />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="edit-tariff-desc" className="text-right">{t('description')}</Label>
                                    <Textarea id="edit-tariff-desc" value={editingTariff.description} onChange={(e) => handleTariffChange('description', e.target.value)} className="col-span-3" />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="edit-tariff-rate" className="text-right">{t('rate')}</Label>
                                    <Input id="edit-tariff-rate" value={editingTariff.rate} onChange={(e) => handleTariffChange('rate', e.target.value)} className="col-span-3" />
                                </div>
                            </div>
                            <DialogFooter>
                                <DialogClose asChild>
                                    <Button variant="outline" onClick={() => setEditingTariff(null)}>Cancel</Button>
                                </DialogClose>
                                <DialogClose asChild>
                                    <Button type="button" onClick={handleUpdateTariff}>{t('saveChanges')}</Button>
                                </DialogClose>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                )}
                 {editingShift && (
                    <Dialog open={!!editingShift} onOpenChange={(open) => !open && setEditingShift(null)}>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>{t('editShift')}</DialogTitle>
                                <DialogDescription>
                                    {t('editShiftDescription')}
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="edit-shift-name" className="text-right">{t('shiftName')}</Label>
                                    <Input id="edit-shift-name" value={editingShift.name} onChange={(e) => setEditingShift({...editingShift, name: e.target.value})} className="col-span-3" />
                                </div>
                                 <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="edit-shift-start" className="text-right">{t('startTime')}</Label>
                                    <Input id="edit-shift-start" type="time" value={editingShift.startTime} onChange={(e) => setEditingShift({...editingShift, startTime: e.target.value})} className="col-span-3" />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="edit-shift-end" className="text-right">{t('endTime')}</Label>
                                    <Input id="edit-shift-end" type="time" value={editingShift.endTime} onChange={(e) => setEditingShift({...editingShift, endTime: e.target.value})} className="col-span-3" />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="edit-shift-cashiers" className="text-right">{t('assignedUsers')}</Label>
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
                                <Button type="button" onClick={() => handleUpdateShift(editingShift)}>{t('saveChanges')}</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                )}
                <Dialog open={isUserDialogOpen} onOpenChange={setIsUserDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{editingUser ? t('editUser') : t('addNewUser')}</DialogTitle>
                            <DialogDescription>
                                {t('editUserDescription')}
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                             <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="user-name" className="text-right">{t('gateName')}</Label>
                                <Input id="user-name" value={userForm.name} onChange={(e) => handleUserFormChange('name', e.target.value)} className="col-span-3" />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="user-email" className="text-right">Email</Label>
                                <Input id="user-email" type="email" value={userForm.email} onChange={(e) => handleUserFormChange('email', e.target.value)} className="col-span-3" />
                            </div>
                             <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="user-password" className="text-right">{t('password')}</Label>
                                <Button variant="outline" className="col-span-3" onClick={() => toast({ title: t('passwordManagement'), description: t('passwordManagementDescription')})}>{t('setPassword')}</Button>
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="user-role" className="text-right">{t('role')}</Label>
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
                                <Label htmlFor="user-gate" className="text-right">{t('assignGate')}</Label>
                                <Select 
                                    value={userForm.assignedGateId?.toString() ?? 'none'} 
                                    onValueChange={(value) => handleUserFormChange('assignedGateId', value === 'none' ? null : parseInt(value))}
                                    disabled={userForm.role !== 'cashier' && userForm.role !== 'operator'}
                                >
                                    <SelectTrigger className="col-span-3">
                                        <SelectValue placeholder={t('selectGate')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">{t('none')}</SelectItem>
                                        {(userForm.role === 'cashier' ? gates.filter(g => g.name.toLowerCase().includes('exit')) : gates.filter(g => g.name.toLowerCase().includes('entry'))).map(gate => (
                                            <SelectItem key={gate.id} value={gate.id.toString()}>{gate.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <DialogFooter>
                            <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                            <Button onClick={handleSaveUser}>{t('saveChanges')}</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </main>
        </div>
    )
}
