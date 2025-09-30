
import { Header } from '@/components/layout/Header';
import { OccupancyPrediction } from '@/components/dashboard/OccupancyPrediction';
import { GateStatusIndicator } from '@/components/dashboard/GateStatusIndicator';
import { ZoneStatus } from '@/components/dashboard/ZoneStatus';
import { RecentTransactions } from '@/components/dashboard/RecentTransactions';
import { useTranslations } from 'next-intl';

export default function Dashboard() {
  const t = useTranslations('Dashboard');
  return (
    <div className="flex flex-col h-full">
      <Header title={t('title')} />
      <main className="flex-1 p-4 md:p-6 lg:p-8 space-y-8">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          <OccupancyPrediction />
          <GateStatusIndicator />
          <ZoneStatus />
        </div>
        <RecentTransactions />
      </main>
    </div>
  );
}
