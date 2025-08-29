import * as React from "react"
import { cn } from "@/lib/utils"

export type FilterChipProps = {
  label: string
  selected?: boolean
  onToggle?: () => void
  icon?: React.ReactNode
  className?: string
  "aria-label"?: string
}

/**
 * FilterChip
 * - Minimal black/white; selected turns red (semantic destructive)
 * - Accessible: role="switch" + aria-checked
 */
export function FilterChip({ label, selected, onToggle, icon, className, ...rest }: FilterChipProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={!!selected}
      onClick={onToggle}
      className={cn(
        // Base
        "group inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-3 text-[11px] font-medium transition-all duration-200",
        // White scheme base
        "bg-[hsl(var(--filter-chip-bg))] text-[hsl(var(--filter-chip-text))] border [border-color:hsl(var(--filter-chip-border))]",
        // Interaction
        "hover:opacity-90 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        // Selected: bold red background, white text/icon
        selected ? "bg-[hsl(var(--filter-chip-selected-bg))] text-[hsl(var(--filter-chip-selected-text))] border-transparent" : "",
        className
      )}
      {...rest}
    >
      {icon ? <span className="inline-flex items-center text-current">{icon}</span> : null}
      <span className="truncate">{label}</span>
    </button>
  )
}

export default FilterChip
