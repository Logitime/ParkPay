'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Wifi, WifiOff } from "lucide-react";
import { useState } from "react";
import { Switch } from "../ui/switch";
import { Label } from "../ui/label";

export function GateStatusIndicator() {
    const [connected, setConnected] = useState(true);

    return (
        <Card>
            <CardHeader>
                <div className="flex items-start justify-between">
                    <div>
                        <CardTitle>Gate Connection</CardTitle>
                        <CardDescription>Live status of the gate relays.</CardDescription>
                    </div>
                    {connected ? <Wifi className="h-8 w-8 text-green-500" /> : <WifiOff className="h-8 w-8 text-destructive" />}
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex flex-col items-center justify-center h-40 space-y-4">
                     {connected ? (
                        <div className="flex flex-col items-center text-center">
                            <Wifi className="h-16 w-16 text-green-500" />
                            <p className="text-2xl font-bold font-headline mt-2">Connected</p>
                            <p className="text-muted-foreground">Gate relays are online.</p>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center text-center">
                            <WifiOff className="h-16 w-16 text-destructive" />
                            <p className="text-2xl font-bold font-headline mt-2">Disconnected</p>
                            <p className="text-muted-foreground">Check relay power and network.</p>
                        </div>
                    )}
                </div>
                 <div className="flex items-center space-x-2 rounded-lg border p-3 bg-muted/50 justify-center">
                    <Label htmlFor="connection-toggle">Simulate Disconnection</Label>
                    <Switch id="connection-toggle" checked={!connected} onCheckedChange={(checked) => setConnected(!checked)} />
                </div>
            </CardContent>
        </Card>
    )
}
