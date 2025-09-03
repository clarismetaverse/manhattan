import * as React from "react"
import { useEffect, useMemo, useRef, useState } from "react"
import { X, AlertTriangle, Utensils, Sparkles, Coffee, Waves, Croissant, Calendar, Music, Target, Bolt, Zap, Video } from "lucide-react"

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"

import { Button } from "@/components/ui/button"

import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

import FilterChip from "./FilterChip"

// Types from API
export type TurboCategory = {
  id: number
  CategoryName: string
  filter_type: string // e.g., "area" | "category" | "booking" | "content"
}

export type AdvancedFilterMap = {
  area?: number[]
  category?: number[]
  content?: number[]
  booking?: number[]
}

export interface AdvancedFilterModalProps {
  isOpen: boolean
  onClose: () => void
  /** Persisted selections provided by parent (restored on open) */
  initialSelected?: AdvancedFilterMap
  /** Callback with 4 separate filter arrays */
  onApply: (result: AdvancedFilterMap) => void
}

const ENDPOINT = "https://xbut-eryu-hhsg.f2.xano.io/api:vGd6XDW3/category_venues_turbo"

function useFilterOptions(isOpen: boolean) {
  const [data, setData] = useState<TurboCategory[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  const fetchData = async () => {
    abortRef.current?.abort()
    const ac = new AbortController()
    abortRef.current = ac
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(ENDPOINT, { signal: ac.signal })
      if (!res.ok) throw new Error(`Failed to load filters: ${res.status}`)
      const json = (await res.json()) as TurboCategory[]
      setData(json)
    } catch (e: unknown) {
      if ((e as { name?: string }).name !== "AbortError") {
        const message = e instanceof Error ? e.message : "Unknown error"
        setError(message)
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isOpen) {
      fetchData()
    } else {
      abortRef.current?.abort()
    }
  }, [isOpen])

  return { data, loading, error, refetch: fetchData }
}

export function getActiveSelectionCount(map?: AdvancedFilterMap) {
  if (!map) return 0
  return Object.values(map).reduce((sum, arr) => sum + (arr?.length ?? 0), 0)
}

