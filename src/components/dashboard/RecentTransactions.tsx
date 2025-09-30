import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { BarChart3 } from 'lucide-react';
import { useTranslations } from 'next-intl';

const transactions = [
  {
    ticketId: 'T84B2-1',
    plate: 'AD-4589',
    entry: '10:32 AM',
    exit: '11:45 AM',
    duration: '1h 13m',
    status: 'Paid',
    amount: '$4.50',
  },
  {
    ticketId: 'T84B2-2',
    plate: 'BC-9102',
    entry: '10:55 AM',
    exit: '12:01 PM',
    duration: '1h 6m',
    status: 'Paid',
    amount: '$4.50',
  },
  {
    ticketId: 'T84B2-3',
    plate: 'CD-1123',
    entry: '11:10 AM',
    exit: '-',
    duration: 'Active',
    status: 'In-Park',
    amount: '-',
  },
  {
    ticketId: 'T84B2-4',
    plate: 'DE-4455',
    entry: '11:15 AM',
    exit: '11:30 AM',
    duration: '15m',
    status: 'Paid',
    amount: '$2.00',
  },
  {
    ticketId: 'T84B2-5',
    plate: 'EF-6789',
    entry: '11:46 AM',
    exit: '-',
    duration: 'Active',
    status: 'In-Park',
    amount: '-',
  },
];

export function RecentTransactions() {
  const t = useTranslations('Dashboard');
  return (
    <Card className="lg:col-span-3">
      <CardHeader>
        <div className="flex items-start justify-between">
            <div>
            <CardTitle>{t('recentTransactions')}</CardTitle>
            <CardDescription>
                {t('recentTransactionsDescription')}
            </CardDescription>
            </div>
            <BarChart3 className="h-8 w-8 text-primary" />
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('ticketId')}</TableHead>
              <TableHead className="hidden sm:table-cell">{t('plate')}</TableHead>
              <TableHead>{t('entry')}</TableHead>
              <TableHead className="hidden sm:table-cell">{t('exit')}</TableHead>
              <TableHead>{t('duration')}</TableHead>
              <TableHead>{t('status')}</TableHead>
              <TableHead className="text-right">{t('amount')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((tx) => (
              <TableRow key={tx.ticketId}>
                <TableCell className="font-medium">{tx.ticketId}</TableCell>
                <TableCell className="hidden sm:table-cell">{tx.plate}</TableCell>
                <TableCell>{tx.entry}</TableCell>
                <TableCell className="hidden sm:table-cell">{tx.exit}</TableCell>
                <TableCell>{tx.duration}</TableCell>
                <TableCell>
                  <Badge
                    variant={tx.status === 'Paid' ? 'default' : 'secondary'}
                    className={
                      tx.status === 'Paid'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-blue-100 text-blue-800'
                    }
                  >
                    {tx.status === 'Paid' ? t('paid') : t('inPark')}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">{tx.amount}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
