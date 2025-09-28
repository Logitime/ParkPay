'use client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";

const data = [
  { date: "Jan 1", revenue: 450 },
  { date: "Jan 2", revenue: 520 },
  { date: "Jan 3", revenue: 380 },
  { date: "Jan 4", revenue: 610 },
  { date: "Jan 5", revenue: 750 },
  { date: "Jan 6", revenue: 820 },
  { date: "Jan 7", revenue: 710 },
  { date: "Jan 8", revenue: 650 },
  { date: "Jan 9", revenue: 580 },
  { date: "Jan 10", revenue: 530 },
];

export function RevenueChart() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Revenue Over Time</CardTitle>
                <CardDescription>Daily revenue for the selected period.</CardDescription>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={data}>
                        <XAxis
                            dataKey="date"
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
                            tickFormatter={(value) => `$${value}`}
                        />
                        <Tooltip 
                            cursor={{fill: 'hsla(var(--muted))'}}
                            contentStyle={{backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))'}} 
                        />
                        <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    )
}
