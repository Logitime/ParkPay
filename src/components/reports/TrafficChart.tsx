'use client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from "recharts";
import { Car } from "lucide-react";
import { useTranslations } from "next-intl";

const trafficData = [
  { hour: "8 AM", entries: 35, exits: 10 },
  { hour: "9 AM", entries: 50, exits: 15 },
  { hour: "10 AM", entries: 60, exits: 45 },
  { hour: "11 AM", entries: 55, exits: 70 },
  { hour: "12 PM", entries: 40, exits: 80 },
  { hour: "1 PM", entries: 30, exits: 65 },
  { hour: "2 PM", entries: 25, exits: 50 },
  { hour: "3 PM", entries: 30, exits: 40 },
  { hour: "4 PM", entries: 45, exits: 55 },
  { hour: "5 PM", entries: 80, exits: 90 },
  { hour: "6 PM", entries: 70, exits: 110 },
];


export function TrafficChart({ filters }: { filters: any }) {
    const t = useTranslations('Reports');
    // In a real app, you would use the `filters` prop to fetch and display dynamic data.
    return (
        <Card>
            <CardHeader>
                <div className="flex items-start justify-between">
                    <div>
                        <CardTitle>{t('trafficAnalysis')}</CardTitle>
                        <CardDescription>{t('trafficHourly')}</CardDescription>
                    </div>
                    <Car className="h-8 w-8 text-primary" />
                </div>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={trafficData}>
                        <XAxis
                            dataKey="hour"
                            stroke="#888888"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                        />
                        <YAxis
                            stroke="#888888"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(value) => `${value}`}
                        />
                        <Tooltip 
                            cursor={{fill: 'hsla(var(--muted))'}}
                            contentStyle={{backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))'}} 
                        />
                        <Legend wrapperStyle={{fontSize: "14px"}} />
                        <Bar dataKey="entries" name={t('entries')} fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="exits" name={t('exits')} fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    )
}
