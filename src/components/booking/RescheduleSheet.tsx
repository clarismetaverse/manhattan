import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, X, Calendar, Loader2 } from "lucide-react";

interface RescheduleSheetProps {
  open: boolean;
  onClose: () => void;
  bookingId: number;
  offerUpgradeId: number;
  currentDate?: string | null;
  venueName?: string;
  onReschedule: (payload: {
    bookingId: number;
    newDate: string;
    newTimeLabel: string;
    timeslotId?: number;
  }) => Promise<void>;
}

type Timeframe = {
  id: string;
  label: string;
  start: { h: number; m: number };
  end: { h: number; m: number };
  stepMins?: number;
  timeslotId?: number;
};

type Slot = {
  label: string;
  iso: string;
};

type RawResponse = {
  book?: Array<{ timestamp: number; status: string; timeslot_id: number }>;
  offer_timeslot?: Array<{
    timeslot_id: number;
    active: boolean;
    _timeslot?: Array<{
      id: number;
      Active: boolean;
      Start_time: number;
      End_time: number;
    }>;
  }>;
};

type MicroResponse = {
  available_days?: Array<{ date: string; available: boolean; remaining_slots: number }>;
};

const RAW_URL = "https://xbut-eryu-hhsg.f2.xano.io/api:vGd6XDW3/calendar/raw/Data";
const MICRO_URL = "https://calendar-microservice.vercel.app/api/calendar";

const transition = { type: "spring" as const, stiffness: 260, damping: 30 };
const weekdayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function ymd(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function clampDate(date: Date) {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function minsToHm(mins: number) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return { h, m };
}

function hmToLabel(h: number, m: number) {
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
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
      label: dt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      iso: dt.toISOString(),
    });
  }
  return slots;
}

function getMonthRangeISO(viewDate: Date) {
  const from = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1);
  const to = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0);
  return { fromISO: ymd(from), toISO: ymd(to) };
}

