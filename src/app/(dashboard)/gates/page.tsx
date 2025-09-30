'use client';

import { useState } from 'react';
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { GateControl } from "@/components/dashboard/GateControl";


// This would come from a settings context/store in a real app
const gateSettings = [
    {
        id: 1,
        name: "Entry Gate",
        ip: "10.0.0.185",
        port: 5000,
        input: 1,
        output: 1,
        cameraUrl: "http://example.com/cam1",
    },
    {
        id: 2,
        name: "Exit Gate",
        ip: "192.168.1.11",
        port: 5000,
        input: 2,
        output: 2,
        cameraUrl: "http://example.com/cam2",
    },
];

export default function GatesPage() {
    const [isPolling, setIsPolling] = useState(true);

    return (
        <div className="flex flex-col h-full">
            <Header title="Gate & Camera Control" />
            <main className="flex-1 p-4 md:p-6 lg:p-8 space-y-8">
                 <Card>
                    <CardHeader>
                        <CardTitle>System Settings</CardTitle>
                        <CardDescription>Global controls for gate system operations.</CardDescription>
                    </CardHeader>
                    <CardContent>
                         <div className="flex items-center space-x-2 rounded-lg border p-4 bg-muted/50 w-fit">
                            <Switch id="sensor-polling" checked={isPolling} onCheckedChange={setIsPolling} />
                            <Label htmlFor="sensor-polling" className="flex-grow">Enable Live Sensor Polling</Label>
                        </div>
                    </CardContent>
                </Card>

                <div className="grid gap-8 md:grid-cols-1 lg:grid-cols-2">
                    {gateSettings.map(gate => (
                        <GateControl key={gate.id} gateConfig={gate} isPolling={isPolling} />
                    ))}
                </div>
            </main>
        </div>
    )
}
