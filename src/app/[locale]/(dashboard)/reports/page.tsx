

'use client';

import { useState } from "react";
import { DateRange } from "react-day-picker";
import { addDays } from "date-fns";
import { Header } from "@/components/layout/Header";
import { Filters } from "@/components/reports/Filters";
import { ReportSummary } from "@/components/reports/ReportSummary";
import { RevenueChart } from "@/components/reports/RevenueChart";
import { TrafficChart } from "@/components/reports/TrafficChart";
import { TransactionsTable } from "@/components/reports/TransactionsTable";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTranslations } from "next-intl";


export default function ReportsPage() {
    const t = useTranslations('Reports');
    const { toast } = useToast();
    const [date, setDate] = useState<DateRange | undefined>({
        from: new Date(2024, 0, 20),
        to: addDays(new Date(2024, 0, 20), 20),
    });
    const [selectedCashier, setSelectedCashier] = useState('all');
    const [selectedShift, setSelectedShift] = useState('all');
    const [selectedGate, setSelectedGate] = useState('all');

    const filters = {
        date,
        cashier: selectedCashier,
        shift: selectedShift,
        gate: selectedGate,
    };

    const handleExport = () => {
        toast({
            title: t('exporting'),
            description: t('exportDescription'),
        });
    }

    return (
        <div className="flex flex-col h-full">
            <Header title={t('title')} />
            <main className="flex-1 p-4 md:p-6 lg:p-8 space-y-8">
                <div className="flex flex-wrap gap-4 justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold font-headline">{t('pageTitle')}</h2>
                        <p className="text-muted-foreground">{t('pageDescription')}</p>
                    </div>
                     <div className="flex flex-wrap items-center gap-4">
                        <Filters 
                            date={date}
                            onDateChange={setDate}
                            selectedCashier={selectedCashier}
                            onCashierChange={setSelectedCashier}
                            selectedShift={selectedShift}
                            onShiftChange={setSelectedShift}
                            selectedGate={selectedGate}
                            onGateChange={setSelectedGate}
                        />
                        <Button onClick={handleExport}>
                            <Download className="mr-2" />
                            {t('export')}
                        </Button>
                    </div>
                </div>
                <ReportSummary filters={filters} />
                <div className="grid gap-8 md:grid-cols-2">
                    <RevenueChart filters={filters} />
                    <TrafficChart filters={filters} />
                </div>
                <TransactionsTable filters={filters} />
            </main>
        </div>
    )
}
