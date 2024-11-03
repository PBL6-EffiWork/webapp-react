"use client";

import * as React from "react";
import WatchLaterOutlinedIcon from "@mui/icons-material/WatchLaterOutlined";
import { addDays, format } from "date-fns";
import { DateRange } from "react-day-picker";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Box, Typography } from "@mui/material";

interface DatePickerProps extends React.HTMLAttributes<HTMLDivElement> {
  selectedDate?: DateRange;
  onDateChange?: (range: DateRange | undefined) => void;
  isShowLastDate?: boolean;
}

export function DatePicker({
  className,
  selectedDate,
  onDateChange,
  isShowLastDate = false,
  ...props
}: DatePickerProps) {
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>({
    from: new Date(2024, 9, 15),
    to: addDays(new Date(2024, 9, 15), 20),
  });

  React.useEffect(() => {
    if (onDateChange) {
      onDateChange(dateRange);
    }
  }, [dateRange, onDateChange]);

  const title = React.useMemo(() => {
    if (!isShowLastDate) {
      return (
        <Box sx={{
          gap: '6px',
        }} id="date" className={`flex items-center cursor-pointer ${className}`} {...props}>
          <WatchLaterOutlinedIcon fontSize="small" />
          Dates
        </Box>
      );
    }

    return (
      <div id="date" className={`flex items-center gap-2 cursor-pointer ${className}`} {...props}>
        <WatchLaterOutlinedIcon fontSize="small" />
        <Typography component="span" sx={{ fontWeight: '600', fontSize: '20px' }}>
          {dateRange?.to ? format(dateRange.to, "MMM d, yyyy") : "Last Date"}
        </Typography>
      </div>
    );
  }, [isShowLastDate, dateRange, className, props]);

  const popoverContent = (
    <Popover>
      <PopoverTrigger asChild>{title}</PopoverTrigger>
      <PopoverContent className="w-auto p-0 z-[9999]" align="start">
        <Calendar
          initialFocus
          mode="range"
          defaultMonth={dateRange?.from}
          selected={dateRange}
          onSelect={(range) => {
            console.log(range);
            setDateRange(range);
          }}
          numberOfMonths={1}
        />
      </PopoverContent>
    </Popover>
  );

  return popoverContent;
}
