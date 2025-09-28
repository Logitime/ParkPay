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

const transactions = [
    { ticketId: "T84A1-45", plate: "AD-4589", entry: "08:12 AM", exit: "09:45 AM", duration: "1h 33m", status: "Paid", amount: "$5.50" },
    { ticketId: "T84A1-46", plate: "BC-9102", entry: "08:25 AM", exit: "10:01 AM", duration: "1h 36m", status: "Paid", amount: "$5.50" },
    { ticketId: "T84A1-47", plate: "EF-6789", entry: "08:30 AM", exit: "08:55 AM", duration: "25m", status: "Paid", amount: "$2.00" },
    { ticketId: "T84A1-48", plate: "GH-1234", entry: "08:41 AM", exit: "11:20 AM", duration: "2h 39m", status: "Paid", amount: "$8.00" },
    { ticketId: "T84A1-49", plate: "JK-5678", entry: "09:02 AM", exit: "09:15 AM", duration: "13m", status: "Paid", amount: "$2.00" },
    { ticketId: "T84A1-50", plate: "LM-9012", entry: "09:05 AM", exit: "12:30 PM", duration: "3h 25m", status: "Paid", amount: "$9.50" },
    { ticketId: "T84A1-51", plate: "CD-1123", entry: "09:10 AM", exit: "10:10 AM", duration: "1h 0m", status: "Paid", amount: "$4.50" },
    { ticketId: "T84A1-52", plate: "DE-4455", entry: "09:15 AM", exit: "09:30 AM", duration: "15m", status: "Paid", amount: "$2.00" },
];

export function TransactionsTable() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Detailed Transactions</CardTitle>
        <CardDescription>
          A detailed log of all transactions within the selected date range.
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
                <TableRow key={tx.ticketId}>
                    <TableCell className="font-medium">{tx.ticketId}</TableCell>
                    <TableCell>{tx.plate}</TableCell>
                    <TableCell>{tx.entry}</TableCell>
                    <TableCell>{tx.exit}</TableCell>
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
                ))}
            </TableBody>
            </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
