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
import { Car, DollarSign, ParkingSquare, Settings, User } from "lucide-react";

type Zone = {
    id: number;
    name: string;
    spots: number;
};

type Cashier = {
    id: number;
    name: string;
    email: string;
    role: 'admin' | 'editor' | 'viewer';
}

export default function SettingsPage() {
    const { toast } = useToast();

    // General Settings State
    const [darkMode, setDarkMode] = useState(false);
    const [emailNotifications, setEmailNotifications] = useState(true);

    // Gate Settings State
    const [entryGateIp, setEntryGateIp] = useState("192.168.1.10");
    const [entryGateInput, setEntryGateInput] = useState("1");
    const [entryGateOutput, setEntryGateOutput] = useState("1");
    const [exitGateIp, setExitGateIp] = useState("192.168.1.11");
    const [exitGateInput, setExitGateInput] = useState("2");
    const [exitGateOutput, setExitGateOutput] = useState("2");
    const [autoOpen, setAutoOpen] = useState(true);

    // Zone Settings State
    const [zones, setZones] = useState<Zone[]>([
        { id: 1, name: "Zone A - Surface", spots: 100 },
        { id: 2, name: "Garage P1", spots: 250 },
    ]);

    // Tariff Settings State
    const [hourlyRate, setHourlyRate] = useState("2.50");
    const [dailyMax, setDailyMax] = useState("20.00");
    const [lostTicketFee, setLostTicketFee] = useState("50.00");
    const [weekendSurcharge, setWeekendSurcharge] = useState("5.00");

    // Cashier Settings State
    const [cashiers, setCashiers] = useState<Cashier[]>([
        { id: 1, name: "John Doe", email: "john.doe@example.com", role: "editor" },
        { id: 2, name: "Jane Smith", email: "jane.smith@example.com", role: "viewer" },
    ]);

    const handleSaveChanges = (section: string) => {
        toast({
            title: "Settings Saved",
            description: `${section} settings have been successfully saved.`,
        });
    };

    const handleAddNewZone = () => {
        toast({
            title: "New Zone Added",
            description: "A new parking zone has been created.",
        });
    };
    
    const handleAddNewCashier = () => {
        toast({
            title: "New Cashier Added",
            description: "A new cashier account has been created.",
        });
    };
    
    const handleCashierRoleChange = (cashierId: number, newRole: Cashier['role']) => {
        setCashiers(cashiers.map(c => c.id === cashierId ? { ...c, role: newRole } : c));
    };

    return (
        <div className="flex flex-col h-full">
            <Header title="Settings" />
            <main className="flex-1 p-4 md:p-6 lg:p-8 space-y-8">
                 <Tabs defaultValue="general">
                    <TabsList className="grid w-full grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
                        <TabsTrigger value="general"><Settings className="mr-2" /> General</TabsTrigger>
                        <TabsTrigger value="gates"><Car className="mr-2" /> Gates</TabsTrigger>
                        <TabsTrigger value="zones"><ParkingSquare className="mr-2" /> Zones</TabsTrigger>
                        <TabsTrigger value="tariffs"><DollarSign className="mr-2" /> Tariffs</TabsTrigger>
                        <TabsTrigger value="cashiers"><User className="mr-2" /> Cashiers</TabsTrigger>
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
                                    <Card className="p-4">
                                        <h3 className="text-lg font-semibold mb-4">Entry Gate</h3>
                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="entry-gate-ip">Relay IP Address</Label>
                                                <Input id="entry-gate-ip" value={entryGateIp} onChange={(e) => setEntryGateIp(e.target.value)} placeholder="192.168.1.10" />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="entry-gate-input">Car Detect Port (Input)</Label>
                                                <Input id="entry-gate-input" type="number" value={entryGateInput} onChange={(e) => setEntryGateInput(e.target.value)} placeholder="1" />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="entry-gate-output">Open Gate Port (Output)</Label>
                                                <Input id="entry-gate-output" type="number" value={entryGateOutput} onChange={(e) => setEntryGateOutput(e.target.value)} placeholder="1" />
                                            </div>
                                        </div>
                                    </Card>
                                    <Card className="p-4">
                                        <h3 className="text-lg font-semibold mb-4">Exit Gate</h3>
                                         <div className="space-y-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="exit-gate-ip">Relay IP Address</Label>
                                                <Input id="exit-gate-ip" value={exitGateIp} onChange={(e) => setExitGateIp(e.target.value)} placeholder="192.168.1.11" />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="exit-gate-input">Car Detect Port (Input)</Label>
                                                <Input id="exit-gate-input" type="number" value={exitGateInput} onChange={(e) => setExitGateInput(e.target.value)} placeholder="2" />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="exit-gate-output">Open Gate Port (Output)</Label>
                                                <Input id="exit-gate-output" type="number" value={exitGateOutput} onChange={(e) => setExitGateOutput(e.target.value)} placeholder="2" />
                                            </div>
                                        </div>
                                    </Card>
                                </div>
                                <div className="flex items-center justify-between space-x-2 p-4 border rounded-lg">
                                    <div className="space-y-0.5">
                                        <Label htmlFor="auto-open">Automatic Opening</Label>
                                        <p className="text-xs text-muted-foreground">
                                            Automatically open gates on valid ticket scan.
                                        </p>
                                    </div>
                                    <Switch id="auto-open" checked={autoOpen} onCheckedChange={setAutoOpen} />
                                </div>
                            </CardContent>
                             <CardContent>
                                <Button onClick={() => handleSaveChanges('Gate')}>Save Gate Settings</Button>
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
                                <Button onClick={handleAddNewZone}>Add New Zone</Button>
                            </CardContent>
                        </Card>
                    </TabsContent>
                    <TabsContent value="tariffs">
                        <Card>
                            <CardHeader>
                                <CardTitle>Tariff Management</CardTitle>
                                <CardDescription>Set parking rates and rules.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="hourly-rate">Hourly Rate</Label>
                                        <Input id="hourly-rate" type="number" value={hourlyRate} onChange={(e) => setHourlyRate(e.target.value)} placeholder="2.50" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="daily-max">Daily Maximum</Label>
                                        <Input id="daily-max" type="number" value={dailyMax} onChange={(e) => setDailyMax(e.target.value)} placeholder="20.00" />
                                    </div>
                                     <div className="space-y-2">
                                        <Label htmlFor="lost-ticket-fee">Lost Ticket Fee</Label>
                                        <Input id="lost-ticket-fee" type="number" value={lostTicketFee} onChange={(e) => setLostTicketFee(e.target.value)} placeholder="50.00" />
                                    </div>
                                </div>
                                 <div className="flex items-center justify-between space-x-2 p-4 border rounded-lg">
                                    <div className="space-y-0.5">
                                        <Label htmlFor="weekend-surcharge">Weekend Surcharge</Label>
                                        <p className="text-xs text-muted-foreground">
                                            Apply a surcharge for parking on weekends.
                                        </p>
                                    </div>
                                    <Input id="weekend-surcharge" type="number" value={weekendSurcharge} onChange={(e) => setWeekendSurcharge(e.target.value)} placeholder="5.00" className="w-24" />
                                </div>
                            </CardContent>
                             <CardContent>
                                <Button onClick={() => handleSaveChanges('Tariff')}>Save Tariffs</Button>
                            </CardContent>
                        </Card>
                    </TabsContent>
                    <TabsContent value="cashiers">
                        <Card>
                            <CardHeader>
                                <CardTitle>Cashier Management</CardTitle>
                                <CardDescription>Manage cashier accounts and permissions.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                               {cashiers.map(cashier => (
                                   <div key={cashier.id} className="border rounded-lg p-4 flex justify-between items-center">
                                        <div>
                                            <p className="font-medium">{cashier.name}</p>
                                            <p className="text-sm text-muted-foreground">{cashier.email}</p>
                                        </div>
                                        <Select value={cashier.role} onValueChange={(value: Cashier['role']) => handleCashierRoleChange(cashier.id, value)}>
                                            <SelectTrigger className="w-[120px]">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="admin">Admin</SelectItem>
                                                <SelectItem value="editor">Cashier</SelectItem>
                                                <SelectItem value="viewer">Viewer</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                               ))}
                                <Button onClick={handleAddNewCashier}>Add New Cashier</Button>                            
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </main>
        </div>
    )
}
