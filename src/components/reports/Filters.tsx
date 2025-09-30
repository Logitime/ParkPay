
"use client";

import { DateRangePicker } from "./DateRangePicker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { mockCashiers, mockGates } from "@/lib/mock-data";
import { User, Clock, DoorOpen } from "lucide-react";
import { DateRange } from "react-day-picker";
import { useTranslations } from "next-intl";


type FiltersProps = {
    date: DateRange | undefined;
    onDateChange: (date: DateRange | undefined) => void;
    selectedCashier: string;
    onCashierChange: (value: string) => void;
    selectedShift: string;
    onShiftChange: (value: string) => void;
    selectedGate: string;
    onGateChange: (value: string) => void;
}

export function Filters({
    date,
    onDateChange,
    selectedCashier,
    onCashierChange,
    selectedShift,
    onShiftChange,
    selectedGate,
    onGateChange
}: FiltersProps) {
  const t = useTranslations('Reports');
  return (
    <div className="flex flex-wrap items-center gap-4">
      <DateRangePicker date={date} onDateChange={onDateChange} />
       <Select value={selectedCashier} onValueChange={onCashierChange}>
        <SelectTrigger className="w-full sm:w-[180px]">
          <div className="flex items-center gap-2">
            <User className="size-4" />
            <SelectValue placeholder={t('allCashiers')} />
          </div>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t('allCashiers')}</SelectItem>
          {mockCashiers.filter(c => c.role === 'cashier').map(cashier => (
              <SelectItem key={cashier.id} value={cashier.id.toString()}>
                  {cashier.name}
              </SelectItem>
          ))}
        </SelectContent>
      </Select>
       <Select value={selectedShift} onValueChange={onShiftChange}>
        <SelectTrigger className="w-full sm:w-[180px]">
            <div className="flex items-center gap-2">
                <Clock className="size-4" />
                <SelectValue placeholder={t('allDay')} />
            </div>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t('allDay')}</SelectItem>
          <SelectItem value="morning">{t('morningShift')}</SelectItem>
          <SelectItem value="evening">{t('eveningShift')}</SelectItem>
        </SelectContent>
      </Select>
      <Select value={selectedGate} onValueChange={onGateChange}>
        <SelectTrigger className="w-full sm:w-[180px]">
            <div className="flex items-center gap-2">
                <DoorOpen className="size-4" />
                <SelectValue placeholder={t('allGates')} />
            </div>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t('allGates')}</SelectItem>
          {mockGates.map(gate => (
              <SelectItem key={gate.id} value={gate.id.toString()}>
                  {gate.name}
              </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
