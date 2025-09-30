

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
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Users, PlusCircle, Edit, Mail, Loader2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { sendParkerNotification } from '@/app/actions';
import { Textarea } from '@/components/ui/textarea';
import { useTranslations } from 'next-intl';


type Parker = {
  id: number;
  name: string;
  plate: string;
  participation: 'daily' | 'weekly' | 'monthly' | 'yearly';
  type: 'tenant' | 'owner' | 'vip' | 'staff' | 'visitor';
  accessId: string;
  tel: string;
  email: string;
  dob: string;
  carModel: string;
};

const mockParkers: Parker[] = [
  { id: 1, name: 'Alice Johnson', plate: 'VIP-001', participation: 'monthly', type: 'vip', accessId: 'CARD-1001', tel: '555-1234', email: 'alice@example.com', dob: '1990-05-15', carModel: 'Tesla Model 3' },
  { id: 2, name: 'Bob Williams', plate: 'EMP-002', participation: 'yearly', type: 'staff', accessId: 'CARD-1002', tel: '555-5678', email: 'bob@example.com', dob: '1985-11-20', carModel: 'Ford F-150' },
  { id: 3, name: 'Charlie Brown', plate: 'WK-003', participation: 'weekly', type: 'tenant', accessId: 'QR-CODE-XYZ', tel: '555-9876', email: 'charlie@example.com', dob: '1998-02-10', carModel: 'Honda Civic' },
];

const participationOptions = ['daily', 'weekly', 'monthly', 'yearly'];
const parkerTypeOptions: Parker['type'][] = ['tenant', 'owner', 'vip', 'staff', 'visitor'];

const initialFormState = {
    name: '',
    plate: '',
    participation: 'monthly' as Parker['participation'],
    type: 'tenant' as Parker['type'],
    accessId: '',
    tel: '',
    email: '',
    dob: '',
    carModel: '',
};

