import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Receipt, Clock } from "lucide-react";

const summaryData = [
    { title: "Total Revenue", value: "$12,408.50", icon: DollarSign, change: "+15.2% from last month" },
    { title: "Total Transactions", value: "1,890", icon: Receipt, change: "+8.1% from last month" },
    { title: "Avg. Park Duration", value: "1h 24m", icon: Clock, change: "-2.3% from last month" },
]

export function ReportSummary({ filters }: { filters: any }) {
    // In a real app, you would use the `filters` prop to fetch and display dynamic data.
    return (
        <div className="grid gap-4 md:grid-cols-3">
            {summaryData.map(item => (
                <Card key={item.title}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{item.title}</CardTitle>
                        <item.icon className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{item.value}</div>
                        <p className="text-xs text-muted-foreground">{item.change}</p>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}
