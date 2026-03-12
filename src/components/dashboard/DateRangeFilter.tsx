import { useState } from "react";
import { format, subDays, startOfDay, endOfDay } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export interface DateRange {
  from: Date;
  to: Date;
}

const PRESETS = [
  { label: "7d", days: 7 },
  { label: "30d", days: 30 },
  { label: "90d", days: 90 },
  { label: "All", days: 0 },
];

interface Props {
  value: DateRange | null;
  onChange: (range: DateRange | null) => void;
}

export function DateRangeFilter({ value, onChange }: Props) {
  const [fromOpen, setFromOpen] = useState(false);
  const [toOpen, setToOpen] = useState(false);

  return (
    <div className="flex flex-wrap items-center gap-2">
      {PRESETS.map((p) => (
        <Button
          key={p.label}
          size="sm"
          variant={
            p.days === 0 && !value
              ? "default"
              : value &&
                p.days > 0 &&
                Math.abs(
                  (value.to.getTime() - value.from.getTime()) / 86400000 - p.days
                ) < 1.5
              ? "default"
              : "outline"
          }
          onClick={() => {
            if (p.days === 0) {
              onChange(null);
            } else {
              onChange({
                from: startOfDay(subDays(new Date(), p.days)),
                to: endOfDay(new Date()),
              });
            }
          }}
        >
          {p.label}
        </Button>
      ))}

      <Popover open={fromOpen} onOpenChange={setFromOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className={cn("min-w-[120px] justify-start text-left font-normal", !value?.from && "text-muted-foreground")}>
            <CalendarIcon className="mr-1 h-3 w-3" />
            {value?.from ? format(value.from, "MMM d, yyyy") : "From"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={value?.from}
            onSelect={(d) => {
              if (d) {
                onChange({ from: startOfDay(d), to: value?.to || endOfDay(new Date()) });
                setFromOpen(false);
              }
            }}
            disabled={(d) => d > new Date()}
            initialFocus
            className="p-3 pointer-events-auto"
          />
        </PopoverContent>
      </Popover>

      <Popover open={toOpen} onOpenChange={setToOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className={cn("min-w-[120px] justify-start text-left font-normal", !value?.to && "text-muted-foreground")}>
            <CalendarIcon className="mr-1 h-3 w-3" />
            {value?.to ? format(value.to, "MMM d, yyyy") : "To"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={value?.to}
            onSelect={(d) => {
              if (d) {
                onChange({ from: value?.from || startOfDay(subDays(d, 30)), to: endOfDay(d) });
                setToOpen(false);
              }
            }}
            disabled={(d) => d > new Date()}
            initialFocus
            className="p-3 pointer-events-auto"
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
