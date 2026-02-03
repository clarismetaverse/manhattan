import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

export type Timeframe = {
  id: string;
  label: string;
  start: { h: number; m: number };
  end: { h: number; m: number };
  stepMins: number;
};

type DateTimeSheetProps = {
  open: boolean;
  onClose: () => void;
  offerId: string;
  venueId?: number;
  offerTitle?: string;
  availableDaySet?: Set<string>;
  availableDays?: Record<string, { remaining_slots: number }>;
  availabilityLoading?: boolean;
  availabilityError?: string | null;
  onRangeChange?: (fromMs: number, toMs: number) => void;
  timeframesByDow?: Record<number, Timeframe[]>;
  onConfirm: (slot: {
    iso: string;
    date: string;
    timeLabel: string;
    offerId: string;
    timeframeId?: string;
  }) => void;
};

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const ymd = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

const getMonthDays = (year: number, month: number) => {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  return { firstDay, daysInMonth };
};

export default function DateTimeSheet({
  open,
  onClose,
  offerId,
  venueId,
  offerTitle,
  availableDaySet = new Set(),
  availableDays = {},
  availabilityLoading,
  availabilityError,
  onRangeChange,
  timeframesByDow = {},
  onConfirm,
}: DateTimeSheetProps) {
  const [viewDate, setViewDate] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [activeTimeframe, setActiveTimeframe] = useState<Timeframe | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

  const { firstDay, daysInMonth } = useMemo(
    () => getMonthDays(viewDate.getFullYear(), viewDate.getMonth()),
    [viewDate]
  );

  const timeframes = useMemo(() => {
    if (!selectedDate) return [];
    const dow = selectedDate.getDay();
    return timeframesByDow[dow] ?? [];
  }, [selectedDate, timeframesByDow]);

  const slots = useMemo(() => {
    if (!activeTimeframe) return [];
    const { start, end, stepMins } = activeTimeframe;
    const result: { iso: string; label: string }[] = [];
    let h = start.h;
    let m = start.m;
    while (h < end.h || (h === end.h && m < end.m)) {
      const label = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
      result.push({ iso: label, label });
      m += stepMins;
      if (m >= 60) {
        h += Math.floor(m / 60);
        m = m % 60;
      }
    }
    return result;
  }, [activeTimeframe]);

  const goMonth = (dir: 1 | -1) => {
    const next = new Date(viewDate.getFullYear(), viewDate.getMonth() + dir, 1);
    setViewDate(next);
    setSelectedDate(null);
    setActiveTimeframe(null);
    setSelectedSlot(null);
    if (onRangeChange) {
      const from = next.getTime();
      const to = new Date(next.getFullYear(), next.getMonth() + 1, 0, 23, 59, 59, 999).getTime();
      onRangeChange(from, to);
    }
  };

  const handleSelectDate = (d: Date) => {
    setSelectedDate(d);
    setActiveTimeframe(null);
    setSelectedSlot(null);
  };

  const handleConfirm = () => {
    if (!selectedDate || !selectedSlot) return;
    const dateStr = ymd(selectedDate);
    onConfirm({
      iso: `${dateStr}T${selectedSlot}`,
      date: dateStr,
      timeLabel: selectedSlot,
      offerId,
      timeframeId: activeTimeframe?.id,
    });
    onClose();
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <div className="absolute inset-0 bg-black/40" onClick={onClose} />

        <motion.section
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="absolute bottom-0 inset-x-0 rounded-t-3xl bg-[#FAF7F0] p-4 max-h-[85vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => goMonth(-1)}
              className="p-2 rounded-full hover:bg-white/60 transition"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            <div className="text-center">
              <div className="font-semibold text-stone-800">
                {viewDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
              </div>
              {offerTitle && (
                <div className="text-xs text-stone-500">{offerTitle}</div>
              )}
            </div>

            <button
              onClick={() => goMonth(1)}
              className="p-2 rounded-full hover:bg-white/60 transition"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1 rounded-full hover:bg-white/60 transition"
          >
            <X className="h-5 w-5 text-stone-500" />
          </button>

          {/* Loading / Error */}
          {availabilityLoading && (
            <div className="text-center text-sm text-stone-500 py-2">Loading availability...</div>
          )}
          {availabilityError && (
            <div className="text-center text-sm text-rose-500 py-2">{availabilityError}</div>
          )}

          {/* Weekday headers */}
          <div className="grid grid-cols-7 text-center text-xs text-stone-400 mb-2">
            {WEEKDAYS.map((w) => (
              <div key={w}>{w}</div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-1 mb-4">
            {/* Empty cells for offset */}
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}

            {/* Days */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNum = i + 1;
              const d = new Date(viewDate.getFullYear(), viewDate.getMonth(), dayNum);
              const key = ymd(d);
              const isAvailable = availableDaySet.has(key);
              const isSelected = selectedDate && ymd(selectedDate) === key;
              const remaining = availableDays[key]?.remaining_slots;

              return (
                <button
                  key={key}
                  disabled={!isAvailable}
                  onClick={() => handleSelectDate(d)}
                  className={[
                    "relative h-10 rounded-xl text-sm font-medium transition",
                    !isAvailable
                      ? "opacity-30 cursor-not-allowed"
                      : isSelected
                      ? "bg-stone-900 text-white shadow-md"
                      : "bg-white hover:bg-white/80 text-stone-700",
                  ].join(" ")}
                >
                  {dayNum}
                  {isAvailable && remaining !== undefined && (
                    <span
                      className={[
                        "absolute -bottom-0.5 left-1/2 -translate-x-1/2 text-[8px] px-1 rounded",
                        remaining <= 3 ? "bg-rose-100 text-rose-500" : "bg-emerald-50 text-emerald-600",
                      ].join(" ")}
                    >
                      {remaining}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Timeframes */}
          {timeframes.length > 0 && (
            <div className="flex gap-2 mb-3 flex-wrap">
              {timeframes.map((tf) => (
                <button
                  key={tf.id}
                  onClick={() => {
                    setActiveTimeframe(tf);
                    setSelectedSlot(null);
                  }}
                  className={[
                    "px-4 py-2 rounded-full text-sm font-medium transition",
                    activeTimeframe?.id === tf.id
                      ? "bg-stone-900 text-white"
                      : "bg-white text-stone-700 hover:bg-white/80",
                  ].join(" ")}
                >
                  {tf.label}
                </button>
              ))}
            </div>
          )}

          {/* Time slots */}
          {slots.length > 0 && (
            <div className="grid grid-cols-4 gap-2 mb-4">
              {slots.map((s) => (
                <button
                  key={s.iso}
                  onClick={() => setSelectedSlot(s.iso)}
                  className={[
                    "py-2 rounded-lg text-sm font-medium transition",
                    selectedSlot === s.iso
                      ? "bg-stone-900 text-white"
                      : "bg-white text-stone-700 hover:bg-white/80",
                  ].join(" ")}
                >
                  {s.label}
                </button>
              ))}
            </div>
          )}

          {/* CTA */}
          <button
            disabled={!selectedSlot}
            onClick={handleConfirm}
            className="w-full py-3 rounded-xl bg-stone-900 text-white font-semibold disabled:opacity-40 transition"
          >
            Confirm booking
          </button>
        </motion.section>
      </motion.div>
    </AnimatePresence>
  );
}