export default function RescheduleSheet({
  open,
  onClose,
  bookingId,
  offerUpgradeId,
  currentDate,
  venueName,
  onReschedule,
}: RescheduleSheetProps) {
  const today = useMemo(() => clampDate(new Date()), []);
  const [viewDate, setViewDate] = useState<Date>(today);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [monthDirection, setMonthDirection] = useState<1 | -1>(1);

  const [raw, setRaw] = useState<RawResponse | null>(null);
  const [availableDays, setAvailableDays] = useState<Record<string, { remaining_slots: number }>>({});
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [availabilityError, setAvailabilityError] = useState<string | null>(null);

  const [timeframes, setTimeframes] = useState<Timeframe[]>([]);
  const [activeTf, setActiveTf] = useState<Timeframe | null>(null);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);

  const [submitting, setSubmitting] = useState(false);

  // Reset state when closed
  useEffect(() => {
    if (!open) {
      setSelectedDate(null);
      setSelectedSlot(null);
      setActiveTf(null);
    }
  }, [open]);

  // Set initial view to current date if available
  useEffect(() => {
    if (open && currentDate) {
      const parsed = new Date(`${currentDate}T00:00:00`);
      if (!Number.isNaN(parsed.getTime())) {
        setViewDate(clampDate(parsed));
      }
    }
  }, [open, currentDate]);

  // Load availability when month changes
  useEffect(() => {
    let cancelled = false;

    async function loadMonthAvailability() {
      if (!open || !offerUpgradeId) return;

      const { fromISO, toISO } = getMonthRangeISO(viewDate);
      setAvailabilityLoading(true);
      setAvailabilityError(null);

      try {
        const rawRes = await fetch(RAW_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ offer_upgrade_id: offerUpgradeId, from: fromISO, to: toISO }),
        });

        if (!rawRes.ok) throw new Error(`RAW error ${rawRes.status}`);
        const rawJson: RawResponse = await rawRes.json();
        if (cancelled) return;
        setRaw(rawJson);

        const microRes = await fetch(MICRO_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            offer_upgrade_id: offerUpgradeId,
            from: fromISO,
            to: toISO,
            book: rawJson.book || [],
            offer_timeslot: rawJson.offer_timeslot || [],
          }),
        });

        if (!microRes.ok) throw new Error(`MICRO error ${microRes.status}`);
        const microJson: MicroResponse = await microRes.json();

        const map: Record<string, { remaining_slots: number }> = {};
        for (const d of microJson.available_days || []) {
          if (d?.date && d.available && typeof d.remaining_slots === "number") {
            map[d.date] = { remaining_slots: d.remaining_slots };
          }
        }
        if (!cancelled) setAvailableDays(map);
      } catch (e: any) {
        if (!cancelled) {
          setAvailabilityError(e?.message || "Failed to load availability");
          setAvailableDays({});
          setRaw(null);
        }
      } finally {
        if (!cancelled) setAvailabilityLoading(false);
      }
    }

    loadMonthAvailability();
    return () => { cancelled = true; };
  }, [open, viewDate, offerUpgradeId]);

  // Build timeframes when date selected
  useEffect(() => {
    if (!raw?.offer_timeslot || !selectedDate) {
      setTimeframes([]);
      setActiveTf(null);
      return;
    }

    const dateISO = ymd(selectedDate);
    const dayInfo = availableDays[dateISO];
    if (!dayInfo || dayInfo.remaining_slots <= 0) {
      setTimeframes([]);
      setActiveTf(null);
      return;
    }

    const tfs: Timeframe[] = [];
    for (const ots of raw.offer_timeslot) {
      if (!ots?.active) continue;
      for (const t of ots._timeslot || []) {
        if (!t?.Active) continue;
        const start = minsToHm(t.Start_time);
        const end = minsToHm(t.End_time);
        tfs.push({
          id: `timeslot-${ots.timeslot_id}-${t.id}`,
          label: `${hmToLabel(start.h, start.m)} - ${hmToLabel(end.h, end.m)}`,
          start,
          end,
          stepMins: 30,
          timeslotId: ots.timeslot_id,
        });
      }
    }
    tfs.sort((a, b) => (a.start.h * 60 + a.start.m) - (b.start.h * 60 + b.start.m));
    setTimeframes(tfs);
    setActiveTf(tfs[0] ?? null);
    setSelectedSlot(null);
  }, [raw, selectedDate, availableDays]);

  // Build slots from timeframe
  useEffect(() => {
    if (!selectedDate || !activeTf) {
      setSlots([]);
      return;
    }
    const dateISO = ymd(selectedDate);
    const dayInfo = availableDays[dateISO];
    if (!dayInfo || dayInfo.remaining_slots <= 0) {
      setSlots([]);
      return;
    }
    setSlots(synthesizeFromTimeframe(dateISO, activeTf));
    setSelectedSlot(null);
  }, [activeTf, selectedDate, availableDays]);

  const isDayAvailable = useCallback(
    (dateKey: string) => {
      if (availabilityLoading || availabilityError) return false;
      return Boolean(availableDays[dateKey]);
    },
    [availableDays, availabilityLoading, availabilityError]
  );

  const calendarDays = useMemo(() => {
    const start = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1);
    const end = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0);
    const startWeekday = start.getDay();
    const totalDays = end.getDate();

    const cells: Array<{ date: Date | null; key: string }> = [];
    for (let i = 0; i < startWeekday; i++) cells.push({ date: null, key: `blank-${i}` });
    for (let day = 1; day <= totalDays; day++) {
      const d = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
      cells.push({ date: d, key: ymd(d) });
    }
    const remainder = cells.length % 7;
    if (remainder !== 0) {
      for (let i = 0; i < 7 - remainder; i++) cells.push({ date: null, key: `pad-${i}` });
    }
    return cells;
  }, [viewDate]);

  const handleSelectDate = useCallback(
    (date: Date | null) => {
      if (!date) return;
      const dateKey = ymd(date);
      const isPast = date.getTime() < today.getTime();
      if (isPast || !isDayAvailable(dateKey)) return;
      setSelectedDate(clampDate(date));
    },
    [isDayAvailable, today]
  );

  const goMonth = useCallback((direction: 1 | -1) => {
    setMonthDirection(direction);
    setViewDate(prev => new Date(prev.getFullYear(), prev.getMonth() + direction, 1));
  }, []);

  const handleConfirm = useCallback(async () => {
    if (!selectedDate || !selectedSlot) return;
    setSubmitting(true);
    try {
      await onReschedule({
        bookingId,
        newDate: ymd(selectedDate),
        newTimeLabel: selectedSlot.label,
        timeslotId: activeTf?.timeslotId,
      });
      onClose();
    } catch (e) {
      console.error("Reschedule failed:", e);
    } finally {
      setSubmitting(false);
    }
  }, [selectedDate, selectedSlot, activeTf, bookingId, onReschedule, onClose]);

  const selectedDateKey = selectedDate ? ymd(selectedDate) : null;
  const canConfirm = selectedDate && selectedSlot && !submitting;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[60]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="absolute inset-0 bg-black/40"
            onClick={onClose}
          />

          <motion.section
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={transition}
            className="absolute inset-x-0 bottom-0 max-h-[90vh] overflow-auto rounded-t-3xl bg-white px-4 pb-6 pt-3"
          >
            {/* Handle */}
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-stone-300" />

            {/* Header */}
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-stone-800">Reschedule Booking</h2>
                {venueName && <p className="text-sm text-stone-500">{venueName}</p>}
              </div>
              <button onClick={onClose} className="rounded-full p-1 text-stone-500 hover:bg-stone-100">
                <X className="h-5 w-5" />
              </button>
            </div>

            {availabilityError && (
              <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
                {availabilityError}
              </div>
            )}

            {/* Month navigation */}
            <div className="mb-4 flex items-center justify-between">
              <button onClick={() => goMonth(-1)} className="rounded-full p-2 text-stone-600 hover:bg-stone-100">
                <ChevronLeft className="h-5 w-5" />
              </button>
              <span className="font-medium text-stone-800">
                {viewDate.toLocaleDateString(undefined, { month: "long", year: "numeric" })}
              </span>
              <button onClick={() => goMonth(1)} className="rounded-full p-2 text-stone-600 hover:bg-stone-100">
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>

            {/* Weekday headers */}
            <div className="mb-2 grid grid-cols-7 gap-1 text-center text-xs font-medium text-stone-500">
              {weekdayLabels.map((d) => <div key={d}>{d}</div>)}
            </div>

            {/* Calendar grid */}
            <AnimatePresence mode="wait">
              <motion.div
                key={`${viewDate.getFullYear()}-${viewDate.getMonth()}`}
                initial={{ opacity: 0, x: monthDirection > 0 ? 30 : -30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: monthDirection > 0 ? -30 : 30 }}
                transition={{ duration: 0.2 }}
                className="mb-6 grid grid-cols-7 gap-1"
              >
                {calendarDays.map(({ date, key }) => {
                  if (!date) return <div key={key} className="h-10" />;
                  const dateKey = ymd(date);
                  const isPast = date.getTime() < today.getTime();
                  const isAvailable = isDayAvailable(dateKey);
                  const isSelected = dateKey === selectedDateKey;
                  const disabled = isPast || !isAvailable || availabilityLoading;

                  return (
                    <button
                      key={key}
                      onClick={() => handleSelectDate(date)}
                      disabled={disabled}
                      className={[
                        "flex h-10 items-center justify-center rounded-full text-sm font-medium transition-colors",
                        isSelected
                          ? "bg-primary text-primary-foreground"
                          : disabled
                          ? "text-stone-300 cursor-not-allowed"
                          : "text-stone-700 hover:bg-stone-100",
                      ].join(" ")}
                    >
                      {date.getDate()}
                    </button>
                  );
                })}
              </motion.div>
            </AnimatePresence>

            {/* Loading indicator */}
            {availabilityLoading && (
              <div className="mb-4 flex items-center justify-center gap-2 text-sm text-stone-500">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading availability...
              </div>
            )}

            {/* Timeframes */}
            {timeframes.length > 0 && (
              <div className="mb-4">
                <h3 className="mb-2 text-sm font-medium text-stone-600">Select Timeframe</h3>
                <div className="flex flex-wrap gap-2">
                  {timeframes.map((tf) => (
                    <button
                      key={tf.id}
                      onClick={() => setActiveTf(tf)}
                      className={[
                        "rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
                        activeTf?.id === tf.id
                          ? "bg-primary text-primary-foreground"
                          : "bg-stone-100 text-stone-700 hover:bg-stone-200",
                      ].join(" ")}
                    >
                      {tf.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Time slots */}
            {slots.length > 0 && (
              <div className="mb-6">
                <h3 className="mb-2 text-sm font-medium text-stone-600">Select Time</h3>
                <div className="grid grid-cols-4 gap-2">
                  {slots.map((slot) => (
                    <button
                      key={slot.iso}
                      onClick={() => setSelectedSlot(slot)}
                      className={[
                        "rounded-lg px-2 py-2 text-sm font-medium transition-colors",
                        selectedSlot?.iso === slot.iso
                          ? "bg-primary text-primary-foreground"
                          : "bg-stone-100 text-stone-700 hover:bg-stone-200",
                      ].join(" ")}
                    >
                      {slot.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Confirm button */}
            <button
              onClick={handleConfirm}
              disabled={!canConfirm}
              className={[
                "w-full rounded-full py-3 text-center font-semibold transition-colors",
                canConfirm
                  ? "bg-primary text-primary-foreground hover:bg-primary/90"
                  : "bg-stone-200 text-stone-400 cursor-not-allowed",
              ].join(" ")}
            >
              {submitting ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Rescheduling...
                </span>
              ) : (
                "Confirm New Date"
              )}
            </button>
          </motion.section>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
