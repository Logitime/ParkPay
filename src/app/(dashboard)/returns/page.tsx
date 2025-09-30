'use client';

import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Ticket, Search, Percent, DollarSign, RotateCcw, MessageSquare } from 'lucide-react';
import { initialMockTransactions } from '@/lib/mock-data';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type Transaction = typeof initialMockTransactions[0];
type DiscountType = 'none' | 'percentage' | 'fixed';

const adjustmentReasons = [
    "Customer Complaint",
    "Promotional Offer",
    "Service Issue",
    "Employee Discount",
    "Goodwill Gesture",
    "Other",
];


export default function ReturnsPage() {
  const { toast } = useToast();
  const [ticketId, setTicketId] = useState('');
  const [foundTransaction, setFoundTransaction] = useState<Transaction | null>(null);
  const [discountType, setDiscountType] = useState<DiscountType>('none');
  const [discountValue, setDiscountValue] = useState('');
  const [finalAmount, setFinalAmount] = useState<number | null>(null);
  const [reason, setReason] = useState('');

  const handleFindTransaction = () => {
    // In a real app, you would fetch this from your database
    const transaction = initialMockTransactions.find(tx => tx.ticketId.toLowerCase() === ticketId.toLowerCase());
    
    if (transaction) {
      setFoundTransaction(transaction);
      setFinalAmount(transaction.amount);
      setDiscountType('none');
      setDiscountValue('');
      setReason('');
      toast({
        title: "Transaction Found",
        description: `Details for ticket ${transaction.ticketId} loaded.`,
      });
    } else {
      setFoundTransaction(null);
      setFinalAmount(null);
      toast({
        variant: "destructive",
        title: "Transaction Not Found",
        description: "No paid transaction found with that ID.",
      });
    }
  };

  const applyDiscount = () => {
    if (!foundTransaction) return;

    let newFinalAmount = foundTransaction.amount;
    const value = parseFloat(discountValue);

    if (isNaN(value) || value < 0) {
        toast({ variant: 'destructive', title: 'Invalid Discount', description: 'Please enter a positive number.'});
        return;
    }

    if (discountType === 'percentage') {
      if (value > 100) {
          toast({ variant: 'destructive', title: 'Invalid Discount', description: 'Percentage cannot exceed 100.'});
          return;
      }
      newFinalAmount = foundTransaction.amount * (1 - value / 100);
    } else if (discountType === 'fixed') {
       if (value > foundTransaction.amount) {
          toast({ variant: 'destructive', title: 'Invalid Discount', description: 'Fixed amount cannot exceed original fee.'});
          return;
      }
      newFinalAmount = foundTransaction.amount - value;
    } else {
        newFinalAmount = foundTransaction.amount;
    }

    setFinalAmount(newFinalAmount);
  };
  
  const handleProcessRefund = () => {
     if (!reason) {
        toast({ variant: 'destructive', title: 'Reason Required', description: 'Please select a reason for the refund.'});
        return;
    }
    // In a real app, this would update the transaction status in the DB
    // and potentially trigger a refund through a payment provider API.
    toast({
      title: "Refund Processed",
      description: `Full refund of $${foundTransaction?.amount.toFixed(2)} issued for ticket ${foundTransaction?.ticketId}. Reason: ${reason}`,
      className: "bg-blue-100 text-blue-800"
    });
    // Reset state
    setFoundTransaction(null);
    setTicketId('');
    setReason('');
  }

   const handleProcessDiscount = () => {
    if (finalAmount === null || !foundTransaction) return;
    if (!reason) {
        toast({ variant: 'destructive', title: 'Reason Required', description: 'Please select a reason for the discount.'});
        return;
    }

    const refundedAmount = foundTransaction.amount - finalAmount;
    
    toast({
      title: "Discount Processed",
      description: `Partial refund of $${refundedAmount.toFixed(2)} issued for reason: ${reason}. New total: $${finalAmount.toFixed(2)}.`,
       className: "bg-green-100 text-green-800"
    });
    // Reset state
    setFoundTransaction(null);
    setTicketId('');
    setReason('');
  }

  return (
    <div className="flex flex-col h-full">
      <Header title="Returns & Discounts" />
      <main className="flex-1 p-4 md:p-6 lg:p-8">
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle>Returns & Discounts</CardTitle>
            <CardDescription>Find a completed transaction to issue a discount or a full refund.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex w-full max-w-sm items-center space-x-2">
              <Input
                type="text"
                placeholder="Enter Paid Ticket ID..."
                value={ticketId}
                onChange={(e) => setTicketId(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleFindTransaction()}
              />
              <Button onClick={handleFindTransaction}><Search className="mr-2" /> Find Transaction</Button>
            </div>
            
            <Separator />

            {foundTransaction ? (
              <div className="grid gap-6 md:grid-cols-2">
                {/* Ticket Details */}
                <div>
                  <h3 className="font-semibold text-lg mb-4">Transaction Details</h3>
                  <div className="space-y-4 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Ticket ID</span>
                      <span className="font-medium">{foundTransaction.ticketId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Plate</span>
                      <span className="font-medium">{foundTransaction.plate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Exit Time</span>
                      <span className="font-medium">{foundTransaction.exit}</span>
                    </div>
                     <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Status</span>
                      <Badge variant="default" className={'bg-green-100 text-green-800'}>
                        {foundTransaction.status}
                      </Badge>
                    </div>
                    <Separator />
                    <div className="flex justify-between text-lg">
                      <span className="font-semibold">Original Amount Paid</span>
                      <span className="font-bold text-primary">${foundTransaction.amount.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Discount/Refund Section */}
                <div>
                   <h3 className="font-semibold text-lg mb-4">Apply Adjustment</h3>
                   <div className="space-y-4">
                     <RadioGroup value={discountType} onValueChange={(value: DiscountType) => setDiscountType(value)}>
                       <div className="flex items-center space-x-2">
                         <RadioGroupItem value="none" id="r-none" />
                         <Label htmlFor="r-none">No Discount</Label>
                       </div>
                       <div className="flex items-center space-x-2">
                         <RadioGroupItem value="percentage" id="r-percent" />
                         <Label htmlFor="r-percent">Percentage Discount</Label>
                       </div>
                       <div className="flex items-center space-x-2">
                         <RadioGroupItem value="fixed" id="r-fixed" />
                         <Label htmlFor="r-fixed">Fixed Amount Discount</Label>
                       </div>
                     </RadioGroup>
                     
                     {discountType !== 'none' && (
                        <div className="flex items-center gap-2">
                            {discountType === 'percentage' && <Percent className="size-5 text-muted-foreground" />}
                            {discountType === 'fixed' && <DollarSign className="size-5 text-muted-foreground" />}
                            <Input 
                                type="number" 
                                placeholder={discountType === 'percentage' ? "e.g., 10 for 10%" : "e.g., 5.00"}
                                value={discountValue}
                                onChange={(e) => setDiscountValue(e.target.value)}
                            />
                            <Button variant="outline" onClick={applyDiscount}>Apply</Button>
                        </div>
                     )}
                    
                    <div className="space-y-2">
                        <Label htmlFor="reason">Reason for Adjustment</Label>
                        <Select value={reason} onValueChange={setReason}>
                            <SelectTrigger id="reason">
                                <SelectValue placeholder="Select a reason..." />
                            </SelectTrigger>
                            <SelectContent>
                                {adjustmentReasons.map(r => (
                                    <SelectItem key={r} value={r}>{r}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>


                    <Separator />

                     <div className="p-4 bg-muted/50 rounded-lg space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Original Amount</span>
                            <span>${foundTransaction.amount.toFixed(2)}</span>
                        </div>
                         <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Discount</span>
                            <span>-${(foundTransaction.amount - (finalAmount ?? foundTransaction.amount)).toFixed(2)}</span>
                        </div>
                         <div className="flex justify-between font-semibold text-lg">
                            <span>New Final Amount</span>
                            <span className="text-green-600">${(finalAmount ?? foundTransaction.amount).toFixed(2)}</span>
                        </div>
                     </div>
                   </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <Ticket className="size-16 text-muted-foreground/50" />
                <p className="mt-4 text-muted-foreground">Enter Paid Ticket ID...</p>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-end gap-2">
            <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button variant="destructive" disabled={!foundTransaction}>
                        <RotateCcw className="mr-2" /> Issue Full Refund
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                    <AlertDialogTitle>Confirm Full Refund</AlertDialogTitle>
                    <AlertDialogDescription>
                        This will process a full refund of ${foundTransaction?.amount.toFixed(2)} for ticket {foundTransaction?.ticketId}. This action cannot be undone.
                    </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleProcessRefund} className="bg-destructive hover:bg-destructive/90">Confirm Refund</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            <Button onClick={handleProcessDiscount} disabled={!foundTransaction || finalAmount === foundTransaction.amount || discountType === 'none'}>
                Process Discount
            </Button>
          </CardFooter>
        </Card>
      </main>
    </div>
  );
}
