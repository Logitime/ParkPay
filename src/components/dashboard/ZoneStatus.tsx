import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ParkingSquare } from 'lucide-react';

const zones = [
  { name: 'Zone A - Surface', available: 25, total: 100 },
  { name: 'Zone B - Surface', available: 78, total: 80 },
  { name: 'Garage P1', available: 112, total: 250 },
  { name: 'Garage P2', available: 1, total: 250 },
  { name: 'VIP Area', available: 8, total: 15 },
];

export function ZoneStatus() {
  return (
    <Card className="lg:col-span-1">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>Zone Status</CardTitle>
            <CardDescription>Live occupancy across all zones.</CardDescription>
          </div>
          <ParkingSquare className="h-8 w-8 text-primary" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {zones.map((zone) => {
          const occupancy = ((zone.total - zone.available) / zone.total) * 100;
          return (
            <div key={zone.name}>
              <div className="flex justify-between items-center mb-1">
                <p className="text-sm font-medium">{zone.name}</p>
                <p className="text-sm text-muted-foreground">
                  <span className="font-semibold text-foreground">
                    {zone.available}
                  </span>
                  /{zone.total} available
                </p>
              </div>
              <Progress value={occupancy} className="h-2" />
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
