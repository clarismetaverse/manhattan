import React, { useState, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, addMonths, subMonths, startOfWeek, endOfWeek, isSameMonth, isSameDay, isToday } from 'date-fns';
import { getOfferAvailableDays } from '@/services/calendarAvailability';

interface Timeframe {
  id: number;
  Name: string;
  restaurant_id: number;
  weekdays: Array<{
    id: number;
    day: string;
  }>;
  Start: string;
  Minute_Start: string;
  End: string;
  Minute_End: string;
  Spots: number;
  Visibility: boolean;
}

interface FullMonthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectDate: (date: Date) => void;
  timeframes: Timeframe[];
  selectedDate: Date | null;
  currentMonth: Date;
  offerId: number;
}

export const FullMonthModal: React.FC<FullMonthModalProps> = ({
  isOpen,
  onClose,
  onSelectDate,
  timeframes,
  selectedDate,
  currentMonth,
  offerId
}) => {
  const [displayMonth, setDisplayMonth] = useState(currentMonth);
  const [tempSelectedDate, setTempSelectedDate] = useState<Date | null>(selectedDate);
  const [availableDays, setAvailableDays] = useState<Set<string> | null>(null);
  const [loadingDays, setLoadingDays] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setDisplayMonth(currentMonth);
      setTempSelectedDate(selectedDate);
    }
  }, [isOpen, currentMonth, selectedDate]);

  // Check if a date is available based on timeframes
  const isDateAvailable = (date: Date) => {
    if (availableDays) {
      return availableDays.has(format(date, 'yyyy-MM-dd'));
    }

    const dayName = format(date, 'EEEE');
    return timeframes.some(timeframe => 
      timeframe.Visibility && 
      timeframe.weekdays.some(weekday => weekday.day === dayName)
    );
  };

  useEffect(() => {
    if (!isOpen || !offerId) {
      return;
    }

    const controller = new AbortController();
    const start = startOfMonth(displayMonth).getTime();
    const end = endOfMonth(displayMonth).getTime();

    setLoadingDays(true);

    getOfferAvailableDays(offerId, start, end, controller.signal)
      .then((days) => {
        setAvailableDays(days);
      })
      .catch((error) => {
        if (error instanceof DOMException && error.name === 'AbortError') {
          return;
        }
        console.error('Error fetching availability:', error);
        setAvailableDays(null);
      })
      .finally(() => {
        setLoadingDays(false);
      });

    return () => controller.abort();
  }, [isOpen, offerId, displayMonth]);

  // Generate calendar grid (6 weeks = 42 days)
  const generateCalendarDays = () => {
    const monthStart = startOfMonth(displayMonth);
    const monthEnd = endOfMonth(displayMonth);
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
    
    return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  };

  const handleDateClick = (date: Date) => {
    if (isDateAvailable(date)) {
      setTempSelectedDate(date);
    }
  };

  const handleMonthNavigation = (direction: 'prev' | 'next') => {
    setDisplayMonth(prev => direction === 'next' ? addMonths(prev, 1) : subMonths(prev, 1));
  };

  const handleQuickMonthSelect = (monthIndex: number) => {
    const newMonth = new Date(displayMonth.getFullYear(), monthIndex, 1);
    setDisplayMonth(newMonth);
  };

  const handleSelectDate = () => {
    if (tempSelectedDate) {
      onSelectDate(tempSelectedDate);
    }
    onClose();
  };

  const handleCancel = () => {
    onClose();
  };

  const calendarDays = generateCalendarDays();
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-5">
      {/* Modal Overlay */}
      <div 
        className="fixed inset-0 bg-black/80 backdrop-blur-[20px] animate-in fade-in-0 duration-300"
        onClick={onClose}
      />
      
      {/* Full Month Modal Container */}
      <div className="relative w-full max-w-[420px] max-h-[90vh] bg-gradient-to-br from-[rgba(15,15,15,0.95)] to-[rgba(26,26,26,0.95)] backdrop-blur-[20px] border border-white/8 rounded-[24px] p-6 animate-in zoom-in-95 duration-400 overflow-hidden">
        
        {/* Glassmorphic top border effect */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#ff1744] to-transparent opacity-60" />
        
        {/* Modal Header */}
        <div className="mb-6 text-center">
          <h2 className="text-white text-xl font-semibold tracking-tight">Select Date</h2>
        </div>

        {/* Month Navigation */}
        <div className="flex items-center justify-center gap-5 mb-6">
          <button
            onClick={() => handleMonthNavigation('prev')}
            className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center cursor-pointer transition-all duration-300 text-[#9e9e9e] text-base font-semibold hover:bg-white/10 hover:border-white/20 hover:text-white"
          >
            ‹
          </button>
          <div className="text-white text-lg font-semibold min-w-[160px] text-center tracking-tight">
            {format(displayMonth, 'MMMM yyyy')}
          </div>
          <button
            onClick={() => handleMonthNavigation('next')}
            className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center cursor-pointer transition-all duration-300 text-[#9e9e9e] text-base font-semibold hover:bg-white/10 hover:border-white/20 hover:text-white"
          >
            ›
          </button>
        </div>

        {/* Month Quick Select Grid */}
        <div className="mb-5">
          <div className="grid grid-cols-4 gap-2">
            {months.map((month, index) => {
              const isCurrent = index === displayMonth.getMonth();
              return (
                <button
                  key={index}
                  onClick={() => handleQuickMonthSelect(index)}
                  className={`p-2 px-3 rounded-lg border text-center cursor-pointer transition-all duration-300 text-xs font-medium ${
                    isCurrent
                      ? 'bg-[rgba(255,23,68,0.1)] border-[rgba(255,23,68,0.3)] text-[#ff1744]'
                      : 'bg-white/3 border-white/5 text-[#9e9e9e] hover:bg-white/8 hover:border-white/15 hover:text-white'
                  }`}
                >
                  {month}
                </button>
              );
            })}
          </div>
        </div>

        {/* Full Calendar Container */}
        <div className="bg-white/2 border border-white/5 rounded-2xl p-5 mb-5">
          {loadingDays && (
            <div className="text-center text-xs text-[#9e9e9e] mb-3">
              Loading availability...
            </div>
          )}
          <div className="grid grid-cols-7 gap-[6px]">
            {/* Day headers */}
            {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, index) => (
              <div key={index} className="text-center text-[#666666] text-[11px] font-medium uppercase tracking-[0.5px] py-2">
                {day}
              </div>
            ))}
            
            {/* Calendar days */}
            {calendarDays.map((date, index) => {
              const available = isDateAvailable(date);
              const selected = tempSelectedDate && isSameDay(date, tempSelectedDate);
              const today = isToday(date);
              const otherMonth = !isSameMonth(date, displayMonth);

              return (
                <button
                  key={index}
                  onClick={() => handleDateClick(date)}
                  disabled={!available}
                  className={`aspect-square min-h-[36px] flex items-center justify-center rounded-lg cursor-pointer transition-all duration-[0.3s] ease-[cubic-bezier(0.4,0,0.2,1)] text-sm font-medium relative ${
                    selected
                      ? 'bg-gradient-to-br from-[#ff1744] to-[#d81b60] border border-[rgba(255,23,68,0.5)] text-white shadow-[0_4px_16px_rgba(255,23,68,0.3)]'
                      : available
                      ? `bg-white/3 border border-white/5 text-white hover:bg-white/8 hover:border-white/15 hover:scale-105 ${today ? 'border-[rgba(255,23,68,0.3)] bg-[rgba(255,23,68,0.05)]' : ''} ${otherMonth ? 'text-[#666666] bg-white/[0.01]' : ''}`
                      : 'text-[#333333] cursor-not-allowed bg-transparent border-transparent'
                  } ${otherMonth && !available ? 'text-[#333333]' : ''}`}
                >
                  {format(date, 'd')}
                  {/* Available indicator dot */}
                  {available && !selected && (
                    <div className="absolute bottom-[2px] left-1/2 transform -translate-x-1/2 w-1 h-1 rounded-full bg-[#ff1744] opacity-60" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleCancel}
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-5 py-[14px] text-white text-sm font-medium cursor-pointer transition-all duration-300 hover:bg-white/10 hover:border-white/20"
          >
            Cancel
          </button>
          <button
            onClick={handleSelectDate}
            disabled={!tempSelectedDate}
            className={`flex-[2] bg-gradient-to-br from-[#ff1744] to-[#d81b60] border-0 rounded-xl px-5 py-[14px] text-white text-sm font-semibold cursor-pointer transition-all duration-[0.3s] ease-[cubic-bezier(0.4,0,0.2,1)] ${
              tempSelectedDate
                ? 'shadow-[0_4px_16px_rgba(255,23,68,0.25),inset_0_1px_0_rgba(255,255,255,0.1)] hover:-translate-y-[1px] hover:shadow-[0_6px_20px_rgba(255,23,68,0.35),inset_0_1px_0_rgba(255,255,255,0.15)]'
                : 'opacity-50 cursor-not-allowed'
            }`}
          >
            Select Date
          </button>
        </div>
        
      </div>
    </div>
  );
};
