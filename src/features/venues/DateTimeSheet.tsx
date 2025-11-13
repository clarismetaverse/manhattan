import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

export type Slot = {
  label: string;
  iso: string;
  disabled?: boolean;
};

export type Timeframe = {
  id: string;
  label: string;
  start: { h: number; m: number };
  end: { h: number; m: number };
  stepMins?: number;
};

export interface DateTimeSheetProps {
  open: boolean;
  onClose: () => void;
  offerId: string;
  venueId: string | number;
  timeframesByDow?: Record<number, Timeframe[]>;
  resolveTimeframes?: (
    dateISO: string,
    offerId: string,
    venueId: string | number
  ) => Promise<Timeframe[]>;
  fetchSlots?: (
    dateISO: string,
    timeframe: Timeframe | null,
    offerId: string,
    venueId: string | number
  ) => Promise<Slot[] | null>;
  onConfirm: (
    payload: {
      iso: string;
      date: string;
      timeLabel: string;
      offerId: string;
      timeframeId?: string;
    }
  ) => void;
}

const transition = {
  type: "spring" as const,
  stiffness: 260,
  damping: 30,
};

const weekdayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function ymd(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function makeKey(date: Date) {
  return `${date.getFullYear()}-${date.getMonth()}`;
}

function clampDate(date: Date) {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function synthesizeFromTimeframe(date: string, tf: Timeframe): Slot[] {
  const step = tf.stepMins ?? 30;
  const base = new Date(`${date}T00:00:00`);
  const start = new Date(base);
  start.setHours(tf.start.h, tf.start.m, 0, 0);
  const end = new Date(base);
  end.setHours(tf.end.h, tf.end.m, 0, 0);

  const slots: Slot[] = [];
  for (let t = start.getTime(); t <= end.getTime(); t += step * 60_000) {
    const dt = new Date(t);
    slots.push({
      label: dt.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }),
      iso: dt.toISOString(),
    });
  }
  return slots;
}

