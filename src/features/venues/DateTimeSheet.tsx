
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
            className="absolute bottom-0 left-0 right-0 max-h-[85vh] rounded-t-3xl bg-white overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <h2 className="text-lg font-semibold">Select Date & Time</h2>
              <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              {/* Month navigation */}
              <div className="flex items-center justify-between">
                <button
                  onClick={() => goMonth(-1)}
                  className="p-2 rounded-full hover:bg-gray-100"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <AnimatePresence mode="wait" initial={false}>
                  <motion.span
                    key={makeKey(viewDate)}
                    initial={{ opacity: 0, x: monthDirection * 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: monthDirection * -20 }}
                    className="font-medium"
                  >
                    {viewDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                  </motion.span>
                </AnimatePresence>
                <button
                  onClick={() => goMonth(1)}
                  className="p-2 rounded-full hover:bg-gray-100"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              {/* Weekday headers */}
              <div className="grid grid-cols-7 gap-1 text-center text-sm text-gray-500">
                {weekdayLabels.map((d) => (
                  <div key={d}>{d}</div>
                ))}
              </div>

              {/* Calendar grid */}
              {availabilityLoading ? (
                <div className="flex justify-center py-8">
                  <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin" />
                </div>
              ) : availabilityError ? (
                <div className="text-center py-8 text-red-500 text-sm">{availabilityError}</div>
              ) : (
                <div className="grid grid-cols-7 gap-1">
                  {calendarDays.map(({ date, key }) => {
                    if (!date) return <div key={key} />;
                    const dateKey = ymd(date);
                    const isPast = date.getTime() < today.getTime();
                    const isAvailable = isDayAvailable(dateKey);
                    const isSelected = selectedDateKey === dateKey;
                    const isToday = dateKey === ymd(today);

                    return (
                      <button
                        key={key}
                        disabled={isPast || !isAvailable}
                        onClick={() => handleSelectDate(date)}
                        className={`aspect-square flex items-center justify-center text-sm rounded-full transition-colors ${
                          isSelected
                            ? "bg-black text-white"
                            : isPast || !isAvailable
                            ? "text-gray-300 cursor-not-allowed"
                            : isToday
                            ? "border border-black"
                            : "hover:bg-gray-100"
                        }`}
                      >
                        {date.getDate()}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Timeframe tabs */}
              {timeframes.length > 0 && (
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {timeframes.map((tf) => (
                    <button
                      key={tf.id}
                      onClick={() => setActiveTf(tf)}
                      className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition-colors ${
                        activeTf?.id === tf.id
                          ? "bg-black text-white"
                          : "bg-gray-100 hover:bg-gray-200"
                      }`}
                    >
                      {tf.label}
                    </button>
                  ))}
                </div>
              )}

              {/* Time slots */}
              {loadingSlots ? (
                <div className="flex justify-center py-4">
                  <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                </div>
              ) : slots.length > 0 ? (
                <div className="grid grid-cols-3 gap-2">
                  {slots.map((slot) => (
                    <button
                      key={slot.iso}
                      disabled={slot.disabled}
                      onClick={() => setSelectedSlot(slot)}
                      className={`py-3 rounded-lg text-sm transition-colors ${
                        selectedSlot?.iso === slot.iso
                          ? "bg-black text-white"
                          : slot.disabled
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : "bg-gray-100 hover:bg-gray-200"
                      }`}
                    >
                      {slot.label}
                    </button>
                  ))}
                </div>
              ) : selectedDate && timeframes.length === 0 ? (
                <p className="text-center text-gray-500 text-sm py-4">
                  No available times for this date
                </p>
              ) : null}
            </div>

            {/* Confirm button */}
            <div className="p-4 border-t">
              <button
                disabled={!selectedSlot}
                onClick={() => {
                  if (selectedSlot && selectedDate) {
                    onConfirm({
                      iso: selectedSlot.iso,
                      date: ymd(selectedDate),
                      timeLabel: selectedSlot.label,
                      offerId,
                      timeframeId: activeTf?.id,
                    });
                  }
                }}
                className={`w-full py-3 rounded-full font-medium transition-colors ${
                  selectedSlot
                    ? "bg-black text-white"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                }`}
              >
                Confirm
              </button>
            </div>
          </motion.section>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
