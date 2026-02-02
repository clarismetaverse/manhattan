import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

type Props = {
  open: boolean;
  onClose: () => void;

  viewDate: Date;
  selectedDate: Date | null;
  onSelectDate: (d: Date) => void;
  onMonthChange: (dir: 1 | -1) => void;

  availableDays: Record<string, { remaining_slots: number }>;
  availabilityLoading?: boolean;
  availabilityError?: string | null;

  timeframes: {
    id: string;
    label: string;
  }[];
  activeTimeframe: { id: string } | null;
  onSelectTimeframe: (tf: any) => void;

  slots: {
    iso: string;
    label: string;
    disabled?: boolean;
  }[];
  selectedSlot: any;
  onSelectSlot: (s: any) => void;

  variant?: "day-first" | "fast";
  capacityMode?: "day" | "slot";

  onConfirm: () => void;
};

const weekday = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function DateTimeSheetLayout({
  open,
  onClose,
  viewDate,
  selectedDate,
  onSelectDate,
  onMonthChange,
  availableDays,
  availabilityLoading,
  availabilityError,
  timeframes,
  activeTimeframe,
  onSelectTimeframe,
  slots,
  selectedSlot,
  onSelectSlot,
  variant = "day-first",
  capacityMode = "day",
  onConfirm,
}: Props) {
  if (!open) return null;

  const ymd = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
      d.getDate()
    ).padStart(2, "0")}`;

  return (
    <motion.div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <motion.section
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        className="absolute bottom-0 inset-x-0 rounded-t-3xl bg-[#FAF7F0] p-4"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => onMonthChange(-1)}>
            <ChevronLeft />
          </button>

          <div className="font-semibold">
            {viewDate.toLocaleDateString([], { month: "long", year: "numeric" })}
          </div>

          <button onClick={() => onMonthChange(1)}>
            <ChevronRight />
          </button>
        </div>

        {/* Weekday */}
        <div className="grid grid-cols-7 text-center text-xs text-stone-400 mb-2">
          {weekday.map(w => (
            <div key={w}>{w}</div>
          ))}
        </div>

        {/* Calendar */}
        <div className="grid grid-cols-7 gap-2 mb-4">
          {Array.from({ length: 31 }).map((_, i) => {
            const d = new Date(
              viewDate.getFullYear(),
              viewDate.getMonth(),
              i + 1
            );
            const key = ymd(d);
            const day = availableDays[key];

            const disabled = !day;
            const selected = selectedDate && ymd(selectedDate) === key;

            return (
              <button
                key={key}
                disabled={disabled}
                onClick={() => onSelectDate(d)}
                className={`h-10 rounded-full relative text-sm ${
                  disabled
                    ? "opacity-30"
                    : selected
                    ? "bg-black text-white"
                    : "bg-white"
                }`}
              >
                {i + 1}
                {capacityMode === "day" && day && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-[9px] bg-white px-1 rounded">
                    {day.remaining_slots}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Timeframes */}
        {timeframes.length > 0 && (
          <div className="flex gap-2 mb-3 flex-wrap">
            {timeframes.map(tf => (
              <button
                key={tf.id}
                onClick={() => onSelectTimeframe(tf)}
                className={`px-3 py-1 rounded-full text-sm ${
                  activeTimeframe?.id === tf.id
                    ? "bg-black text-white"
                    : "bg-white"
                }`}
              >
                {tf.label}
              </button>
            ))}
          </div>
        )}

        {/* Slots */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          {slots.map(s => (
            <button
              key={s.iso}
              disabled={s.disabled}
              onClick={() => onSelectSlot(s)}
              className={`py-2 rounded text-sm ${
                selectedSlot?.iso === s.iso
                  ? "bg-black text-white"
                  : "bg-white"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* CTA */}
        <button
          disabled={!selectedSlot}
          onClick={onConfirm}
          className="w-full py-3 rounded-xl bg-black text-white font-semibold disabled:opacity-40"
        >
          {variant === "fast" ? "Book now" : "Confirm booking"}
        </button>
      </motion.section>
    </motion.div>
  );
}