export default function ParkersPage() {
  const t = useTranslations('Parkers');
  const { toast } = useToast();
  const [parkers, setParkers] = useState<Parker[]>(mockParkers);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingParker, setEditingParker] = useState<Parker | null>(null);
  const [notifyingParkerId, setNotifyingParkerId] = useState<number | null>(null);

  const [parkerForm, setParkerForm] = useState(initialFormState);

  const handleEditClick = (parker: Parker) => {
    setEditingParker(parker);
    setParkerForm({
        name: parker.name,
        plate: parker.plate,
        participation: parker.participation,
        type: parker.type,
        accessId: parker.accessId,
        tel: parker.tel,
        email: parker.email,
        dob: parker.dob,
        carModel: parker.carModel,
    });
    setIsDialogOpen(true);
  };
  
  const handleAddNewClick = () => {
    setEditingParker(null);
    setParkerForm(initialFormState);
    setIsDialogOpen(true);
  };

  const handleFormChange = (field: keyof typeof parkerForm, value: string) => {
    setParkerForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveChanges = () => {
    if (!parkerForm.name || !parkerForm.plate || !parkerForm.email) {
        toast({
            variant: "destructive",
            title: t('validationError'),
            description: t('validationMessage'),
        });
        return;
    }

    if (editingParker) {
        // Update existing parker
        setParkers(parkers.map(p => p.id === editingParker.id ? { ...editingParker, ...parkerForm } : p));
        toast({
            title: t('updated'),
            description: t('updatedMessage', {name: parkerForm.name}),
        });
    } else {
        // Add new parker
        const newParker: Parker = {
            id: Date.now(),
            ...parkerForm,
        };
        setParkers([...parkers, newParker]);
        toast({
            title: t('added'),
            description: t('addedMessage', {name: parkerForm.name}),
        });
    }
    setIsDialogOpen(false);
  };

  const handleNotifyParker = async (parker: Parker) => {
    setNotifyingParkerId(parker.id);

    // Mock data for the notification
    const notificationData = {
        name: parker.name,
        participation: parker.participation,
        balance: parker.participation === 'monthly' ? 150 : 1800, // Example balance
        dueDate: new Date(new Date().setDate(new Date().getDate() + 15)).toISOString().split('T')[0], // 15 days from now
    };

    const { data, error } = await sendParkerNotification(notificationData);
    setNotifyingParkerId(null);

    if (error) {
        toast({
            variant: "destructive",
            title: t('notifyFailed'),
            description: error,
        });
    } else if (data) {
        toast({
            title: t('emailGenerated', {name: parker.name}),
            description: (
                <div className="w-full">
                    <p className="font-semibold">{data.subject}</p>
                    <Textarea readOnly value={data.body} className="mt-2 h-48 w-full" />
                </div>
            ),
            duration: 15000,
        });
    }
  }


  return (
    <div className="flex flex-col h-full">
        <Header title={t('title')} />
        <main className="flex-1 p-4 md:p-6 lg:p-8">
            <Card>
                <CardHeader>
                    <div className="flex flex-wrap gap-4 justify-between items-center">
                        <div>
                            <CardTitle>{t('title')}</CardTitle>
                            <CardDescription>{t('description')}</CardDescription>
                        </div>
                        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                            <DialogTrigger asChild>
                                <Button onClick={handleAddNewClick}><PlusCircle className="mr-2" /> {t('addNew')}</Button>
                            </DialogTrigger>
                            <DialogContent className="max-h-[90vh] overflow-y-auto">
                                <DialogHeader>
                                    <DialogTitle>{editingParker ? t('editTitle') : t('addTitle')}</DialogTitle>
                                    <DialogDescription>
                                        {t('formDescription')}
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="name" className="text-right">{t('name')}</Label>
                                        <Input id="name" value={parkerForm.name} onChange={(e) => handleFormChange('name', e.target.value)} className="col-span-3" />
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="email" className="text-right">{t('email')}</Label>
                                        <Input id="email" type="email" value={parkerForm.email} onChange={(e) => handleFormChange('email', e.target.value)} className="col-span-3" />
                                    </div>
                                     <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="tel" className="text-right">{t('telephone')}</Label>
                                        <Input id="tel" type="tel" value={parkerForm.tel} onChange={(e) => handleFormChange('tel', e.target.value)} className="col-span-3" />
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="dob" className="text-right">{t('dob')}</Label>
                                        <Input id="dob" type="date" value={parkerForm.dob} onChange={(e) => handleFormChange('dob', e.target.value)} className="col-span-3" />
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="plate" className="text-right">{t('plate')}</Label>
                                        <Input id="plate" value={parkerForm.plate} onChange={(e) => handleFormChange('plate', e.target.value)} className="col-span-3" />
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="carModel" className="text-right">{t('carModel')}</Label>
                                        <Input id="carModel" value={parkerForm.carModel} onChange={(e) => handleFormChange('carModel', e.target.value)} className="col-span-3" />
                                    </div>
                                     <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="type" className="text-right">{t('type')}</Label>
                                        <Select value={parkerForm.type} onValueChange={(value: Parker['type']) => handleFormChange('type', value)}>
                                            <SelectTrigger className="col-span-3">
                                                <SelectValue placeholder={t('selectType')} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {parkerTypeOptions.map(opt => (
                                                    <SelectItem key={opt} value={opt}>
                                                        {t(`types.${opt}` as const)}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="participation" className="text-right">{t('participation')}</Label>
                                        <Select value={parkerForm.participation} onValueChange={(value: Parker['participation']) => handleFormChange('participation', value)}>
                                            <SelectTrigger className="col-span-3">
                                                <SelectValue placeholder={t('selectType')} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {participationOptions.map(opt => (
                                                    <SelectItem key={opt} value={opt}>
                                                        {t(`participations.${opt}` as const)}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="accessId" className="text-right">{t('accessId')}</Label>
                                        <Input id="accessId" value={parkerForm.accessId} onChange={(e) => handleFormChange('accessId', e.target.value)} className="col-span-3" placeholder={t('accessIdPlaceholder')} />
                                    </div>
                                </div>
                                <DialogFooter>
                                    <DialogClose asChild><Button variant="outline">{t('cancel')}</Button></DialogClose>
                                    <Button onClick={handleSaveChanges}>{t('save')}</Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>
                </CardHeader>
                <CardContent>
                    <ScrollArea className="h-[60vh]">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>{t('name')}</TableHead>
                                    <TableHead>{t('email')}</TableHead>
                                    <TableHead>{t('type')}</TableHead>
                                    <TableHead>{t('plate')}</TableHead>
                                    <TableHead>{t('carModel')}</TableHead>
                                    <TableHead>{t('participation')}</TableHead>
                                    <TableHead>{t('accessId')}</TableHead>
                                    <TableHead className="text-right">{t('actions')}</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {parkers.map(parker => (
                                    <TableRow key={parker.id}>
                                        <TableCell className="font-medium">{parker.name}</TableCell>
                                        <TableCell>{parker.email}</TableCell>
                                        <TableCell>
                                             <Badge variant="outline">{t(`types.${parker.type}` as const)}</Badge>
                                        </TableCell>
                                        <TableCell>{parker.plate}</TableCell>
                                        <TableCell>{parker.carModel}</TableCell>
                                        <TableCell>
                                            <Badge variant="secondary">{t(`participations.${parker.participation}` as const)}</Badge>
                                        </TableCell>
                                        <TableCell>{parker.accessId}</TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="icon" onClick={() => handleNotifyParker(parker)} disabled={notifyingParkerId === parker.id}>
                                                {notifyingParkerId === parker.id ? <Loader2 className="size-4 animate-spin" /> : <Mail className="size-4" />}
                                            </Button>
                                            <Button variant="ghost" size="icon" onClick={() => handleEditClick(parker)}>
                                                <Edit className="size-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </ScrollArea>
                </CardContent>
            </Card>
        </main>
    </div>
  )
}