export default function AdvancedFilterModal({ isOpen, onClose, onApply, initialSelected }: AdvancedFilterModalProps) {
  

  const { data, loading, error, refetch } = useFilterOptions(isOpen)

  // Local selection map (group -> ids[])
  const [selected, setSelected] = useState<AdvancedFilterMap>({})
  

  // Restore selections when opening
  useEffect(() => {
    if (isOpen && initialSelected) {
      setSelected({
        category: initialSelected.category ?? [],
        area: initialSelected.area ?? [],
        booking: initialSelected.booking ?? [],
        content: initialSelected.content ?? [],
      })
    }
  }, [isOpen, initialSelected])

  const grouped = useMemo(() => {
    const res: Record<string, TurboCategory[]> = {}
    for (const item of data ?? []) {
      const key = item.filter_type || "other"
      if (!res[key]) res[key] = []
      res[key].push(item)
    }
    return res
  }, [data])


  const activeCount = getActiveSelectionCount(selected)

  const contentVariants = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 }, exit: { opacity: 0, y: 16 } }

  const toggleId = (group: string, id: number) => {
    setSelected((prev) => {
      const set = new Set(prev[group] ?? [])
      if (set.has(id)) set.delete(id)
      else set.add(id)
      return { ...prev, [group]: Array.from(set) }
    })
  }

  const clearAll = () => setSelected({})

  const apply = () => {
    // Send 4 separate arrays directly to API
    const result: AdvancedFilterMap = {
      area: selected.area ?? [],
      category: selected.category ?? [],
      content: selected.content ?? [],
      booking: selected.booking ?? [],
    }

    onApply(result)
    onClose()
  }

  // Ordered sections and icon mapping
  const normalize = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim()

  const CATEGORY_ORDER = [
    "restaurant",
    "beauty",
    "cafe",
    "beach club",
    "brunch",
    "private event",
    "night club",
    "run club",
    "activity",
  ]

  const CATEGORY_ICONS: Record<string, React.ReactNode> = {
    "restaurant": <Utensils className="h-4 w-4" />,
    "beauty": <Sparkles className="h-4 w-4" />,
    "cafe": <Coffee className="h-4 w-4" />,
    "beach club": <Waves className="h-4 w-4" />,
    "brunch": <Croissant className="h-4 w-4" />,
    "private event": <Calendar className="h-4 w-4" />,
    "night club": <Music className="h-4 w-4" />,
    "run club": <Zap className="h-4 w-4" />,
    "activity": <Target className="h-4 w-4" />,
  }

  const BOOKING_ORDER = ["fast booking"]
  const CONTENT_ORDER = ["tiktok"]

  const AREA_ORDER = [
    "kerobokan",
    "tibubeneng",
    "canggu",
    "ubud",
    "uluwatu",
    "jimbaran",
    "ungasan",
    "mengwi",
    "legian",
    "kuta",
    "nusa penida",
    "sanur",
    "seminyak",
    "denpasar",
  ]

  return (
    <Dialog open={isOpen} onOpenChange={(open) => (!open ? onClose() : undefined)}>
        {isOpen && (
          <DialogContent
            className="flex flex-col max-w-sm bg-gradient-to-b from-black via-gray-900 to-black border-gray-700/50 rounded-3xl shadow-2xl shadow-red-500/10 text-white p-0 overflow-hidden"
            aria-labelledby="filter-dialog-title"
            aria-describedby="filter-dialog-description"
          >
            <div id="filter-dialog-title" className="sr-only">Advanced restaurant filters</div>
            <div id="filter-dialog-description" className="sr-only">Filter options for restaurants</div>
            <div
              className="h-full max-h-[85vh] overflow-y-auto scrollbar-hide animate-fade-in"
              role="dialog"
              aria-label="Filters"
            >
              {/* Header */}
              <header className="flex items-center justify-between gap-3 border-b px-5 py-3 [border-color:hsl(var(--border)/0.5)]">
                <h2 className="text-base font-semibold text-[hsl(var(--filter-heading))]">Filters</h2>
                <button
                  aria-label="Close"
                  onClick={onClose}
                  className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <X className="h-5 w-5" />
                </button>
              </header>


              {/* Body */}
              <main className="flex-1 overflow-y-auto px-5 py-3 space-y-3">
                {loading && (
                  <div className="space-y-3">
                  <div className="flex items-center">
                    <Skeleton className="h-5 w-24" />
                  </div>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                      {Array.from({ length: 6 }).map((_, i) => (
                        <Skeleton key={i} className="h-11 rounded-xl" />
                      ))}
                    </div>
                  </div>
                )}

                {!loading && error && (
                  <div className="rounded-xl border p-4 text-sm [border-color:hsl(var(--destructive)/0.4)]">
                    <div className="flex items-center gap-2 text-destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <span>Failed to load filters.</span>
                    </div>
                    <div className="mt-3 flex items-center gap-2">
                      <Button size="sm" variant="outline" onClick={refetch}>
                        Retry
                      </Button>
                      <Button size="sm" variant="ghost" onClick={clearAll}>
                        Clear selections
                      </Button>
                    </div>
                  </div>
                )}

                {!loading && !error && (
                  <div className="space-y-5">
                    {/* Booking Types */}
                    {(() => {
                      const items = grouped["booking"] ?? []
                      if (!items.length) return null
                      const itemsSorted = [...items].sort((a, b) => a.CategoryName.localeCompare(b.CategoryName))
                      return (
                        <section aria-label="Booking Types" className="space-y-2">
                          <h3 className="text-sm font-extrabold uppercase text-[hsl(var(--filter-heading))]">Booking Types</h3>
                          <div className="flex flex-wrap gap-2">
                            {itemsSorted.map((it) => {
                              const current = new Set(selected["booking"] ?? [])
                              const isSelected = current.has(it.id)
                              return (
                                <FilterChip
                                  key={it.id}
                                  label={it.CategoryName}
                                  selected={isSelected}
                                  onToggle={() => toggleId("booking", it.id)}
                                  icon={<Bolt className="h-4 w-4" />}
                                  aria-label={`Toggle ${it.CategoryName}`}
                                />
                              )
                            })}
                          </div>
                        </section>
                      )
                    })()}

                    {/* Categories */}
                    {(() => {
                      const items = grouped["category"] ?? []
                      if (!items.length) return null
                      const itemsSorted = [...items].sort((a, b) => a.CategoryName.localeCompare(b.CategoryName))
                      return (
                        <section aria-label="Categories" className="space-y-2">
                          <h3 className="text-sm font-extrabold uppercase text-[hsl(var(--filter-heading))]">Categories</h3>
                          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                            {itemsSorted.map((it) => {
                              const current = new Set(selected["category"] ?? [])
                              const isSelected = current.has(it.id)
                              return (
                                <FilterChip
                                  key={it.id}
                                  label={it.CategoryName}
                                  selected={isSelected}
                                  onToggle={() => toggleId("category", it.id)}
                                  icon={CATEGORY_ICONS[normalize(it.CategoryName)]}
                                  aria-label={`Toggle ${it.CategoryName}`}
                                />
                              )
                            })}
                          </div>
                        </section>
                      )
                    })()}

                    {/* Content */}
                    {(() => {
                      const items = grouped["content"] ?? []
                      if (!items.length) return null
                      const itemsSorted = [...items].sort((a, b) => a.CategoryName.localeCompare(b.CategoryName))
                      return (
                        <section aria-label="Content" className="space-y-2">
                          <h3 className="text-sm font-extrabold uppercase text-[hsl(var(--filter-heading))]">Content</h3>
                          <div className="flex flex-wrap gap-2">
                            {itemsSorted.map((it) => {
                              const current = new Set(selected["content"] ?? [])
                              const isSelected = current.has(it.id)
                              return (
                                <FilterChip
                                  key={it.id}
                                  label={it.CategoryName}
                                  selected={isSelected}
                                  onToggle={() => toggleId("content", it.id)}
                                  icon={<Video className="h-4 w-4" />}
                                  aria-label={`Toggle ${it.CategoryName}`}
                                />
                              )
                            })}
                          </div>
                        </section>
                      )
                    })()}

                    {/* Areas */}
                    {(() => {
                      const items = grouped["area"] ?? []
                      if (!items.length) return null
                      const itemsSorted = [...items].sort((a, b) => a.CategoryName.localeCompare(b.CategoryName))
                      return (
                        <section aria-label="Areas" className="space-y-2">
                          <h3 className="text-sm font-extrabold uppercase text-[hsl(var(--filter-heading))]">Areas</h3>
                          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                            {itemsSorted.map((it) => {
                              const current = new Set(selected["area"] ?? [])
                              const isSelected = current.has(it.id)
                              return (
                                <FilterChip
                                  key={it.id}
                                  label={it.CategoryName}
                                  selected={isSelected}
                                  onToggle={() => toggleId("area", it.id)}
                                  aria-label={`Toggle ${it.CategoryName}`}
                                />
                              )
                            })}
                          </div>
                        </section>
                      )
                    })()}
                  </div>
                )}
              </main>

              {/* Footer */}
              <footer className="mt-auto shrink-0 flex items-center justify-between gap-3 border-t px-5 py-4 pb-[env(safe-area-inset-bottom)] [border-color:hsl(var(--border)/0.5)]">
                <Button type="button" variant="outline" onClick={clearAll} className="active:scale-95">
                  Clear All
                </Button>
                <Button type="button" variant="glow" onClick={apply} className="active:scale-95">
                  Apply Filters{activeCount ? ` (${activeCount})` : ""}
                </Button>
              </footer>

            </div>
          </DialogContent>
        )}
    </Dialog>
  )
}