export default function DateTimeSheet({
  open,
  onClose,
  offerId,
  venueId,
  timeframesByDow,
  resolveTimeframes,
  fetchSlots,
  onConfirm,
}: DateTimeSheetProps) {
  const today = useMemo(() => clampDate(new Date()), []);
  const [viewDate, setViewDate] = useState<Date>(today);
  const [selectedDate, setSelectedDate] = useState<Date>(today);
  const [timeframes, setTimeframes] = useState<Timeframe[]>([]);
  const [activeTf, setActiveTf] = useState<Timeframe | null>(null);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [loading, setLoading] = useState(false);
  const [monthDirection, setMonthDirection] = useState<1 | -1>(1);

  useEffect(() => {
    if (!open) {
      setSelectedSlot(null);
      setActiveTf(null);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    setViewDate(clampDate(selectedDate ?? today));
  }, [open, selectedDate, today]);

  useEffect(() => {
    let cancelled = false;

    async function loadTimeframes() {
      if (!selectedDate) return;
      setLoading(true);
      setSelectedSlot(null);
      const dateISO = ymd(selectedDate);
      let tfs: Timeframe[] = [];

      if (resolveTimeframes) {
        try {
          tfs = (await resolveTimeframes(dateISO, offerId, venueId)) || [];
        } catch (err) {
          console.error("resolveTimeframes failed", err);
          tfs = [];
        }
      } else if (timeframesByDow) {
        const dow = selectedDate.getDay();
        tfs = timeframesByDow[dow] || [];
      }

      if (!cancelled) {
        setTimeframes(tfs);
        setActiveTf(tfs[0] ?? null);
      }
      if (!cancelled) {
        setLoading(false);
      }
    }

    loadTimeframes();
    return () => {
      cancelled = true;
    };
  }, [selectedDate, resolveTimeframes, timeframesByDow, offerId, venueId]);

  useEffect(() => {
    let cancelled = false;

    async function loadSlots() {
      if (!selectedDate) return;
      setLoading(true);
      setSelectedSlot(null);
      const dateISO = ymd(selectedDate);
      let result: Slot[] | null = null;

      if (fetchSlots) {
        try {
          result = await fetchSlots(dateISO, activeTf, offerId, venueId);
        } catch (err) {
          console.error("fetchSlots failed", err);
          result = null;
        }
      }

      if ((!result || result.length === 0) && activeTf) {
        result = synthesizeFromTimeframe(dateISO, activeTf);
      }

      if (!cancelled) {
        setSlots(result ?? []);
        setLoading(false);
      }
    }

    loadSlots();
    return () => {
      cancelled = true;
    };
  }, [activeTf, selectedDate, fetchSlots, offerId, venueId]);

  const calendarDays = useMemo(() => {
    const start = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1);
    const end = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0);
    const startWeekday = start.getDay();
    const totalDays = end.getDate();

    const cells: Array<{ date: Date | null; key: string }> = [];
    for (let i = 0; i < startWeekday; i += 1) {
      cells.push({ date: null, key: `blank-${i}` });
    }

    for (let day = 1; day <= totalDays; day += 1) {
      const d = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
      cells.push({ date: d, key: ymd(d) });
    }

    const remainder = cells.length % 7;
    if (remainder !== 0) {
      const pads = 7 - remainder;
      for (let i = 0; i < pads; i += 1) {
        cells.push({ date: null, key: `pad-${i}` });
      }
    }

    return cells;
  }, [viewDate]);

  const handleSelectDate = useCallback((date: Date | null) => {
    if (!date) return;
    setSelectedDate(clampDate(date));
  }, []);

  const goMonth = useCallback(
    (direction: 1 | -1) => {
      setMonthDirection(direction);
      setViewDate(prev => new Date(prev.getFullYear(), prev.getMonth() + direction, 1));
    },
    []
  );

  const selectedDateKey = selectedDate ? ymd(selectedDate) : null;

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-[60]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <motion.div
            className="absolute inset-0 bg-black/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.section
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={transition}
            className="absolute inset-x-0 bottom-0 rounded-t-3xl bg-[#FAF7F0]/90 backdrop-blur-xl ring-1 ring-white/60 shadow-[inset_0_1px_0_rgba(255,255,255,.6)]"
          >
            <div className="relative px-5 pt-4 pb-6">
              <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-white/60" />
              <button
                onClick={onClose}
                className="absolute right-5 top-4 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/70 text-stone-600 ring-1 ring-white/60"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="space-y-5">
                <header className="flex items-center justify-between">
                  <button
                    onClick={() => goMonth(-1)}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/70 text-stone-600 ring-1 ring-white/60"
                    aria-label="Previous month"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <div className="text-sm font-semibold text-stone-700">
                    {viewDate.toLocaleDateString([], { month: "long", year: "numeric" })}
                  </div>
                  <button
                    onClick={() => goMonth(1)}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/70 text-stone-600 ring-1 ring-white/60"
                    aria-label="Next month"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </header>

                <div className="grid grid-cols-7 gap-2 text-center text-[11px] uppercase tracking-wide text-stone-400">
                  {weekdayLabels.map(label => (
                    <div key={label}>{label}</div>
                  ))}
                </div>

                <div className="relative">
                  <AnimatePresence initial={false} custom={monthDirection}>
                    <motion.div
                      key={makeKey(viewDate)}
                      custom={monthDirection}
                      initial={{ opacity: 0, x: monthDirection === 1 ? 40 : -40 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: monthDirection === 1 ? -40 : 40 }}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      className="grid grid-cols-7 gap-2"
                    >
                      {calendarDays.map(({ date, key }) => {
                        if (!date) {
                          return <div key={key} className="h-10" />;
                        }
                        const isToday = ymd(date) === ymd(today);
                        const isSelected = selectedDateKey === ymd(date);
                        return (
                          <button
                            key={key}
                            onClick={() => handleSelectDate(date)}
                            className={`relative flex h-10 items-center justify-center text-sm transition-all ${
                              isSelected
                                ? "text-stone-900"
                                : "text-stone-500 hover:text-stone-700"
                            }`}
                          >
                            <span
                              className={`inline-flex min-w-[2.25rem] items-center justify-center rounded-full px-2 py-1 ${
                                isSelected
                                  ? "bg-white text-stone-900 shadow-[0_6px_16px_rgba(0,0,0,.12)]"
                                  : isToday
                                  ? "text-stone-900"
                                  : "text-stone-500"
                              }`}
                            >
                              {date.getDate()}
                            </span>
                          </button>
                        );
                      })}
                    </motion.div>
                  </AnimatePresence>
                </div>

                {selectedDate && timeframes.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {timeframes.map(tf => {
                      const active = activeTf?.id === tf.id;
                      return (
                        <button
                          key={tf.id}
                          onClick={() => setActiveTf(tf)}
                          className={`rounded-full px-3 py-2 text-sm ring-1 transition ${
                            active
                              ? "bg-stone-900 text-white ring-stone-900"
                              : "bg-white/80 text-stone-800 ring-white/60 hover:bg-white"
                          }`}
                        >
                          {tf.label}
                        </button>
                      );
                    })}
                  </div>
                )}

                <div className="min-h-[4rem]">
                  <AnimatePresence initial={false}>
                    {loading && (
                      <motion.div
                        key="loading"
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        className="text-sm text-stone-500"
                      >
                        Loading availability…
                      </motion.div>
                    )}
                    {!loading && slots.length === 0 && (
                      <motion.div
                        key="empty"
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        className="text-sm text-stone-500"
                      >
                        No availability for this date.
                      </motion.div>
                    )}
                    {!loading && slots.length > 0 && (
                      <motion.div
                        key="slots"
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        className="flex flex-wrap gap-2"
                      >
                        {slots.map(slot => {
                          const isActive = selectedSlot?.iso === slot.iso;
                          return (
                            <button
                              key={slot.iso}
                              onClick={() => !slot.disabled && setSelectedSlot(slot)}
                              disabled={slot.disabled}
                              className={`rounded-full px-3 py-2 text-sm ring-1 transition ${
                                slot.disabled
                                  ? "cursor-not-allowed bg-white/40 text-stone-400 ring-white/40"
                                  : isActive
                                  ? "bg-stone-900 text-white ring-stone-900"
                                  : "bg-white/80 text-stone-800 ring-white/60 backdrop-blur-sm hover:bg-white"
                              }`}
                            >
                              {slot.label}
                            </button>
                          );
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <motion.button
                  whileTap={{ scale: selectedSlot ? 0.98 : 1 }}
                  animate={{
                    opacity: selectedSlot ? 1 : 0.6,
                    scale: 1,
                    backgroundColor: selectedSlot ? "#1c1917" : "rgba(255,255,255,0.7)",
                    color: selectedSlot ? "#ffffff" : "#44403c",
                    boxShadow: selectedSlot
                      ? "0 12px 20px rgba(28,25,23,0.2)"
                      : "inset 0 1px 0 rgba(255,255,255,0.8)",
                  }}
                  transition={{ type: "spring", stiffness: 420, damping: 34 }}
                  disabled={!selectedSlot}
                  onClick={() => {
                    if (!selectedSlot) return;
                    onConfirm({
                      iso: selectedSlot.iso,
                      date: ymd(new Date(selectedSlot.iso)),
                      timeLabel: selectedSlot.label,
                      offerId,
                      timeframeId: activeTf?.id,
                    });
                    onClose();
                  }}
                  className="mt-4 w-full rounded-2xl px-4 py-3 text-center font-semibold disabled:cursor-not-allowed"
                >
                  {selectedSlot ? `Confirm ${selectedSlot.label}` : "Select a time"}
                </motion.button>
              </div>
            </div>
          </motion.section>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

