import { Header } from '@/components/layout/Header';
import { OccupancyPrediction } from '@/components/dashboard/OccupancyPrediction';
import { GateControl } from '@/components/dashboard/GateControl';
import { ZoneStatus } from '@/components/dashboard/ZoneStatus';
import { RecentTransactions } from '@/components/dashboard/RecentTransactions';

export default function Home() {
  return (
    <div className="flex flex-col h-full">
      <Header title="Welcome, Admin!" />
      <main className="flex-1 p-4 md:p-6 lg:p-8 space-y-8">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          <OccupancyPrediction />
          <GateControl />
          <ZoneStatus />
        </div>
        <RecentTransactions />
      </main>
    </div>
  );
}
