import { Header } from "@/components/layout/Header";
import { ZoneStatus } from "@/components/dashboard/ZoneStatus";
import { Card, CardContent } from "@/components/ui/card";
import { useTranslations } from "next-intl";

const zones = [
  { name: 'Zone A - Surface', available: 25, total: 100 },
  { name: 'Zone B - Surface', available: 78, total: 80 },
  { name: 'Garage P1', available: 112, total: 250 },
  { name: 'Garage P2', available: 1, total: 250 },
  { name: 'VIP Area', available: 8, total: 15 },
];

export default function ZonesPage() {
    const t = useTranslations('Zones');
    return (
        <div className="flex flex-col h-full">
            <Header title={t('title')} />
            <main className="flex-1 p-4 md:p-6 lg:p-8">
                <div className="grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                    {zones.map(zone => (
                        <Card key={zone.name}>
                            <CardContent className="p-0">
                                <div className="p-4">
                                    <h3 className="text-lg font-bold">{zone.name}</h3>
                                    <p className="text-sm text-muted-foreground">{zone.available} of {zone.total} spots available</p>
                                </div>
                                <div className="h-48 bg-muted flex items-center justify-center">
                                    <p className="text-muted-foreground">{t('mapPlaceholder')}</p>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </main>
        </div>
    )
}
