import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Car, DollarSign, ParkingSquare, Settings, User } from "lucide-react";

export default function SettingsPage() {
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
                                    <Switch id="dark-mode" />
                                </div>
                                <div className="flex items-center justify-between space-x-2 p-4 border rounded-lg">
                                    <div className="space-y-0.5">
                                        <Label htmlFor="notifications">Email Notifications</Label>
                                        <p className="text-xs text-muted-foreground">
                                            Receive email notifications for critical system events.
                                        </p>
                                    </div>
                                    <Switch id="notifications" checked />
                                </div>
                            </CardContent>
                            <CardContent>
                                <Button>Save General Settings</Button>
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
                               <div className="space-y-2">
                                    <Label htmlFor="entry-gate-ip">Entry Gate IP Address</Label>
                                    <Input id="entry-gate-ip" placeholder="192.168.1.10" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="exit-gate-ip">Exit Gate IP Address</Label>
                                    <Input id="exit-gate-ip" placeholder="192.168.1.11" />
                                </div>
                                <div className="flex items-center justify-between space-x-2 p-4 border rounded-lg">
                                    <div className="space-y-0.5">
                                        <Label htmlFor="auto-open">Automatic Opening</Label>
                                        <p className="text-xs text-muted-foreground">
                                            Automatically open gates on valid ticket scan.
                                        </p>
                                    </div>
                                    <Switch id="auto-open" checked />
                                </div>
                            </CardContent>
                             <CardContent>
                                <Button>Save Gate Settings</Button>
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
                                <div className="border rounded-lg p-4 flex justify-between items-center">
                                    <div>
                                        <p className="font-medium">Zone A - Surface</p>
                                        <p className="text-sm text-muted-foreground">100 spots</p>
                                    </div>
                                    <Button variant="outline" size="sm">Edit</Button>
                                </div>
                                <div className="border rounded-lg p-4 flex justify-between items-center">
                                    <div>
                                        <p className="font-medium">Garage P1</p>
                                        <p className="text-sm text-muted-foreground">250 spots</p>
                                    </div>
                                    <Button variant="outline" size="sm">Edit</Button>
                                </div>
                                <Button>Add New Zone</Button>
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
                                        <Input id="hourly-rate" type="number" placeholder="2.50" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="daily-max">Daily Maximum</Label>
                                        <Input id="daily-max" type="number" placeholder="20.00" />
                                    </div>
                                     <div className="space-y-2">
                                        <Label htmlFor="lost-ticket-fee">Lost Ticket Fee</Label>
                                        <Input id="lost-ticket-fee" type="number" placeholder="50.00" />
                                    </div>
                                </div>
                                 <div className="flex items-center justify-between space-x-2 p-4 border rounded-lg">
                                    <div className="space-y-0.5">
                                        <Label htmlFor="weekend-surcharge">Weekend Surcharge</Label>
                                        <p className="text-xs text-muted-foreground">
                                            Apply a surcharge for parking on weekends.
                                        </p>
                                    </div>
                                    <Input id="weekend-surcharge" type="number" placeholder="5.00" className="w-24" />
                                </div>
                            </CardContent>
                             <CardContent>
                                <Button>Save Tariffs</Button>
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
                               <div className="border rounded-lg p-4 flex justify-between items-center">
                                    <div>
                                        <p className="font-medium">John Doe</p>
                                        <p className="text-sm text-muted-foreground">john.doe@example.com</p>
                                    </div>
                                    <Select defaultValue="editor">
                                        <SelectTrigger className="w-[120px]">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="admin">Admin</SelectItem>
                                            <SelectItem value="editor">Cashier</`SelectItem>
                                            <SelectItem value="viewer">Viewer</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="border rounded-lg p-4 flex justify-between items-center">
                                    <div>
                                        <p className="font-medium">Jane Smith</p>
                                        <p className="text-sm text-muted-foreground">jane.smith@example.com</p>
                                    </div>
                                     <Select defaultValue="viewer">
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
                                <Button>Add New Cashier</Button>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </main>
        </div>
    )
}
