"use client";

import { DateRangePicker } from "./DateRangePicker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { mockCashiers } from "@/lib/mock-data";
import { User, Clock } from "lucide-react";

export function Filters() {
  return (
    <div className="flex flex-wrap items-center gap-4">
      <DateRangePicker />
       <Select>
        <SelectTrigger className="w-[180px]">
          <div className="flex items-center gap-2">
            <User className="size-4" />
            <SelectValue placeholder="All Cashiers" />
          </div>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Cashiers</SelectItem>
          {mockCashiers.map(cashier => (
              <SelectItem key={cashier.id} value={cashier.id.toString()}>
                  {cashier.name}
              </SelectItem>
          ))}
        </SelectContent>
      </Select>>
       <Select>
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
    </div>
  );
}
