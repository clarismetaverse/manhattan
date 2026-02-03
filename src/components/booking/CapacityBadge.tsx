type CapacityBadgeProps = {
  left?: number;
  variant?: "day" | "slot";
};

export function CapacityBadge({ left, variant = "day" }: CapacityBadgeProps) {
  if (left === undefined || left === null) return null;

  const isLow = left <= 3;

  if (variant === "slot") {
    return (
      <span
        className={[
          "text-[10px] font-medium px-1.5 py-0.5 rounded-full",
          isLow
            ? "bg-rose-100 text-rose-600"
            : "bg-stone-100 text-stone-600",
        ].join(" ")}
      >
        {left} left
      </span>
    );
  }

  // variant === "day"
  return (
    <span
      className={[
        "text-[9px] font-medium px-1 rounded",
        isLow
          ? "bg-rose-100 text-rose-500"
          : "bg-emerald-50 text-emerald-600",
      ].join(" ")}
    >
      {left}
    </span>
  );
}
