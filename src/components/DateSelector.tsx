
import React from 'react';
import { format, addDays, subDays, isToday, isYesterday, isTomorrow } from 'date-fns';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, CalendarIcon } from 'lucide-react';

interface DateSelectorProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
}

const DateSelector: React.FC<DateSelectorProps> = ({
  selectedDate,
  onDateChange,
}) => {
  const formatDateDisplay = (date: Date): string => {
    if (isToday(date)) return 'Today';
    if (isYesterday(date)) return 'Yesterday';
    if (isTomorrow(date)) return 'Tomorrow';
    return format(date, 'EEE, MMM d');
  };

  const goToPreviousDay = () => {
    onDateChange(subDays(selectedDate, 1));
  };

  const goToNextDay = () => {
    onDateChange(addDays(selectedDate, 1));
  };

  const goToToday = () => {
    onDateChange(new Date());
  };

  return (
    <div className="flex items-center justify-between w-full mb-6">
      <Button
        variant="ghost"
        size="sm"
        className="flex items-center gap-1 text-xs"
        onClick={goToToday}
      >
        <CalendarIcon className="h-3.5 w-3.5" />
        Today
      </Button>

      <div className="flex items-center gap-2">
        <button onClick={goToPreviousDay} className="date-nav-button">
          <ChevronLeft className="h-5 w-5" />
        </button>

        <div className="text-lg font-medium w-32 text-center">
          {formatDateDisplay(selectedDate)}
        </div>

        <button onClick={goToNextDay} className="date-nav-button">
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
      
      <div className="w-16" /> {/* Spacer for balance */}
    </div>
  );
};

export default DateSelector;
