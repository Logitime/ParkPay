

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
import { useTranslations } from 'next-intl';

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
  const t = useTranslations('Returns');
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
        title: t('notFound'),
        description: t('notFoundDescription'),
      });
    }
  };

  const applyDiscount = () => {
    if (!foundTransaction) return;

    let newFinalAmount = foundTransaction.amount;
    const value = parseFloat(discountValue);

    if (isNaN(value) || value < 0) {
        toast({ variant: 'destructive', title: t('invalidDiscount'), description: t('positiveNumber')});
        return;
    }

    if (discountType === 'percentage') {
      if (value > 100) {
          toast({ variant: 'destructive', title: t('invalidDiscount'), description: t('percentTooHigh')});
          return;
      }
      newFinalAmount = foundTransaction.amount * (1 - value / 100);
    } else if (discountType === 'fixed') {
       if (value > foundTransaction.amount) {
          toast({ variant: 'destructive', title: t('invalidDiscount'), description: t('fixedTooHigh')});
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
      title: t('refundProcessed'),
      description: t('refundProcessedDescription', {amount: foundTransaction?.amount.toFixed(2), ticketId: foundTransaction?.ticketId, reason}),
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
      title: t('discountProcessed'),
      description: t('discountProcessedDescription', {refundedAmount: refundedAmount.toFixed(2), reason, finalAmount: finalAmount.toFixed(2)}),
       className: "bg-green-100 text-green-800"
    });
    // Reset state
    setFoundTransaction(null);
    setTicketId('');
    setReason('');
  }

  const reasonOptions = {
    "Customer Complaint": "complaint",
    "Promotional Offer": "promo",
    "Service Issue": "issue",
    "Employee Discount": "employee",
    "Goodwill Gesture": "goodwill",
    "Other": "other"
  };

  return (
    <div className="flex flex-col h-full">
      <Header title={t('title')} />
      <main className="flex-1 p-4 md:p-6 lg:p-8">
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle>{t('title')}</CardTitle>
            <CardDescription>{t('description')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex w-full max-w-sm items-center space-x-2">
              <Input
                type="text"
                placeholder={t('findPlaceholder')}
                value={ticketId}
                onChange={(e) => setTicketId(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleFindTransaction()}
              />
              <Button onClick={handleFindTransaction}><Search className="mr-2" /> {t('find')}</Button>
            </div>
            
            <Separator />

            {foundTransaction ? (
              <div className="grid gap-6 md:grid-cols-2">
                {/* Ticket Details */}
                <div>
                  <h3 className="font-semibold text-lg mb-4">{t('details')}</h3>
                  <div className="space-y-4 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t('ticketId')}</span>
                      <span className="font-medium">{foundTransaction.ticketId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t('plate')}</span>
                      <span className="font-medium">{foundTransaction.plate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t('exitTime')}</span>
                      <span className="font-medium">{foundTransaction.exit}</span>
                    </div>
                     <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">{t('status')}</span>
                      <Badge variant="default" className={'bg-green-100 text-green-800'}>
                        {foundTransaction.status}
                      </Badge>
                    </div>
                    <Separator />
                    <div className="flex justify-between text-lg">
                      <span className="font-semibold">{t('originalAmount')}</span>
                      <span className="font-bold text-primary">${foundTransaction.amount.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Discount/Refund Section */}
                <div>
                   <h3 className="font-semibold text-lg mb-4">{t('applyAdjustment')}</h3>
                   <div className="space-y-4">
                     <RadioGroup value={discountType} onValueChange={(value: DiscountType) => setDiscountType(value)}>
                       <div className="flex items-center space-x-2">
                         <RadioGroupItem value="none" id="r-none" />
                         <Label htmlFor="r-none">{t('noDiscount')}</Label>
                       </div>
                       <div className="flex items-center space-x-2">
                         <RadioGroupItem value="percentage" id="r-percent" />
                         <Label htmlFor="r-percent">{t('percentageDiscount')}</Label>
                       </div>
                       <div className="flex items-center space-x-2">
                         <RadioGroupItem value="fixed" id="r-fixed" />
                         <Label htmlFor="r-fixed">{t('fixedDiscount')}</Label>
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
                            <Button variant="outline" onClick={applyDiscount}>{t('apply')}</Button>
                        </div>
                     )}
                    
                    <div className="space-y-2">
                        <Label htmlFor="reason">{t('reason')}</Label>
                        <Select value={reason} onValueChange={setReason}>
                            <SelectTrigger id="reason">
                                <SelectValue placeholder={t('selectReason')} />
                            </SelectTrigger>
                            <SelectContent>
                                {adjustmentReasons.map(r => (
                                    <SelectItem key={r} value={r}>{t(`reasons.${reasonOptions[r as keyof typeof reasonOptions]}` as const)}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>


                    <Separator />

                     <div className="p-4 bg-muted/50 rounded-lg space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">{t('originalAmount')}</span>
                            <span>${foundTransaction.amount.toFixed(2)}</span>
                        </div>
                         <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">{t('discount')}</span>
                            <span>-${(foundTransaction.amount - (finalAmount ?? foundTransaction.amount)).toFixed(2)}</span>
                        </div>
                         <div className="flex justify-between font-semibold text-lg">
                            <span>{t('newFinalAmount')}</span>
                            <span className="text-green-600">${(finalAmount ?? foundTransaction.amount).toFixed(2)}</span>
                        </div>
                     </div>
                   </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <Ticket className="size-16 text-muted-foreground/50" />
                <p className="mt-4 text-muted-foreground">{t('findPlaceholder')}</p>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-end gap-2">
            <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button variant="destructive" disabled={!foundTransaction}>
                        <RotateCcw className="mr-2" /> {t('fullRefund')}
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                    <AlertDialogTitle>{t('confirmRefund')}</AlertDialogTitle>
                    <AlertDialogDescription>
                        {t('confirmRefundDescription', {amount: foundTransaction?.amount.toFixed(2), ticketId: foundTransaction?.ticketId})}
                    </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleProcessRefund} className="bg-destructive hover:bg-destructive/90">Confirm Refund</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            <Button onClick={handleProcessDiscount} disabled={!foundTransaction || finalAmount === foundTransaction.amount || discountType === 'none'}>
                {t('processDiscount')}
            </Button>
          </CardFooter>
        </Card>
      </main>
    </div>
  );
}
