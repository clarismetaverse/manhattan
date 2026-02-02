import { CapacityBadge } from "./CapacityBadge";

type TimeSlotChipProps = {
  label: string;
  active: boolean;
  disabled?: boolean;
  left?: number; // slot remaining
  onClick: () => void;
};

export function TimeSlotChip({ label, active, disabled, left, onClick }: TimeSlotChipProps) {
  return (
    <button
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={[
        "rounded-full px-3 py-2 text-sm ring-1 transition flex items-center gap-2",
        disabled
          ? "cursor-not-allowed bg-white/40 text-stone-400 ring-white/40"
          : active
          ? "bg-stone-900 text-white ring-stone-900"
          : "bg-white/80 text-stone-800 ring-white/60 hover:bg-white",
      ].join(" ")}
    >
      <span>{label}</span>
      <CapacityBadge left={left} variant="slot" />
    </button>
  );
}
