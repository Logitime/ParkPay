
'use client';

import * as React from 'react';
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
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Car, Clock, DollarSign, DoorOpen, User } from 'lucide-react';

const transactions = [
  {
    ticketId: 'T84A1-45',
    plate: 'AD-4589',
    entry: {
      date: '2024-07-21',
      time: '08:12 AM',
      gate: 'Entry Gate',
    },
    exit: {
      date: '2024-07-21',
      time: '09:45 AM',
      gate: 'Exit Gate',
      user: 'John Doe',
    },
    duration: '1h 33m',
    status: 'Paid',
    amount: '$5.50',
  },
  {
    ticketId: 'T84A1-46',
    plate: 'BC-9102',
    entry: {
      date: '2024-07-21',
      time: '08:25 AM',
      gate: 'Entry Gate',
    },
    exit: {
      date: '2024-07-21',
      time: '10:01 AM',
      gate: 'Exit Gate',
      user: 'John Doe',
    },
    duration: '1h 36m',
    status: 'Paid',
    amount: '$5.50',
  },
  {
    ticketId: 'T84A1-47',
    plate: 'EF-6789',
    entry: {
      date: '2024-07-21',
      time: '08:30 AM',
      gate: 'Entry Gate',
    },
    exit: {
      date: '2024-07-21',
      time: '08:55 AM',
      gate: 'Exit Gate',
      user: 'Jane Smith',
    },
    duration: '25m',
    status: 'Paid',
    amount: '$2.00',
  },
  {
    ticketId: 'T84A1-48',
    plate: 'GH-1234',
    entry: {
      date: '2024-07-21',
      time: '08:41 AM',
      gate: 'Entry Gate',
    },
    exit: {
      date: '2024-07-21',
      time: '11:20 AM',
      gate: 'Garage P2 Exit',
      user: 'Jane Smith',
    },
    duration: '2h 39m',
    status: 'Paid',
    amount: '$8.00',
  },
  {
    ticketId: 'T84A1-49',
    plate: 'JK-5678',
    entry: {
      date: '2024-07-21',
      time: '09:02 AM',
      gate: 'Entry Gate',
    },
    exit: {
      date: '2024-07-21',
      time: '09:15 AM',
      gate: 'Exit Gate',
      user: 'John Doe',
    },
    duration: '13m',
    status: 'Paid',
    amount: '$2.00',
  },
  {
    ticketId: 'T84A1-50',
    plate: 'LM-9012',
    entry: {
      date: '2024-07-21',
      time: '09:05 AM',
      gate: 'Entry Gate',
    },
    exit: {
      date: '2024-07-21',
      time: '12:30 PM',
      gate: 'Exit Gate',
      user: 'John Doe',
    },
    duration: '3h 25m',
    status: 'Paid',
    amount: '$9.50',
  },
  {
    ticketId: 'T84A1-51',
    plate: 'CD-1123',
    entry: {
      date: '2024-07-21',
      time: '09:10 AM',
      gate: 'Entry Gate',
    },
    exit: {
      date: '2024-07-21',
      time: '10:10 AM',
      gate: 'Garage P2 Exit',
      user: 'Jane Smith',
    },
    duration: '1h 0m',
    status: 'Paid',
    amount: '$4.50',
  },
  {
    ticketId: 'T84A1-52',
    plate: 'DE-4455',
    entry: {
      date: '2024-07-21',
      time: '09:15 AM',
      gate: 'Entry Gate',
    },
    exit: {
      date: '2024-07-21',
      time: '09:30 AM',
      gate: 'Exit Gate',
      user: 'John Doe',
    },
    duration: '15m',
    status: 'Paid',
    amount: '$2.00',
  },
];

type Transaction = (typeof transactions)[0];

export function TransactionsTable() {
  const [selectedTransaction, setSelectedTransaction] =
    React.useState<Transaction | null>(null);

  const DetailRow = ({
    icon: Icon,
    label,
    value,
  }: {
    icon: React.ElementType;
    label: string;
    value: string | React.ReactNode;
  }) => (
    <div className="flex items-start justify-between py-2 border-b">
      <div className="flex items-center gap-3">
        <Icon className="size-5 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">{label}</span>
      </div>
      <span className="text-sm font-medium text-right">{value}</span>
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Detailed Transactions</CardTitle>
        <CardDescription>
          A detailed log of all transactions within the selected date range.
          Click a row to see more details.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Dialog>
          <ScrollArea className="h-[400px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ticket ID</TableHead>
                  <TableHead>Plate</TableHead>
                  <TableHead>Entry</TableHead>
                  <TableHead>Exit</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((tx) => (
                  <DialogTrigger asChild key={tx.ticketId}>
                    <TableRow
                      onClick={() => setSelectedTransaction(tx)}
                      className="cursor-pointer"
                    >
                      <TableCell className="font-medium">{tx.ticketId}</TableCell>
                      <TableCell>{tx.plate}</TableCell>
                      <TableCell>{tx.entry.time}</TableCell>
                      <TableCell>{tx.exit.time}</TableCell>
                      <TableCell>{tx.duration}</TableCell>
                      <TableCell>
                        <Badge
                          variant={tx.status === 'Paid' ? 'default' : 'secondary'}
                          className={
                            tx.status === 'Paid'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }
                        >
                          {tx.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">{tx.amount}</TableCell>
                    </TableRow>
                  </DialogTrigger>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>

          {selectedTransaction && (
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Transaction: {selectedTransaction.ticketId}</DialogTitle>
              </DialogHeader>
              <div className="space-y-2 py-4">
                <DetailRow
                  icon={Car}
                  label="License Plate"
                  value={selectedTransaction.plate}
                />
                <DetailRow
                  icon={DoorOpen}
                  label="Entry"
                  value={`${selectedTransaction.entry.date} at ${selectedTransaction.entry.time} via ${selectedTransaction.entry.gate}`}
                />
                 <DetailRow
                  icon={DoorOpen}
                  label="Exit"
                  value={`${selectedTransaction.exit.date} at ${selectedTransaction.exit.time} via ${selectedTransaction.exit.gate}`}
                />
                <DetailRow
                  icon={User}
                  label="Cashier"
                  value={selectedTransaction.exit.user}
                />
                <DetailRow
                  icon={Clock}
                  label="Total Parking Time"
                  value={selectedTransaction.duration}
                />
                 <DetailRow
                  icon={DollarSign}
                  label="Final Amount Paid"
                  value={
                    <span className="font-bold text-lg text-primary">
                        {selectedTransaction.amount}
                    </span>
                  }
                />
              </div>
            </DialogContent>
          )}
        </Dialog>
      </CardContent>
    </Card>
  );
}
