import { CapacityBadge } from "./CapacityBadge";

type DayCellProps = {
  dateISO: string; // YYYY-MM-DD
  dayNumber: number;
  isSelected: boolean;
  isDisabled: boolean;
  left?: number; // day remaining
  onClick: () => void;
};

export function DayCell({
  dateISO,
  dayNumber,
  isSelected,
  isDisabled,
  left,
  onClick,
}: DayCellProps) {
  return (
    <button
      onClick={isDisabled ? undefined : onClick}
      disabled={isDisabled}
      className={[
        "relative h-11 rounded-2xl px-2 py-2 text-left ring-1 transition",
        isDisabled
          ? "cursor-not-allowed bg-white/30 text-stone-300 ring-white/30"
          : isSelected
          ? "bg-white text-stone-900 ring-stone-900/10 shadow-[0_10px_22px_rgba(0,0,0,0.08)]"
          : "bg-white/70 text-stone-700 ring-white/60 hover:bg-white",
      ].join(" ")}
      aria-label={`Select ${dateISO}`}
    >
      <div className="flex items-start justify-between">
        <div className="text-sm font-semibold">{dayNumber}</div>
        <CapacityBadge left={left} variant="day" />
      </div>
      <div className="mt-1 text-[10px] text-stone-500">{dateISO}</div>
    </button>
  );
}
