import { Header } from "@/components/layout/Header";
import { DateRangePicker } from "@/components/reports/DateRangePicker";
import { ReportSummary } from "@/components/reports/ReportSummary";
import { RevenueChart } from "@/components/reports/RevenueChart";
import { TransactionsTable } from "@/components/reports/TransactionsTable";

export default function ReportsPage() {
    return (
        <div className="flex flex-col h-full">
            <Header title="Reports" />
            <main className="flex-1 p-4 md:p-6 lg:p-8 space-y-8">
                <div className="flex flex-wrap gap-4 justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold font-headline">Financial Reports</h2>
                        <p className="text-muted-foreground">Analyze revenue and transaction trends.</p>
                    </div>
                    <DateRangePicker />
                </div>
                <ReportSummary />
                <RevenueChart />
                <TransactionsTable />
            </main>
        </div>
    )
}
