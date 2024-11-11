"use client";

import * as React from "react";
import WatchLaterOutlinedIcon from "@mui/icons-material/WatchLaterOutlined";
import { addDays, format } from "date-fns";
import { DateRange } from "react-day-picker";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Box, Typography } from "@mui/material";

interface DatePickerProps extends React.HTMLAttributes<HTMLDivElement> {
  selectedDate?: any;
  onDateChange?: (range: any) => void;
  isShowLastDate?: boolean;
}

export function DatePicker({
  className,
  selectedDate,
  onDateChange,
  isShowLastDate = false,
  ...props
}: DatePickerProps) {
  // selectedDate có thể là undefined, nên cần xử lý trước khi setState vào dateRange
  // selectedDate là milisecond, nên cần convert sang date trước khi setState

  const dateRange = React.useMemo(() => {
    return {
      from: selectedDate?.from ? new Date(selectedDate.from) : undefined,
      to: selectedDate?.to ? new Date(selectedDate.to) : undefined,
    }
  }, [selectedDate]);

  const handleChangeDate = React.useCallback((date: any) => {
    if (onDateChange) {
      // convert date sang milisecond
      console.log('date in date picker', date);
      if (
        date?.from && date?.to && 
        selectedDate?.from && selectedDate?.to &&
        new Date(date.from).getTime() === new Date(selectedDate?.from).getTime() &&
        new Date(date.to).getTime() === new Date(selectedDate?.to).getTime()
      ) {
        return;
      }

      const dateMilisecond = {
        from: date?.from ? date?.from?.getTime() : undefined,
        to: date?.to ? date?.to?.getTime() : undefined,
      }
      onDateChange(dateMilisecond);
    }
  }, [onDateChange]);

  const title = React.useMemo(() => {
    if (!isShowLastDate || !selectedDate?.to) {
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
            handleChangeDate(range);
          }}
          numberOfMonths={1}
        />
      </PopoverContent>
    </Popover>
  );

  return popoverContent;
}
