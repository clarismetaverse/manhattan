
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
  timeslotId?: number;
};

export interface DateTimeSheetProps {
  open: boolean;
  onClose: () => void;
  offerId: string; // offer_upgrade_id
  venueId: string | number; // not used here but kept for app consistency
  availableDaySet?: Set<string>;
  availableDays?: Record<string, { remaining_slots: number }>;
  availabilityLoading?: boolean;
  availabilityError?: string | null;
  onRangeChange?: (fromMs: number, toMs: number) => void;
  timeframesByDow?: Record<number, Timeframe[]>;
  onConfirm: (payload: {
    iso: string;
    date: string;
    timeLabel: string;
    offerId: string;
    timeframeId?: string;
  }) => void;
}

const RAW_URL = "https://xbut-eryu-hhsg.f2.xano.io/api:vGd6XDW3/calendar/raw/Data";
const MICRO_URL = "https://calendar-microservice.vercel.app/api/calendar";

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
  const from = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1, 0, 0, 0, 0);
  const to = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0, 0, 0, 0, 0);
  return { fromISO: ymd(from), toISO: ymd(to) };
}

type RawResponse = {
  book?: Array<{ timestamp: number; status: string; timeslot_id: number }>;
  offer_timeslot?: Array<{
    timeslot_id: number;
    active: boolean;
    capacity_override?: number;
    slot_limit?: string;
    slot_limit_value?: number;
    _timeslot?: Array<{
      id: number;
      Active: boolean;
      Start_time: number; // minutes
      End_time: number; // minutes
    }>;
  }>;
};

type MicroResponse = {
  available_days?: Array<{ date: string; available: boolean; remaining_slots: number }>;
};

