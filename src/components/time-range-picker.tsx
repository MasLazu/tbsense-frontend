import * as React from "react";
import {
  format,
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  subDays,
  subHours,
} from "date-fns";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label";
import { CalendarIcon, Clock, Search } from "lucide-react";

export interface TimeRange {
  from: Date;
  to: Date;
  label?: string;
}

interface TimeRangePickerProps {
  defaultValue?: TimeRange;
  onRangeChange?: (range: TimeRange) => void;
  className?: string;
}

const QUICK_RANGES = [
  {
    label: "All Time",
    getValue: () => ({
      from: new Date(0), // Unix epoch (Jan 1, 1970)
      to: new Date(),
    }),
  },
  {
    label: "Last 12 hours",
    getValue: () => ({ from: subHours(new Date(), 12), to: new Date() }),
  },
  {
    label: "Last 24 hours",
    getValue: () => ({ from: subHours(new Date(), 24), to: new Date() }),
  },
  {
    label: "Last 2 days",
    getValue: () => ({ from: subDays(new Date(), 2), to: new Date() }),
  },
  {
    label: "This day",
    getValue: () => ({
      from: startOfDay(new Date()),
      to: endOfDay(new Date()),
    }),
  },
  {
    label: "This week",
    getValue: () => ({
      from: startOfWeek(new Date()),
      to: endOfWeek(new Date()),
    }),
  },
  {
    label: "This month",
    getValue: () => ({
      from: startOfMonth(new Date()),
      to: endOfMonth(new Date()),
    }),
  },
];

export function TimeRangePicker({
  defaultValue,
  onRangeChange,
  className,
}: TimeRangePickerProps) {
  const [selectedRange, setSelectedRange] = React.useState<
    TimeRange | undefined
  >(defaultValue);
  const [isOpen, setIsOpen] = React.useState(false);
  const [fromDate, setFromDate] = React.useState<Date | undefined>(
    defaultValue?.from
  );
  const [toDate, setToDate] = React.useState<Date | undefined>(
    defaultValue?.to
  );
  const [fromTime, setFromTime] = React.useState(
    defaultValue?.from ? format(defaultValue.from, "HH:mm:ss") : "00:00:00"
  );
  const [toTime, setToTime] = React.useState(
    defaultValue?.to ? format(defaultValue.to, "HH:mm:ss") : "23:59:59"
  );
  const [searchQuery, setSearchQuery] = React.useState("");

  const filteredRanges = QUICK_RANGES.filter((range) =>
    range.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleQuickRange = (range: (typeof QUICK_RANGES)[0]) => {
    if (range.label === "Custom") {
      return;
    }

    const { from, to } = range.getValue();
    const timeRange = { from, to, label: range.label };

    setFromDate(from);
    setToDate(to);
    setFromTime(format(from, "HH:mm:ss"));
    setToTime(format(to, "HH:mm:ss"));

    setSelectedRange(timeRange);
    onRangeChange?.(timeRange);
    setIsOpen(false);
  };

  const handleApplyCustomRange = () => {
    if (!fromDate || !toDate) return;

    const [fromHours, fromMinutes, fromSeconds] = fromTime
      .split(":")
      .map(Number);
    const [toHours, toMinutes, toSeconds] = toTime.split(":").map(Number);

    const from = new Date(fromDate);
    from.setHours(fromHours, fromMinutes, fromSeconds);

    const to = new Date(toDate);
    to.setHours(toHours, toMinutes, toSeconds);

    const timeRange = { from, to, label: "Custom range" };
    setSelectedRange(timeRange);
    onRangeChange?.(timeRange);

    setIsOpen(false);
  };

  const formatDisplayValue = () => {
    if (!selectedRange) return "Select time range";

    if (selectedRange.label && selectedRange.label !== "Custom range") {
      return selectedRange.label;
    }

    if (selectedRange.label === "Custom range") {
      const fromYear = selectedRange.from.getFullYear();
      const toYear = selectedRange.to.getFullYear();

      if (fromYear !== toYear) {
        return `${format(selectedRange.from, "MMM dd, yyyy HH:mm")} - ${format(
          selectedRange.to,
          "MMM dd, yyyy HH:mm"
        )}`;
      } else {
        return `${format(selectedRange.from, "MMM dd, HH:mm")} - ${format(
          selectedRange.to,
          "MMM dd, HH:mm"
        )}`;
      }
    }

    return `${format(selectedRange.from, "MMM dd, yyyy HH:mm")} to ${format(
      selectedRange.to,
      "MMM dd, yyyy HH:mm"
    )}`;
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal min-w-[200px]",
            !selectedRange && "text-muted-foreground",
            className
          )}
        >
          <Clock className="mr-2 h-4 w-4 shrink-0" />
          <span className="truncate">{formatDisplayValue()}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0 w-[650px]" align="start">
        <div className="flex">
          <div className="flex-1 p-4 border-r">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-sm">Absolute time range</h4>
              </div>

              <div className="space-y-3">
                <div>
                  <Label
                    htmlFor="from-date"
                    className="text-xs text-muted-foreground"
                  >
                    From
                  </Label>
                  <div className="flex gap-2 mt-1">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="flex-1 justify-start text-left font-normal bg-transparent"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {fromDate
                            ? format(fromDate, "yyyy-MM-dd")
                            : "Pick a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={fromDate}
                          onSelect={setFromDate}
                        />
                      </PopoverContent>
                    </Popover>
                    <Input
                      value={fromTime}
                      onChange={(e) => setFromTime(e.target.value)}
                      placeholder="HH:mm:ss"
                      className="w-24"
                    />
                  </div>
                </div>

                <div>
                  <Label
                    htmlFor="to-date"
                    className="text-xs text-muted-foreground"
                  >
                    To
                  </Label>
                  <div className="flex gap-2 mt-1">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="flex-1 justify-start text-left font-normal bg-transparent"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {toDate
                            ? format(toDate, "yyyy-MM-dd")
                            : "Pick a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={toDate}
                          onSelect={setToDate}
                        />
                      </PopoverContent>
                    </Popover>
                    <Input
                      value={toTime}
                      onChange={(e) => setToTime(e.target.value)}
                      placeholder="HH:mm:ss"
                      className="w-24"
                    />
                  </div>
                </div>
              </div>

              <Button
                onClick={handleApplyCustomRange}
                className="w-full mt-4"
                disabled={!fromDate || !toDate}
              >
                Apply time range
              </Button>
            </div>
          </div>

          <div className="w-80 p-4">
            <div className="space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search quick ranges"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>

              <ScrollArea className="h-64">
                <div className="space-y-1">
                  {filteredRanges.map((range, index) => (
                    <Button
                      key={index}
                      variant="ghost"
                      className="w-full justify-start text-left"
                      onClick={() => handleQuickRange(range)}
                    >
                      {range.label}
                    </Button>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
