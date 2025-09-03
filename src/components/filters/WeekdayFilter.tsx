import React, { useCallback, useEffect, useMemo, useRef } from "react";

export type WeekdayFilterProps = {
  isOpen: boolean;
  selectedDays: string[]; // Full day names e.g., "Monday"
  onDaysChange: (days: string[]) => void;
  onClose: () => void;
  className?: string;
  toggleRef?: React.RefObject<HTMLElement | null>;
};

const DAYS = [
  { short: "M", full: "Monday" },
  { short: "T", full: "Tuesday" },
  { short: "W", full: "Wednesday" },
  { short: "T", full: "Thursday" },
  { short: "F", full: "Friday" },
  { short: "S", full: "Saturday" },
  { short: "S", full: "Sunday" },
] as const;

const WeekdayFilter: React.FC<WeekdayFilterProps> = ({ isOpen, selectedDays, onDaysChange, onClose, className, toggleRef }) => {
  const ref = useRef<HTMLDivElement | null>(null);

  // Close on outside click, but ignore clicks on the toggle button
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (!ref.current) return;
      const target = e.target as Node;
      if (toggleRef?.current && toggleRef.current.contains(target)) return; // ignore toggle button
      if (!ref.current.contains(target)) onClose();
    }
    if (isOpen) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [isOpen, onClose, toggleRef]);

  const setToggled = useCallback(
    (full: string) => {
      const set = new Set(selectedDays);
      if (set.has(full)) set.delete(full);
      else set.add(full);
      onDaysChange(Array.from(set));
    },
    [selectedDays, onDaysChange]
  );

  const openClasses = isOpen ? "translate-y-0 opacity-100 pointer-events-auto" : "-translate-y-full opacity-0 pointer-events-none";

  const dayButtons = useMemo(() => (
    DAYS.map((d, idx) => {
      const isSelected = selectedDays.includes(d.full);
      return (
        <button
          key={`${d.full}-${idx}`}
          type="button"
          aria-label={d.full}
          aria-pressed={isSelected}
          onClick={() => setToggled(d.full)}
          className={[
            "min-h-11 h-11 rounded-2xl font-semibold select-none px-3",
            "flex items-center justify-center transition-all duration-150",
            "active:scale-95",
            // Glass base simplified to avoid CSS variable conflicts
            "backdrop-blur-sm border shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]",
            // Selected vs Unselected explicit classes with !important to override compiled CSS
            isSelected ? "!bg-red-500 !text-white !border-red-500" : "bg-white/5 text-gray-400 border-white/10",
          ].join(" ")}
          style={
            isSelected
              ? { backgroundColor: '#ef4444', color: '#ffffff', borderColor: '#ef4444' }
              : { backgroundColor: 'rgba(255, 255, 255, 0.05)', color: 'rgba(255, 255, 255, 0.6)', borderColor: 'rgba(255, 255, 255, 0.1)' }
          }
        >
          <span className="md:hidden">{d.short}</span>
          <span className="hidden md:inline">{d.full}</span>
        </button>
      );
    })
  ), [selectedDays, setToggled]);

  return (
    <div
      ref={ref}
      aria-label="Weekday filter"
      role="dialog"
      aria-describedby="weekday-filter-desc"
      className={[
        "absolute left-0 right-0 z-30",
        "mx-auto max-w-5xl px-4",
        className ?? "",
      ].join(" ")}
    >
      <div id="weekday-filter-desc" className="sr-only">Filter options: choose weekdays to refine places.</div>
      <div
        className={[
          // Glass morph container simplified to avoid CSS variable conflicts
          "rounded-2xl border border-white/10 bg-white/10 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.12)]",
          "p-2",
          // Animations
          "transform transition-all duration-300 ease-out",
          openClasses,
        ].join(" ")}
      >
        <div className="grid grid-cols-7 gap-2">
          {dayButtons}
        </div>
      </div>
    </div>
  );
};

export default WeekdayFilter;