export default function DateTimeSheet({
  open,
  onClose,
  offerId,
  venueId,
  onConfirm,
}: DateTimeSheetProps) {
  const today = useMemo(() => clampDate(new Date()), []);
  const [viewDate, setViewDate] = useState<Date>(today);
  const [selectedDate, setSelectedDate] = useState<Date>(today);

  const [raw, setRaw] = useState<RawResponse | null>(null);

  const [availableDays, setAvailableDays] = useState<Record<string, { remaining_slots: number }>>(
    {}
  );
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [availabilityError, setAvailabilityError] = useState<string | null>(null);

  const [timeframes, setTimeframes] = useState<Timeframe[]>([]);
  const [activeTf, setActiveTf] = useState<Timeframe | null>(null);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);

  const [loadingSlots, setLoadingSlots] = useState(false);
  const [monthDirection, setMonthDirection] = useState<1 | -1>(1);

  const offerUpgradeIdNum = useMemo(() => {
    const n = Number(offerId);
    return Number.isFinite(n) ? n : null;
  }, [offerId]);

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

  // 1) RAW + microservice quando cambia il mese (o open)
  useEffect(() => {
    let cancelled = false;

    async function loadMonthAvailability() {
      if (!open) return;

      if (!offerUpgradeIdNum) {
        setAvailabilityError("Invalid offerId");
        setAvailableDays({});
        setRaw(null);
        return;
      }

      const { fromISO, toISO } = getMonthRangeISO(viewDate);

      setAvailabilityLoading(true);
      setAvailabilityError(null);

      try {
        // RAW
        const rawRes = await fetch(RAW_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({
            offer_upgrade_id: offerUpgradeIdNum,
            from: fromISO,
            to: toISO,
          }),
        });

        if (!rawRes.ok) throw new Error(`RAW error ${rawRes.status}`);

        const rawJson: RawResponse = await rawRes.json();
        const book = Array.isArray(rawJson.book) ? rawJson.book : [];
        const offer_timeslot = Array.isArray(rawJson.offer_timeslot) ? rawJson.offer_timeslot : [];

        if (cancelled) return;
        setRaw({ book, offer_timeslot });

        // MICRO (NB: il micro richiede anche offer_upgrade_id)
        const microRes = await fetch(MICRO_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({
            offer_upgrade_id: offerUpgradeIdNum,
            from: fromISO,
            to: toISO,
            book,
            offer_timeslot,
          }),
        });

        if (!microRes.ok) throw new Error(`MICRO error ${microRes.status}`);

        const microJson: MicroResponse = await microRes.json();
        const days = Array.isArray(microJson.available_days) ? microJson.available_days : [];

        const map: Record<string, { remaining_slots: number }> = {};
        for (const d of days) {
          if (!d?.date) continue;
          if (d.available && typeof d.remaining_slots === "number") {
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
    return () => {
      cancelled = true;
    };
  }, [open, viewDate, offerUpgradeIdNum]);

  // 2) timeframes dal RAW quando cambia selectedDate
  useEffect(() => {
    if (!raw?.offer_timeslot || !selectedDate) {
      setTimeframes([]);
      setActiveTf(null);
      return;
    }

    const dateISO = ymd(selectedDate);
    const dayInfo = availableDays[dateISO];
    const dayRemaining = dayInfo?.remaining_slots ?? 0;

    if (!dayInfo || dayRemaining <= 0) {
      setTimeframes([]);
      setActiveTf(null);
      return;
    }

    const tfs: Timeframe[] = [];
    for (const ots of raw.offer_timeslot) {
      if (!ots?.active) continue;
      const ts = Array.isArray(ots._timeslot) ? ots._timeslot : [];
      for (const t of ts) {
        if (!t?.Active) continue;
        const start = minsToHm(t.Start_time);
        const end = minsToHm(t.End_time);
        const label = `${hmToLabel(start.h, start.m)} - ${hmToLabel(end.h, end.m)}`;

        tfs.push({
          id: `timeslot-${ots.timeslot_id}-${t.id}`,
          label,
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

  // 3) slots dalla timeframe
  useEffect(() => {
    let cancelled = false;

    async function loadSlots() {
      if (!selectedDate || !activeTf) {
        setSlots([]);
        return;
      }
      setLoadingSlots(true);
      setSelectedSlot(null);

      const dateISO = ymd(selectedDate);
      const dayInfo = availableDays[dateISO];
      const dayRemaining = dayInfo?.remaining_slots ?? 0;

      if (!dayInfo || dayRemaining <= 0) {
        setSlots([]);
        setLoadingSlots(false);
        return;
      }

      const synthesized = synthesizeFromTimeframe(dateISO, activeTf);

      if (!cancelled) {
        setSlots(synthesized);
        setLoadingSlots(false);
      }
    }

    loadSlots();
    return () => {
      cancelled = true;
    };
  }, [activeTf, selectedDate, availableDays]);

  const availabilityDisabled = availabilityLoading || Boolean(availabilityError);

  const isDayAvailable = useCallback(
    (dateKey: string) => {
      if (availabilityDisabled) return false;
      return Boolean(availableDays[dateKey]);
    },
    [availableDays, availabilityDisabled]
  );

  const calendarDays = useMemo(() => {
    const start = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1);
    const end = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0);
    const startWeekday = start.getDay();
    const totalDays = end.getDate();

    const cells: Array<{ date: Date | null; key: string }> = [];
    for (let i = 0; i < startWeekday; i += 1) cells.push({ date: null, key: `blank-${i}` });

    for (let day = 1; day <= totalDays; day += 1) {
      const d = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
      cells.push({ date: d, key: ymd(d) });
    }

    const remainder = cells.length % 7;
    if (remainder !== 0) {
      const pads = 7 - remainder;
      for (let i = 0; i < pads; i += 1) cells.push({ date: null, key: `pad-${i}` });
    }

    return cells;
  }, [viewDate]);

  const handleSelectDate = useCallback(
    (date: Date | null) => {
      if (!date) return;
      const dateKey = ymd(date);
      const isPast = date.getTime() < today.getTime();
      const isAvailable = isDayAvailable(dateKey);
      if (isPast || !isAvailable) return;
      setSelectedDate(clampDate(date));
    },
    [isDayAvailable, today]
  );

  const goMonth = useCallback((direction: 1 | -1) => {
    setMonthDirection(direction);
    setViewDate(prev => new Date(prev.getFullYear(), prev.getMonth() + direction, 1));
  }, []);

  const selectedDateKey = selectedDate ? ymd(selectedDate) : null;

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
            className="absolute inset-x-0 bottom-0 max-h-[90vh] overflow-auto rounded-t-3xl bg-white px-4 pb-6 pt-3"
          >
            {/* Handle */}
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-stone-300" />

            {/* Header */}
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-stone-800">Select Date & Time</h2>
              <button
                onClick={onClose}
                className="rounded-full p-1 text-stone-500 hover:bg-stone-100"
              >
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
              <button
                onClick={() => goMonth(-1)}
                className="rounded-full p-2 text-stone-600 hover:bg-stone-100"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <span className="font-medium text-stone-800">
                {viewDate.toLocaleDateString(undefined, { month: "long", year: "numeric" })}
              </span>
              <button
                onClick={() => goMonth(1)}
                className="rounded-full p-2 text-stone-600 hover:bg-stone-100"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>

            {/* Weekday headers */}
            <div className="mb-2 grid grid-cols-7 gap-1 text-center text-xs font-medium text-stone-500">
              {weekdayLabels.map((d) => (
                <div key={d}>{d}</div>
              ))}
            </div>

            {/* Calendar grid */}
            <AnimatePresence mode="wait">
              <motion.div
                key={makeKey(viewDate)}
                initial={{ opacity: 0, x: monthDirection > 0 ? 30 : -30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: monthDirection > 0 ? -30 : 30 }}
                transition={{ duration: 0.2 }}
                className="mb-6 grid grid-cols-7 gap-1"
              >
                {calendarDays.map(({ date, key }) => {
                  if (!date) {
                    return <div key={key} className="h-10" />;
                  }
                  const dateKey = ymd(date);
                  const isPast = date.getTime() < today.getTime();
                  const isAvailable = isDayAvailable(dateKey);
                  const isSelected = dateKey === selectedDateKey;
                  const disabled = isPast || !isAvailable || availabilityDisabled;

                  return (
                    <button
                      key={key}
                      onClick={() => handleSelectDate(date)}
                      disabled={disabled}
                      className={[
                        "flex h-10 items-center justify-center rounded-full text-sm font-medium transition-colors",
                        isSelected
                          ? "bg-[#FF5A7A] text-white"
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

            {/* Timeframes */}
            {timeframes.length > 0 && (
              <div className="mb-4">
                <p className="mb-2 text-sm font-medium text-stone-600">Select a time range</p>
                <div className="flex flex-wrap gap-2">
                  {timeframes.map((tf) => (
                    <button
                      key={tf.id}
                      onClick={() => {
                        setActiveTf(tf);
                        setSelectedSlot(null);
                      }}
                      className={[
                        "rounded-full px-4 py-2 text-sm font-medium transition-colors",
                        activeTf?.id === tf.id
                          ? "bg-[#FF5A7A] text-white"
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
            {loadingSlots ? (
              <div className="text-center text-sm text-stone-500">Loading slots...</div>
            ) : slots.length > 0 ? (
              <div className="mb-4">
                <p className="mb-2 text-sm font-medium text-stone-600">Available times</p>
                <div className="grid grid-cols-4 gap-2">
                  {slots.map((slot) => (
                    <button
                      key={slot.iso}
                      onClick={() => setSelectedSlot(slot)}
                      disabled={slot.disabled}
                      className={[
                        "rounded-lg py-2 text-sm font-medium transition-colors",
                        selectedSlot?.iso === slot.iso
                          ? "bg-[#FF5A7A] text-white"
                          : slot.disabled
                          ? "bg-stone-50 text-stone-300 cursor-not-allowed"
                          : "bg-stone-100 text-stone-700 hover:bg-stone-200",
                      ].join(" ")}
                    >
                      {slot.label}
                    </button>
                  ))}
                </div>
              </div>
            ) : activeTf && selectedDate ? (
              <div className="mb-4 text-center text-sm text-stone-500">
                No available slots for this timeframe.
              </div>
            ) : null}

            {/* Confirm button */}
            <button
              onClick={() => {
                if (!selectedSlot || !selectedDate) return;
                onConfirm({
                  iso: selectedSlot.iso,
                  date: ymd(selectedDate),
                  timeLabel: selectedSlot.label,
                  offerId,
                  timeframeId: activeTf?.id,
                });
                onClose();
              }}
              disabled={!selectedSlot}
              className={[
                "w-full rounded-xl py-3 text-base font-semibold transition-colors",
                selectedSlot
                  ? "bg-[#FF5A7A] text-white"
                  : "bg-stone-200 text-stone-400 cursor-not-allowed",
              ].join(" ")}
            >
              Confirm
            </button>
          </motion.section>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
