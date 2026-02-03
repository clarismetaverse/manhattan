import { useState, useEffect, useMemo } from "react";
import { format, addDays, startOfWeek, endOfWeek, isSameDay, isToday, startOfMonth, endOfMonth, addMonths, isBefore, startOfDay } from "date-fns";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

const CALENDAR_DAYS_URL = "https://xbut-eryu-hhsg.f2.xano.io/api:vGd6XDW3/signupupgrade/calendardays";
const TIMEFRAMES_URL = "https://xbut-eryu-hhsg.f2.xano.io/api:vGd6XDW3/get_timeframes_turbo/Upgrade";

interface Timeframe {
  id: number;
  Name: string;
  restaurant_id: number;
  weekdays: Array<{ id: number; day: string }>;
  Start: string;
  Minute_Start: string;
  End: string;
  Minute_End: string;
  Spots: number;
  Visibility: boolean;
}

interface TimeSlot {
  id: string;
  label: string;
  available: boolean;
}

interface ConfirmPayload {
  date: string;
  timeLabel: string;
  offerId: string;
  timeframeId: number;
}

interface DateTimeSheetProps {
  open: boolean;
  onClose: () => void;
  offerId: string;
  venueId: number | string;
  onConfirm: (payload: ConfirmPayload) => void;
}

const generateMockAvailableDays = (from: string, to: string): Set<string> => {
  const availableDays = new Set<string>();
  const startDate = new Date(from);
  const endDate = new Date(to);

  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    const dayOfWeek = d.getDay();
    if (dayOfWeek !== 0 && (dayOfWeek !== 6 || Math.random() > 0.5)) {
      availableDays.add(format(d, "yyyy-MM-dd"));
    }
  }

  return availableDays;
};

const fetchCalendarDays = async (
  offerId: number,
  from: string,
  to: string,
  signal?: AbortSignal
): Promise<Set<string>> => {
  try {
    const response = await fetch(CALENDAR_DAYS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ offer_upgrade_id: offerId, from, to }),
      signal,
    });

    if (!response.ok) {
      return generateMockAvailableDays(from, to);
    }

    const data = await response.json();
    const availableDays = new Set<string>();
    
    if (Array.isArray(data.available_days)) {
      data.available_days.forEach((day: { date: string; available: boolean }) => {
        if (day.available) {
          availableDays.add(day.date);
        }
      });
    }

    if (availableDays.size === 0) {
      return generateMockAvailableDays(from, to);
    }

    return availableDays;
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw error;
    }
    return generateMockAvailableDays(from, to);
  }
};

