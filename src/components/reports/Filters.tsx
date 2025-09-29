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
  return (
    <div className="flex flex-wrap items-center gap-4">
      <DateRangePicker date={date} onDateChange={onDateChange} />
       <Select value={selectedCashier} onValueChange={onCashierChange}>
        <SelectTrigger className="w-[180px]">
          <div className="flex items-center gap-2">
            <User className="size-4" />
            <SelectValue placeholder="All Cashiers" />
          </div>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Cashiers</SelectItem>
          {mockCashiers.filter(c => c.role === 'cashier').map(cashier => (
              <SelectItem key={cashier.id} value={cashier.id.toString()}>
                  {cashier.name}
              </SelectItem>
          ))}
        </SelectContent>
      </Select>
       <Select value={selectedShift} onValueChange={onShiftChange}>
        <SelectTrigger className="w-[180px]">
            <div className="flex items-center gap-2">
                <Clock className="size-4" />
                <SelectValue placeholder="All Day" />
            </div>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Day</SelectItem>
          <SelectItem value="morning">Morning Shift (8am-4pm)</SelectItem>
          <SelectItem value="evening">Evening Shift (4pm-12am)</SelectItem>
        </SelectContent>
      </Select>
      <Select value={selectedGate} onValueChange={onGateChange}>
        <SelectTrigger className="w-[180px]">
            <div className="flex items-center gap-2">
                <DoorOpen className="size-4" />
                <SelectValue placeholder="All Gates" />
            </div>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Gates</SelectItem>
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
