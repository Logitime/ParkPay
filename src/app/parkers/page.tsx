
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
import { Users, PlusCircle, Edit } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

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
  const { toast } = useToast();
  const [parkers, setParkers] = useState<Parker[]>(mockParkers);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingParker, setEditingParker] = useState<Parker | null>(null);

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
            title: "Validation Error",
            description: "Name, License Plate, and Email cannot be empty.",
        });
        return;
    }

    if (editingParker) {
        // Update existing parker
        setParkers(parkers.map(p => p.id === editingParker.id ? { ...editingParker, ...parkerForm } : p));
        toast({
            title: "Parker Updated",
            description: `Details for ${parkerForm.name} have been updated.`,
        });
    } else {
        // Add new parker
        const newParker: Parker = {
            id: Date.now(),
            ...parkerForm,
        };
        setParkers([...parkers, newParker]);
        toast({
            title: "Parker Added",
            description: `${parkerForm.name} has been added to the system.`,
        });
    }
    setIsDialogOpen(false);
  };


  return (
    <div className="flex flex-col h-full">
        <Header title="Parker Management" />
        <main className="flex-1 p-4 md:p-6 lg:p-8">
            <Card>
                <CardHeader>
                    <div className="flex flex-wrap gap-4 justify-between items-center">
                        <div>
                            <CardTitle>Registered Parkers</CardTitle>
                            <CardDescription>Manage long-term subscribers and their access credentials.</CardDescription>
                        </div>
                        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                            <DialogTrigger asChild>
                                <Button onClick={handleAddNewClick}><PlusCircle className="mr-2" /> Add New Parker</Button>
                            </DialogTrigger>
                            <DialogContent className="max-h-[90vh] overflow-y-auto">
                                <DialogHeader>
                                    <DialogTitle>{editingParker ? "Edit Parker" : "Add New Parker"}</DialogTitle>
                                    <DialogDescription>
                                        Fill in the details below to register a new long-term parker.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="name" className="text-right">Name</Label>
                                        <Input id="name" value={parkerForm.name} onChange={(e) => handleFormChange('name', e.target.value)} className="col-span-3" />
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="email" className="text-right">Email</Label>
                                        <Input id="email" type="email" value={parkerForm.email} onChange={(e) => handleFormChange('email', e.target.value)} className="col-span-3" />
                                    </div>
                                     <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="tel" className="text-right">Telephone</Label>
                                        <Input id="tel" type="tel" value={parkerForm.tel} onChange={(e) => handleFormChange('tel', e.target.value)} className="col-span-3" />
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="dob" className="text-right">Date of Birth</Label>
                                        <Input id="dob" type="date" value={parkerForm.dob} onChange={(e) => handleFormChange('dob', e.target.value)} className="col-span-3" />
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="plate" className="text-right">License Plate</Label>
                                        <Input id="plate" value={parkerForm.plate} onChange={(e) => handleFormChange('plate', e.target.value)} className="col-span-3" />
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="carModel" className="text-right">Car Model</Label>
                                        <Input id="carModel" value={parkerForm.carModel} onChange={(e) => handleFormChange('carModel', e.target.value)} className="col-span-3" />
                                    </div>
                                     <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="type" className="text-right">Parker Type</Label>
                                        <Select value={parkerForm.type} onValueChange={(value: Parker['type']) => handleFormChange('type', value)}>
                                            <SelectTrigger className="col-span-3">
                                                <SelectValue placeholder="Select type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {parkerTypeOptions.map(opt => (
                                                    <SelectItem key={opt} value={opt}>
                                                        {opt.charAt(0).toUpperCase() + opt.slice(1)}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="participation" className="text-right">Participation</Label>
                                        <Select value={parkerForm.participation} onValueChange={(value: Parker['participation']) => handleFormChange('participation', value)}>
                                            <SelectTrigger className="col-span-3">
                                                <SelectValue placeholder="Select type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {participationOptions.map(opt => (
                                                    <SelectItem key={opt} value={opt}>
                                                        {opt.charAt(0).toUpperCase() + opt.slice(1)}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="accessId" className="text-right">Access Card/ID</Label>
                                        <Input id="accessId" value={parkerForm.accessId} onChange={(e) => handleFormChange('accessId', e.target.value)} className="col-span-3" placeholder="e.g., RFID Card Number" />
                                    </div>
                                </div>
                                <DialogFooter>
                                    <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                                    <Button onClick={handleSaveChanges}>Save Changes</Button>
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
                                    <TableHead>Name</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>License Plate</TableHead>
                                    <TableHead>Car Model</TableHead>
                                    <TableHead>Participation</TableHead>
                                    <TableHead>Access ID</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {parkers.map(parker => (
                                    <TableRow key={parker.id}>
                                        <TableCell className="font-medium">{parker.name}</TableCell>
                                        <TableCell>{parker.email}</TableCell>
                                        <TableCell>
                                             <Badge variant="outline">{parker.type.charAt(0).toUpperCase() + parker.type.slice(1)}</Badge>
                                        </TableCell>
                                        <TableCell>{parker.plate}</TableCell>
                                        <TableCell>{parker.carModel}</TableCell>
                                        <TableCell>
                                            <Badge variant="secondary">{parker.participation.charAt(0).toUpperCase() + parker.participation.slice(1)}</Badge>
                                        </TableCell>
                                        <TableCell>{parker.accessId}</TableCell>
                                        <TableCell className="text-right">
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

    