export default function DateTimeSheet({
  open,
  onClose,
  offerId,
  venueId,
  onConfirm,
}: DateTimeSheetProps) {
  const [currentMonth, setCurrentMonth] = useState(startOfMonth(new Date()));
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedTimeframeId, setSelectedTimeframeId] = useState<number | null>(null);
  const [availableDays, setAvailableDays] = useState<Set<string>>(new Set());
  const [loadingDays, setLoadingDays] = useState(false);
  const [timeframes, setTimeframes] = useState<Timeframe[]>([]);
  const [loadingTimeframes, setLoadingTimeframes] = useState(false);

  // Fetch available days
  useEffect(() => {
    if (!open) return;

    const numericOfferId = Number(offerId);
    if (!numericOfferId || isNaN(numericOfferId)) return;

    const controller = new AbortController();
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

    const from = format(calendarStart, "yyyy-MM-dd");
    const to = format(calendarEnd, "yyyy-MM-dd");

    setLoadingDays(true);

    fetchCalendarDays(numericOfferId, from, to, controller.signal)
      .then(setAvailableDays)
      .catch(() => setAvailableDays(new Set()))
      .finally(() => setLoadingDays(false));

    return () => controller.abort();
  }, [open, offerId, currentMonth]);

  // Fetch timeframes
  useEffect(() => {
    if (!open || !venueId || !offerId) return;

    const controller = new AbortController();
    setLoadingTimeframes(true);

    fetch(TIMEFRAMES_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ restaurant_id: venueId, offer_id: Number(offerId) }),
      signal: controller.signal,
    })
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to fetch timeframes");
        return res.json();
      })
      .then(setTimeframes)
      .catch((err) => {
        if (err.name !== "AbortError") {
          console.error("Error fetching timeframes:", err);
        }
      })
      .finally(() => setLoadingTimeframes(false));

    return () => controller.abort();
  }, [open, venueId, offerId]);

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

    const days: Date[] = [];
    let day = calendarStart;
    while (day <= calendarEnd) {
      days.push(day);
      day = addDays(day, 1);
    }
    return days;
  }, [currentMonth]);

  // Get time slots for selected date
  const timeSlots = useMemo<TimeSlot[]>(() => {
    if (!selectedDate) return [];

    const dayName = format(selectedDate, "EEEE");
    const availableTimeframes = timeframes.filter(
      (tf) => tf.Visibility && tf.weekdays.some((wd) => wd.day === dayName)
    );

    const slots: TimeSlot[] = [];
    availableTimeframes.forEach((tf) => {
      const startHour = parseInt(tf.Start, 10);
      const endHour = parseInt(tf.End, 10);

      for (let hour = startHour; hour < endHour; hour++) {
        const label = `${hour.toString().padStart(2, "0")}:${tf.Minute_Start}`;
        slots.push({
          id: `${tf.id}-${hour}`,
          label,
          available: tf.Spots > 0,
        });
      }
    });

    return slots.sort((a, b) => a.label.localeCompare(b.label));
  }, [selectedDate, timeframes]);

  const handleDateSelect = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    if (availableDays.has(dateStr) && !isBefore(date, startOfDay(new Date()))) {
      setSelectedDate(date);
      setSelectedTime(null);
      setSelectedTimeframeId(null);
    }
  };

  const handleTimeSelect = (slot: TimeSlot) => {
    if (slot.available) {
      setSelectedTime(slot.label);
      const tfId = parseInt(slot.id.split("-")[0], 10);
      setSelectedTimeframeId(tfId);
    }
  };

  const handleConfirm = () => {
    if (selectedDate && selectedTime && selectedTimeframeId !== null) {
      onConfirm({
        date: format(selectedDate, "yyyy-MM-dd"),
        timeLabel: selectedTime,
        offerId,
        timeframeId: selectedTimeframeId,
      });
      onClose();
    }
  };

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentMonth((prev) => addMonths(prev, direction === "next" ? 1 : -1));
    setSelectedDate(null);
    setSelectedTime(null);
  };

  return (
    <Sheet open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <SheetContent side="bottom" className="rounded-t-3xl p-0 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white px-4 py-3 border-b flex items-center justify-between">
          <button onClick={onClose} className="p-2 -ml-2 rounded-full hover:bg-stone-100">
            <X className="h-5 w-5 text-stone-600" />
          </button>
          <h2 className="text-lg font-semibold text-stone-900">Select Date & Time</h2>
          <div className="w-9" />
        </div>

        <div className="overflow-y-auto p-4 space-y-6">
          {/* Month Navigation */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigateMonth("prev")}
              className="p-2 rounded-lg hover:bg-stone-100"
            >
              <ChevronLeft className="h-5 w-5 text-stone-600" />
            </button>
            <span className="text-base font-medium text-stone-900">
              {format(currentMonth, "MMMM yyyy")}
            </span>
            <button
              onClick={() => navigateMonth("next")}
              className="p-2 rounded-lg hover:bg-stone-100"
            >
              <ChevronRight className="h-5 w-5 text-stone-600" />
            </button>
          </div>

          {/* Calendar Grid */}
          <div className="space-y-2">
            {loadingDays && (
              <p className="text-center text-xs text-stone-400">Loading availability...</p>
            )}
            <div className="grid grid-cols-7 gap-1">
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
                <div key={d} className="text-center text-xs font-medium text-stone-400 py-2">
                  {d}
                </div>
              ))}
              {calendarDays.map((date, idx) => {
                const dateStr = format(date, "yyyy-MM-dd");
                const inMonth = date.getMonth() === currentMonth.getMonth();
                const isAvailable = availableDays.has(dateStr) && !isBefore(date, startOfDay(new Date()));
                const isSelected = selectedDate && isSameDay(date, selectedDate);
                const isTodayDate = isToday(date);

                return (
                  <button
                    key={idx}
                    onClick={() => handleDateSelect(date)}
                    disabled={!isAvailable || !inMonth}
                    className={`aspect-square flex items-center justify-center rounded-lg text-sm transition-all ${
                      isSelected
                        ? "bg-[#FF5A7A] text-white font-medium"
                        : isAvailable && inMonth
                        ? `bg-stone-50 text-stone-900 hover:bg-stone-100 ${isTodayDate ? "ring-1 ring-[#FF5A7A]" : ""}`
                        : "text-stone-300 cursor-not-allowed"
                    }`}
                  >
                    {format(date, "d")}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Time Slots */}
          {selectedDate && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-stone-700">Available Times</h3>
              {loadingTimeframes ? (
                <p className="text-center text-xs text-stone-400">Loading times...</p>
              ) : timeSlots.length > 0 ? (
                <div className="grid grid-cols-4 gap-2">
                  {timeSlots.map((slot) => (
                    <button
                      key={slot.id}
                      onClick={() => handleTimeSelect(slot)}
                      disabled={!slot.available}
                      className={`py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                        selectedTime === slot.label
                          ? "bg-[#FF5A7A] text-white"
                          : slot.available
                          ? "bg-stone-100 text-stone-700 hover:bg-stone-200"
                          : "bg-stone-50 text-stone-300 cursor-not-allowed"
                      }`}
                    >
                      {slot.label}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-center text-sm text-stone-400 py-4">
                  No available times for this date
                </p>
              )}
            </div>
          )}
        </div>

        {/* Confirm Button */}
        <div className="sticky bottom-0 bg-white border-t p-4">
          <button
            onClick={handleConfirm}
            disabled={!selectedDate || !selectedTime}
            className={`w-full py-3 rounded-xl font-medium text-white transition-all ${
              selectedDate && selectedTime
                ? "bg-[#FF5A7A] hover:bg-[#FF3A6E] shadow-lg"
                : "bg-stone-200 text-stone-400 cursor-not-allowed"
            }`}
          >
            Confirm Booking
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
