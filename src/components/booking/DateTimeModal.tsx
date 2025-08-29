import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format, addDays, startOfWeek, isSameDay, isToday, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import { FullMonthModal } from './FullMonthModal';

interface TimeSlot {
  id: string;
  start: string;
  end: string;
  available: boolean;
  spots?: number;
}

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

interface DateTimeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectDateTime: (date: Date, timeSlot: string) => void;
  restaurantId: number;
  offerId: number;
}

export const DateTimeModal: React.FC<DateTimeModalProps> = ({
  isOpen,
  onClose,
  onSelectDateTime,
  restaurantId,
  offerId
}) => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [timeframes, setTimeframes] = useState<Timeframe[]>([]);
  const [loading, setLoading] = useState(false);
  const [showFullMonthModal, setShowFullMonthModal] = useState(false);
  const [weekStart, setWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));

  // Fetch timeframes from Xano API
  useEffect(() => {
    if (isOpen && restaurantId && offerId) {
      fetchTimeframes();
    }
  }, [isOpen, restaurantId, offerId]);

  const fetchTimeframes = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://xbut-eryu-hhsg.f2.xano.io/api:vGd6XDW3/get_timeframes_turbo/Upgrade', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          restaurant_id: restaurantId,
          offer_id: offerId
        })
      });

      if (response.ok) {
        const data = await response.json();
        setTimeframes(data);
      }
    } catch (error) {
      console.error('Error fetching timeframes:', error);
    } finally {
      setLoading(false);
    }
  };

  // Generate week days
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  // Check if a date is available based on timeframes
  const isDateAvailable = (date: Date) => {
    const dayName = format(date, 'EEEE');
    return timeframes.some(timeframe => 
      timeframe.Visibility && 
      timeframe.weekdays.some(weekday => weekday.day === dayName)
    );
  };

  // Generate time slots for selected date
  const getTimeSlots = (date: Date): TimeSlot[] => {
    if (!date) return [];
    
    const dayName = format(date, 'EEEE');
    const availableTimeframes = timeframes.filter(timeframe =>
      timeframe.Visibility && 
      timeframe.weekdays.some(weekday => weekday.day === dayName)
    );

    const slots: TimeSlot[] = [];
    
    availableTimeframes.forEach(timeframe => {
      const startHour = parseInt(timeframe.Start);
      const endHour = parseInt(timeframe.End);
      
      // Generate hourly slots
      for (let hour = startHour; hour < endHour; hour++) {
        const timeSlot = `${hour.toString().padStart(2, '0')}:${timeframe.Minute_Start}`;
        const endTime = `${(hour + 1).toString().padStart(2, '0')}:${timeframe.Minute_End}`;
        
        slots.push({
          id: `${timeframe.id}-${hour}`,
          start: timeSlot,
          end: endTime,
          available: timeframe.Spots > 0,
          spots: timeframe.Spots
        });
      }
    });

    return slots.sort((a, b) => a.start.localeCompare(b.start));
  };

  const handleDateSelect = (date: Date) => {
    if (isDateAvailable(date)) {
      setSelectedDate(date);
      setSelectedTime(null); // Reset selected time when date changes
    }
  };

  const handleTimeSelect = (timeSlot: TimeSlot) => {
    if (timeSlot.available) {
      setSelectedTime(timeSlot.start);
    }
  };

  const handleConfirmBooking = () => {
    if (selectedDate && selectedTime) {
      onSelectDateTime(selectedDate, selectedTime);
      onClose();
    }
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    setWeekStart(prev => addDays(prev, direction === 'next' ? 7 : -7));
    setSelectedDate(null);
  };

  // Generate month days for month view
  const generateMonthDays = () => {
    const start = startOfMonth(weekStart);
    const end = endOfMonth(weekStart);
    return eachDayOfInterval({ start, end });
  };

  const timeSlots = selectedDate ? getTimeSlots(selectedDate) : [];

  console.log('DateTimeModal: isOpen =', isOpen, 'Component rendering with new bottom sheet implementation');
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      {/* Modal Overlay with backdrop blur */}
      <div 
        className="fixed inset-0 bg-black/80 backdrop-blur-[20px] animate-in fade-in-0 duration-300"
        onClick={onClose}
      />
      
      {/* Modal Container */}
      <div className="relative w-full max-w-[400px] mx-auto bg-gradient-to-br from-[rgba(15,15,15,0.95)] to-[rgba(26,26,26,0.95)] backdrop-blur-[20px] border border-white/8 rounded-t-[24px] p-6 pb-8 animate-in slide-in-from-bottom duration-500 overflow-hidden">
        
        {/* Glassmorphic top border effect */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#ff1744] to-transparent opacity-60" />
        
        {/* Modal Handle */}
        <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-white/30 rounded-full" />
        
        {/* Modal Header */}
        <div className="mb-6 text-center mt-4">
          <h2 className="text-white text-xl font-semibold mb-2 tracking-tight">Select Date & Time</h2>
        </div>

        {/* Date Range Navigation */}
        <div className="flex items-center justify-center gap-4 mb-6">
          <button
            onClick={() => navigateWeek('prev')}
            className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center cursor-pointer transition-all duration-300 text-[#9e9e9e] text-sm hover:bg-white/10 hover:border-white/20 hover:text-white"
          >
            ‹
          </button>
          <div className="text-white text-base font-medium min-w-[180px] text-center tracking-tight">
            {format(weekStart, 'MMM d')} - {format(addDays(weekStart, 6), 'MMM d, yyyy')}
          </div>
          <button
            onClick={() => navigateWeek('next')}
            className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center cursor-pointer transition-all duration-300 text-[#9e9e9e] text-sm hover:bg-white/10 hover:border-white/20 hover:text-white"
          >
            ›
          </button>
        </div>
        
        {/* Calendar Container */}
        <div className="bg-white/2 border border-white/5 rounded-2xl p-5 mb-5">
          <div className="grid grid-cols-7 gap-2">
            {/* Day headers */}
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => (
              <div key={index} className="text-center text-[#666666] text-[11px] font-medium uppercase tracking-[0.5px] py-2">
                {day}
              </div>
            ))}
            
            {/* Date cells */}
            {weekDays.map((date, index) => {
              const available = isDateAvailable(date);
              const selected = selectedDate && isSameDay(date, selectedDate);
              const today = isToday(date);

              return (
                <button
                  key={index}
                  onClick={() => handleDateSelect(date)}
                  disabled={!available}
                  className={`aspect-square flex items-center justify-center rounded-xl cursor-pointer transition-all duration-[0.3s] ease-[cubic-bezier(0.4,0,0.2,1)] text-sm font-medium relative ${
                    selected
                      ? 'bg-gradient-to-br from-[#ff1744] to-[#d81b60] border-[rgba(255,23,68,0.5)] text-white shadow-[0_4px_16px_rgba(255,23,68,0.3),inset_0_1px_0_rgba(255,255,255,0.2)] hover:scale-105 hover:shadow-[0_6px_20px_rgba(255,23,68,0.4),inset_0_1px_0_rgba(255,255,255,0.25)]'
                      : available
                      ? `bg-white/3 border border-white/5 text-white hover:bg-white/8 hover:border-white/15 hover:scale-105 ${today ? 'border-[rgba(255,23,68,0.3)] bg-[rgba(255,23,68,0.05)]' : ''}`
                      : 'text-[#333333] cursor-not-allowed bg-transparent border-transparent'
                  }`}
                >
                  {format(date, 'd')}
                </button>
              );
            })}
          </div>
        </div>
        
        {/* View Full Month Link */}
        <div className="text-left mb-6">
          <button
            onClick={() => setShowFullMonthModal(true)}
            className="text-[#ff1744] text-sm font-medium transition-colors duration-300 inline-flex items-center gap-1 hover:text-[#ff4568]"
          >
            View full month →
          </button>
        </div>
        
        {/* Time Selection Section */}
        {selectedDate && (
          <div className="mb-6">
            <h3 className="text-white text-base font-medium mb-4 tracking-tight">Available Times</h3>
            
            {loading ? (
              <div className="text-center py-8 text-gray-400">
                Loading available times...
              </div>
            ) : timeSlots.length > 0 ? (
              <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto">
                {timeSlots.map((slot) => {
                  const isSelected = selectedTime === slot.start;
                  return (
                    <button
                      key={slot.id}
                      onClick={() => handleTimeSelect(slot)}
                      disabled={!slot.available}
                      className={`p-3 rounded-xl border text-center cursor-pointer transition-all duration-[0.3s] ease-[cubic-bezier(0.4,0,0.2,1)] text-sm font-medium ${
                        isSelected
                          ? 'bg-gradient-to-br from-[#ff1744] to-[#d81b60] border-[rgba(255,23,68,0.5)] text-white shadow-[0_4px_16px_rgba(255,23,68,0.2)]'
                          : slot.available
                          ? 'bg-white/3 border-white/8 text-white hover:bg-white/8 hover:border-white/15 hover:-translate-y-[1px]'
                          : 'opacity-30 cursor-not-allowed text-white'
                      }`}
                    >
                      {slot.start}
                      {slot.spots && slot.spots < 5 && (
                        <div className="text-xs text-gray-400 mt-1">
                          {slot.spots} left
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">
                No available times for this date
              </div>
            )}
          </div>
        )}

        {/* Confirm Booking Button */}
        <button
          onClick={handleConfirmBooking}
          disabled={!selectedDate || !selectedTime}
          className={`w-full bg-gradient-to-br from-[#ff1744] to-[#d81b60] border-0 rounded-2xl px-6 py-4 text-white text-base font-semibold cursor-pointer transition-all duration-[0.3s] ease-[cubic-bezier(0.4,0,0.2,1)] tracking-tight mt-6 ${
            selectedDate && selectedTime
              ? 'shadow-[0_4px_16px_rgba(255,23,68,0.25),inset_0_1px_0_rgba(255,255,255,0.1)] hover:-translate-y-[2px] hover:shadow-[0_8px_24px_rgba(255,23,68,0.35),inset_0_1px_0_rgba(255,255,255,0.15)]'
              : 'opacity-50 cursor-not-allowed'
          }`}
        >
          Confirm Booking
        </button>
        
      </div>
      
      {/* Full Month Modal */}
      <FullMonthModal
        isOpen={showFullMonthModal}
        onClose={() => setShowFullMonthModal(false)}
        onSelectDate={(date) => {
          handleDateSelect(date);
          setShowFullMonthModal(false);
        }}
        timeframes={timeframes}
        selectedDate={selectedDate}
        currentMonth={weekStart}
      />
    </div>
  );
};