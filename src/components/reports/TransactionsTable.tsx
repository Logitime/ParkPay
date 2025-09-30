'use client';

import * as React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
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
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Car, Clock, DollarSign, DoorOpen, User, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';


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

function TransactionRow({ transaction }: { transaction: Transaction }) {
  const dialogContentRef = React.useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const handlePrint = () => {
    const content = dialogContentRef.current;
    if (!content) {
        toast({
            variant: "destructive",
            title: "Print Error",
            description: "Could not find receipt content to print.",
        });
        return;
    }

    const printWindow = window.open('', '', 'height=600,width=800');
    if (printWindow) {
        printWindow.document.write('<html><head><title>Transaction Receipt</title>');
        // You can link to an external stylesheet or inject styles directly
        printWindow.document.write(`
            <style>
                body { font-family: sans-serif; }
                .receipt-details { margin-top: 20px; }
                .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
                .detail-label { color: #555; }
                .detail-value { font-weight: bold; }
                .final-amount .detail-value { font-size: 1.2em; color: #000; }
            </style>
        `);
        printWindow.document.write('</head><body>');
        printWindow.document.write(content.innerHTML);
        printWindow.document.write('</body></html>');
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
             printWindow.print();
             printWindow.close();
        }, 250);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <TableRow className="cursor-pointer">
          <TableCell className="font-medium">{transaction.ticketId}</TableCell>
          <TableCell>{transaction.plate}</TableCell>
          <TableCell>{transaction.entry.time}</TableCell>
          <TableCell>{transaction.exit.time}</TableCell>
          <TableCell>{transaction.duration}</TableCell>
          <TableCell>
            <Badge
              variant={transaction.status === 'Paid' ? 'default' : 'secondary'}
              className={
                transaction.status === 'Paid'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-yellow-100 text-yellow-800'
              }
            >
              {transaction.status}
            </Badge>
          </TableCell>
          <TableCell className="text-right">{transaction.amount}</TableCell>
        </TableRow>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Transaction: {transaction.ticketId}</DialogTitle>
        </DialogHeader>
        <div ref={dialogContentRef} className="printable-area space-y-2 py-4">
          <DetailRow
            icon={Car}
            label="Plate"
            value={transaction.plate}
          />
          <DetailRow
            icon={DoorOpen}
            label="Entry"
            value={`${transaction.entry.date} at ${transaction.entry.time} via ${transaction.entry.gate}`}
          />
           <DetailRow
            icon={DoorOpen}
            label="Exit"
            value={`${transaction.exit.date} at ${transaction.exit.time} via ${transaction.exit.gate}`}
          />
          <DetailRow
            icon={User}
            label="Cashier"
            value={transaction.exit.user}
          />
          <DetailRow
            icon={Clock}
            label="Total Parking Time"
            value={transaction.duration}
          />
           <DetailRow
            icon={DollarSign}
            label="Final Amount Paid"
            value={
              <span className="font-bold text-lg text-primary">
                  {transaction.amount}
              </span>
            }
          />
        </div>
        <DialogFooter className="no-print">
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="mr-2" />
            Print
          </Button>
          <DialogClose asChild>
            <Button>Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


export function TransactionsTable({ filters }: { filters: any }) {
    // In a real app, you would use the `filters` prop to fetch and display dynamic data.
  return (
    <Card>
      <CardHeader>
        <CardTitle>Detailed Transactions</CardTitle>
        <CardDescription>
          A detailed log of all transactions within the selected date range. Click a row to see more details.
        </CardDescription>
      </CardHeader>
      <CardContent>
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
                <TransactionRow key={tx.ticketId} transaction={tx} />
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
