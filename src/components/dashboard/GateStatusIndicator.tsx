'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Wifi, WifiOff, Car } from "lucide-react";
import { useState } from "react";
import { Switch } from "../ui/switch";
import { Label } from "../ui/label";

export function GateStatusIndicator() {
    const [entryConnected, setEntryConnected] = useState(true);
    const [exitConnected, setExitConnected] = useState(false);

    const GateConnection = ({ name, connected }: { name: string, connected: boolean }) => (
        <div className="flex items-center justify-between rounded-lg border p-4 bg-muted/50">
            <div className="flex items-center gap-3">
                <Car className="size-6 text-muted-foreground" />
                <span className="font-semibold">{name} Gate</span>
            </div>
            <div className={`flex items-center gap-2 text-sm font-medium ${connected ? 'text-green-500' : 'text-destructive'}`}>
                {connected ? <Wifi className="size-5" /> : <WifiOff className="size-5" />}
                <span className="font-bold">{connected ? 'Online' : 'Offline'}</span>
            </div>
        </div>
    );

    return (
        <Card>
            <CardHeader>
                <div className="flex items-start justify-between">
                    <div>
                        <CardTitle>Gate Connections</CardTitle>
                        <CardDescription>Live status of the gate relays.</CardDescription>
                    </div>
                     <Wifi className="h-8 w-8 text-primary" />
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-4">
                    <GateConnection name="Entry" connected={entryConnected} />
                    <GateConnection name="Exit" connected={exitConnected} />
                </div>
                 <div className="flex flex-col gap-4 rounded-lg border p-4">
                    <p className="text-sm font-medium text-muted-foreground">Simulation Controls</p>
                    <div className="flex items-center justify-between">
                        <Label htmlFor="entry-connection-toggle">Entry Gate Connection</Label>
                        <Switch id="entry-connection-toggle" checked={entryConnected} onCheckedChange={setEntryConnected} />
                    </div>
                    <div className="flex items-center justify-between">
                        <Label htmlFor="exit-connection-toggle">Exit Gate Connection</Label>
                        <Switch id="exit-connection-toggle" checked={exitConnected} onCheckedChange={setExitConnected} />
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
