"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Badge } from "./badge"

type ComboboxProps = {
  options: { value: string; label: string }[];
  selected: string[];
  onSelectedChange: (selected: string[]) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  notFoundPlaceholder?: string;
  className?: string;
};

export function Combobox({
  options,
  selected,
  onSelectedChange,
  placeholder = "Select options...",
  searchPlaceholder = "Search options...",
  notFoundPlaceholder = "No option found.",
  className,
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false)

  const handleUnselect = (item: string) => {
    onSelectedChange(selected.filter((i) => i !== item))
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild className={className}>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between h-auto"
        >
          <div className="flex gap-1 flex-wrap">
            {selected.length > 0 ? (
              options
                .filter((item) => selected.includes(item.value))
                .map((item) => (
                  <Badge
                    variant="secondary"
                    key={item.value}
                    className="mr-1"
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleUnselect(item.value)
                    }}
                  >
                    {item.label}
                  </Badge>
                ))
            ) : (
              placeholder
            )}
          </div>
          <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
        <Command>
          <CommandInput placeholder={searchPlaceholder} />
          <CommandEmpty>{notFoundPlaceholder}</CommandEmpty>
          <CommandList>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  onSelect={() => {
                    const newSelected = selected.includes(option.value)
                      ? selected.filter((item) => item !== option.value)
                      : [...selected, option.value];
                    onSelectedChange(newSelected);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      selected.includes(option.value) ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
