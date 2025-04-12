
import React from 'react';
import { format, isToday, isYesterday, addDays, subDays } from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface DateSelectorProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
}

const DateSelector: React.FC<DateSelectorProps> = ({ selectedDate, onDateChange }) => {
  const handlePreviousDay = () => {
    onDateChange(subDays(selectedDate, 1));
  };

  const handleNextDay = () => {
    onDateChange(addDays(selectedDate, 1));
  };

  const handleTodayClick = () => {
    onDateChange(new Date());
  };

  const getDateLabel = () => {
    if (isToday(selectedDate)) {
      return 'Today';
    } else if (isYesterday(selectedDate)) {
      return 'Yesterday';
    } else if (isToday(addDays(selectedDate, 1))) {
      return 'Tomorrow';
    } else {
      return format(selectedDate, 'EEEE, MMM d');
    }
  };

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-2xl font-semibold dark:text-white">
          Tasks for {getDateLabel()}
        </h2>

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className={cn(
                "h-10 border-dashed border-gray-300 dark:border-gray-700",
                "hover:bg-gray-100 dark:hover:bg-gray-800"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              <span>Select date</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && onDateChange(date)}
              initialFocus
              className="pointer-events-auto"
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="flex items-center justify-between mb-4">
        <div className="flex space-x-2">
          <Button
            onClick={handlePreviousDay}
            size="sm"
            variant="outline"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>

          <Button
            onClick={handleTodayClick}
            size="sm"
            variant={isToday(selectedDate) ? "default" : "outline"}
          >
            Today
          </Button>

          <Button
            onClick={handleNextDay}
            size="sm"
            variant="outline"
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>

        <div className="text-sm text-gray-500 dark:text-gray-400">
          {format(selectedDate, 'MMMM d, yyyy')}
        </div>
      </div>
    </div>
  );
};

export default DateSelector;
