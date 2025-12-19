/**
 * Venues Home — dynamic filters from category_venues_turbo
 *
 * - GET filters from:
 *      https://xbut-eryu-hhsg.f2.xano.io/api:vGd6XDW3/category_venues_turbo
 *      → [{ id, CategoryName, filter_type }]
 *
 * - Build two chip lists:
 *      • categories:  filter_type === "category"
 *      • districts:   filter_type === "area"
 *
 * - On chip toggle:
 *      • push/remove chip.id into selectedCategoryIds / selectedDistrictIds
 * - POST body to RestaurantUpgradeTop:
 *      {
 *        page: 1,
 *        search: "",
 *        category_ids: number[],
 *        district_ids: number[]
 *      }
 *
 * - Extra:
 *      • “Clear” button on districts row → clears all selectedDistrictIds
 */

import React, { useEffect, useMemo, useState } from "react";
import {
  LayoutGroup,
  AnimatePresence,
  motion,
  useScroll,
  useTransform,
} from "framer-motion";
import { Search, Calendar } from "lucide-react";
import VenueDetail from "@/features/venues/VenueDetail";

// ---- TYPES ----

interface XanoFile {
  url?: string;
  [k: string]: any;
}

interface Venue {
  id: number;
  Name: string;
  Cover?: XanoFile | null;
  Background?: XanoFile | null;
  GalleryRestaurant?: XanoFile[] | null;
  cities_id?: number | null;
  [k: string]: any;
}

interface RestaurantUpgradeTopResponse {
  items?: Venue[];
  itemsReceived?: number;
  curPage?: number;
  nextPage?: number | null;
  [k: string]: any;
}

interface TurboFilterItem {
  id: number;
  CategoryName: string;
  filter_type: "area" | "category" | "content" | string;
}

type DetailVenue = {
  id: string;
  name: string;
  image: string;
  gallery: string[];
  city?: string;
  brief: string;
  offers: Array<{ id: string; title: string; plates?: number; drinks?: number; dessert?: number; champagne?: number; mission: string }>;
};

type ChipDefinition = {
  id: number;
  label: string;
};

const FALLBACK_GRADIENT =
  "radial-gradient(circle at 20% 20%, rgba(255,255,255,0.12) 0%, rgba(10,11,12,0.92) 55%, rgba(10,11,12,1) 100%)";

// placeholder for future city/tag badge if backend sends it
function getBadgeLabel(_venue: Venue): string | null {
  return null;
}

const FILTER_ENDPOINT =
  "https://xbut-eryu-hhsg.f2.xano.io/api:vGd6XDW3/category_venues_turbo";

export default function VenuesScreen() {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(false);

  const [open, setOpen] = useState<DetailVenue | null>(null);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [districtOpen, setDistrictOpen] = useState(false);

  const [searchOverlayOpen, setSearchOverlayOpen] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);

  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null); // "YYYY-MM-DD"

  const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>([]);
  const [selectedDistrictIds, setSelectedDistrictIds] = useState<number[]>([]);

  const [categoryFilters, setCategoryFilters] = useState<ChipDefinition[]>([]);
  const [districtFilters, setDistrictFilters] = useState<ChipDefinition[]>([]);
  const [filtersError, setFiltersError] = useState<string | null>(null);

  // Infinite scroll observer ref
  const loadMoreRef = React.useRef<HTMLDivElement>(null);

  // Scroll-based hero animation
  const { scrollY } = useScroll();
  const heroOpacity = useTransform(scrollY, [0, 140], [1, 0]);
  const heroScale = useTransform(scrollY, [0, 140], [1, 0.93]);
  const heroTranslateY = useTransform(scrollY, [0, 140], [0, -26]);

  // ---- FETCH FILTER LOOKUPS (category_venues_turbo) ----
  useEffect(() => {
    const controller = new AbortController();
    setFiltersError(null);

    fetch(FILTER_ENDPOINT, { signal: controller.signal })
      .then(async (res) => {
        if (!res.ok) throw new Error(`Unable to fetch filters: ${res.status}`);
        return (await res.json()) as TurboFilterItem[];
      })
      .then((items) => {
        const categories = items
          .filter((i) => i.filter_type === "category")
          .sort((a, b) => a.CategoryName.localeCompare(b.CategoryName));

        const areas = items
          .filter((i) => i.filter_type === "area")
          .sort((a, b) => a.CategoryName.localeCompare(b.CategoryName));

        setCategoryFilters(
          categories.map((c) => ({ id: c.id, label: c.CategoryName }))
        );
        setDistrictFilters(
          areas.map((a) => ({ id: a.id, label: a.CategoryName }))
        );
      })
      .catch((err) => {
        if ((err as { name?: string }).name === "AbortError") return;
        console.error("Failed to load filter IDs", err);
        setFiltersError("Unable to load filters.");
      });

    return () => controller.abort();
  }, []);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setDebouncedSearch(search);
    }, 350);

    return () => window.clearTimeout(timeout);
  }, [search]);

  useEffect(() => {
    console.log("[Venues] search", search, "debounced", debouncedSearch);
  }, [search, debouncedSearch]);

  // ---- FETCH FROM RestaurantUpgradeTop ----
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);
    setCurrentPage(0);
    setHasNextPage(false);

    const body = {
      page: 0,
      search: debouncedSearch.trim() || "",
      category_ids: selectedCategoryIds,
      district_ids: selectedDistrictIds,
    };

    console.log("[Venues] fetching", body);

    fetch("https://xbut-eryu-hhsg.f2.xano.io/api:vGd6XDW3/RestaurantUpgradeTop", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal,
    })
      .then(async (res) => {
        if (!res.ok) throw new Error(`Unexpected response: ${res.status}`);
        const json = (await res.json()) as RestaurantUpgradeTopResponse | Venue[];

        let items: Venue[] = [];
        let nextPage: number | null = null;
        
        if (Array.isArray(json)) {
          items = json;
        } else if (Array.isArray(json.items)) {
          items = json.items;
          nextPage = json.nextPage ?? null;
        }

        setVenues(items);
        setHasNextPage(nextPage !== null);
        console.log("[Venues] received", items.length, "nextPage", nextPage);
      })
      .catch((err) => {
        if ((err as any).name !== "AbortError") {
          console.error("Error fetching venues:", err);
          setError("Unable to load venues. Please try again later.");
        }
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [debouncedSearch, selectedCategoryIds, selectedDistrictIds]);

  // ---- LOAD MORE (infinite scroll) ----
  const loadMoreVenues = React.useCallback(() => {
    if (loadingMore || !hasNextPage) return;

    setLoadingMore(true);
    const nextPage = currentPage + 1;

    const body = {
      page: nextPage,
      search: debouncedSearch.trim() || "",
      category_ids: selectedCategoryIds,
      district_ids: selectedDistrictIds,
    };

    console.log("[Venues] fetching", body);

    fetch("https://xbut-eryu-hhsg.f2.xano.io/api:vGd6XDW3/RestaurantUpgradeTop", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
      .then(async (res) => {
        if (!res.ok) throw new Error(`Unexpected response: ${res.status}`);
        const json = (await res.json()) as RestaurantUpgradeTopResponse | Venue[];

        let items: Venue[] = [];
        let nextPageNum: number | null = null;
        
        if (Array.isArray(json)) {
          items = json;
        } else if (Array.isArray(json.items)) {
          items = json.items;
          nextPageNum = json.nextPage ?? null;
        }

        setVenues(prev => [...prev, ...items]);
        setCurrentPage(nextPage);
        setHasNextPage(nextPageNum !== null);
        console.log("[Venues] received", items.length, "nextPage", nextPageNum);
      })
      .catch((err) => {
        console.error("Error loading more venues:", err);
      })
      .finally(() => setLoadingMore(false));
  }, [loadingMore, hasNextPage, currentPage, debouncedSearch, selectedCategoryIds, selectedDistrictIds]);

  // ---- INTERSECTION OBSERVER FOR INFINITE SCROLL ----
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !loadingMore) {
          loadMoreVenues();
        }
      },
      { threshold: 0.1 }
    );

    const currentRef = loadMoreRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [hasNextPage, loadingMore, loadMoreVenues]);

  // ---- CONTENT (pinned + list) ----
  const content = useMemo(() => {
    if (loading)
      return (
        <div className="flex items-center justify-center py-16 text-sm text-gray-500">
          Loading venues…
        </div>
      );
    if (error)
      return (
        <div className="flex items-center justify-center py-16 text-sm text-gray-500">
          {error}
        </div>
      );
    
    const hasActiveFilters =
      search.trim().length > 0 ||
      selectedCategoryIds.length > 0 ||
      selectedDistrictIds.length > 0 ||
      Boolean(selectedDate);
    
    if (!venues.length)
      return (
        <div className="flex flex-col items-center justify-center px-5 py-24 text-center">
          <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-gray-100 to-gray-50">
            <svg
              className="h-12 w-12 text-gray-300"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
          </div>
          <h3 className="mb-2 text-lg font-semibold text-gray-900">
            No venues found
          </h3>
          <p className="mb-6 max-w-sm text-sm text-gray-500">
            {hasActiveFilters
              ? "Try adjusting your filters or search terms to find more venues."
              : "We couldn't find any venues at the moment. Please try again later."}
          </p>
          {hasActiveFilters && (
            <button
              onClick={() => {
                setSelectedCategoryIds([]);
                setSelectedDistrictIds([]);
                setSearch("");
                setSelectedDate(null);
                setSelectedDay(null);
              }}
              className="inline-flex items-center gap-2 rounded-full bg-red-600 px-6 py-2.5 text-sm font-medium text-white shadow-[0_10px_25px_rgba(248,113,113,0.45)] transition-all hover:bg-red-700 active:scale-95"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Clear all filters
            </button>
          )}
        </div>
      );

    // When filters are active, show all venues in one list
    // When no filters, split into pinned (first 5) and all (rest)
    const pinnedVenues = hasActiveFilters ? [] : venues.slice(0, 5);
    const allVenues = hasActiveFilters ? venues : venues.slice(5);

    const renderVenueCard = (
      venue: Venue,
      index: number,
      size: "compact" | "full"
    ) => {
      const id = String(venue.id);
      const coverUrl = venue.Cover?.url ?? venue.Background?.url ?? "";
      const badgeLabel = getBadgeLabel(venue);
      const rankNumber = index + 1;
      const baseHeight = size === "compact" ? 190 : 230;
      const isPinned = size === "compact";

      return (
        <motion.button
          key={id}
          layout
          // buttery entry
          initial={{ opacity: 0, y: 18, scale: 0.97, filter: "blur(4px)" }}
          animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
          // buttery exit (fade + leggero shift)
          exit={{ opacity: 0, y: -6, scale: 0.97, filter: "blur(4px)" }}
          transition={{
            type: "spring",
            stiffness: 210,
            damping: 28,
            mass: 0.9,
            opacity: { duration: 0.28, ease: [0.22, 0.61, 0.36, 1] },
            filter: { duration: 0.28 },
            delay: index * 0.03, // piccolo stagger
          }}
          onClick={async () => {
            if (coverUrl) {
              const img = new Image();
              img.src = coverUrl;
              try {
                await img.decode();
              } catch {
                // ignore
              }
            }

            const galleryUrls = (venue.GalleryRestaurant ?? [])
              .map((f) => f?.url)
              .filter(Boolean);
            const mergedGallery = Array.from(
              new Set([coverUrl, ...galleryUrls].filter(Boolean))
            );

            const detail: DetailVenue = {
              id,
              name: venue.Name,
              image: mergedGallery[0] ?? coverUrl,
              gallery: mergedGallery,
              city: badgeLabel ?? undefined,
              brief:
                "Scandinavian vibes in the heart of Seminyak. Everything is organized to feel warm and light.",
              offers: [
                {
                  id: "story3",
                  title: "3 × Story",
                  plates: 1,
                  drinks: 2,
                  mission:
                    "Publish 3 Stories showcasing ambience, hero dishes, and yourself. Tag @venue + #clarisapp with one hidden @claris.app mention after posting.",
                },
                {
                  id: "reel",
                  title: "Reel",
                  plates: 3,
                  drinks: 2,
                  dessert: 1,
                  champagne: 1,
                  mission:
                    "Post 1 Reel with yourself, ambience and dishes. Tag @venue and #clarisapp in caption.",
                },
              ],
            };
            setOpen(detail);
          }}
          whileHover={isPinned ? { y: -8, rotateX: -4, rotateY: 4 } : { y: -4 }}
          whileTap={isPinned ? { scale: 0.97, rotateX: 0, rotateY: 0 } : { scale: 0.98 }}
          className={`group relative block overflow-hidden rounded-[22px] bg-white text-left shadow-[0_16px_40px_rgba(15,23,42,0.12)] transition-transform duration-300 ease-out ${
            size === "compact" ? "min-w-[260px] max-w-[280px]" : "w-full"
          }`}
        >
          <motion.div layoutId={`card-${id}`} className="relative">
            <div
              className="w-full rounded-[22px] bg-cover bg-center"
              style={{
                height: baseHeight,
                backgroundImage: coverUrl ? `url(${coverUrl})` : FALLBACK_GRADIENT,
              }}
            />
            <motion.div
              layoutId={`card-grad-${id}`}
              className="pointer-events-none absolute inset-0 rounded-[22px] bg-gradient-to-t from-black/80 via-black/40 to-transparent"
            />
          </motion.div>

          <div className="pointer-events-none absolute inset-0 flex flex-col justify-between p-4 sm:p-5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex max-w-max items-center rounded-full bg-red-600/90 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.16em] text-white shadow-sm">
                {isPinned ? "Pinned This Week" : "Featured Venue"}
              </span>
              {badgeLabel && (
                <span className="inline-flex max-w-max items-center rounded-full bg-black/40 px-3 py-1 text-[11px] uppercase tracking-[0.16em] text-white/80 backdrop-blur">
                  {badgeLabel}
                </span>
              )}
            </div>

            <div>
              <h2 className="text-[18px] sm:text-[20px] font-light text-white drop-shadow-[0_4px_16px_rgba(0,0,0,0.7)]">
                {venue.Name}
              </h2>
              <p className="mt-1 text-xs font-light text-white/80">#{rankNumber} Venue</p>
            </div>
          </div>
        </motion.button>
      );
    };

    return (
      <div className="space-y-8">
        {/* Pinned section */}
        {!hasActiveFilters && pinnedVenues.length > 0 && (
          <section>
            <h2 className="mb-3 text-base font-semibold text-gray-900">
              Pinned This Week
            </h2>
            <div className="-mx-5 overflow-x-auto pb-1">
              <AnimatePresence mode="wait">
                <motion.div
                  key={`pinned-${pinnedVenues.map((v) => v.id).join(",")}`}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.28, ease: [0.22, 0.61, 0.36, 1] }}
                  className="flex gap-4 px-5"
                  layout
                >
                  {pinnedVenues.map((venue, index) =>
                    renderVenueCard(venue, index, "compact")
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </section>
        )}

        {/* STICKY FILTER BAR – icons + categories + collapsable districts */}
        <section
          className="
            sticky top-0 z-30 -mx-5
            bg-gradient-to-b from-[#f7f7f8] via-[#f7f7f8] to-transparent
            px-5 pb-3 pt-2
            backdrop-blur
          "
        >
          {/* Row 0 — global controls + districts toggle */}
          <div className="mb-2 flex items-center justify-between">
            <div className="inline-flex gap-2">
              <button
                onClick={() => setSearchOverlayOpen(true)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white shadow-[0_8px_20px_rgba(15,23,42,0.08)]"
              >
                <Search className="h-4 w-4 text-gray-500" />
              </button>
              <button
                onClick={() => setCalendarOpen(true)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-red-500 shadow-[0_8px_20px_rgba(15,23,42,0.12)]"
              >
                <Calendar className="h-4 w-4" />
              </button>
            </div>

            <div className="inline-flex items-center gap-2">
              {/* Clear all filters button */}
              {(selectedCategoryIds.length > 0 || 
                selectedDistrictIds.length > 0 || 
                search.trim().length > 0 || 
                selectedDate) && (
                <button
                  onClick={() => {
                    setSelectedCategoryIds([]);
                    setSelectedDistrictIds([]);
                    setSearch("");
                    setSelectedDate(null);
                    setSelectedDay(null);
                  }}
                  className="inline-flex items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 shadow-[0_4px_12px_rgba(248,113,113,0.15)] transition-all hover:bg-red-100"
                >
                  <span className="text-[10px]">✕</span>
                  <span>Clear</span>
                </button>
              )}
              
              {/* District toggle pill */}
              <button
                onClick={() => setDistrictOpen((v) => !v)}
                className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-white/90 px-3 py-1.5 text-xs font-medium text-gray-600 shadow-[0_8px_20px_rgba(15,23,42,0.04)]"
              >
                <span>Districts</span>
                <span className="h-[3px] w-[3px] rounded-full bg-gray-400" />
                <span className="text-gray-700">All</span>
                <span
                  className={`ml-1 text-[10px] transition-transform ${
                    districtOpen ? "rotate-180" : ""
                  }`}
                >
                  ▾
                </span>
              </button>
            </div>
          </div>

          {/* Row 1 — categories (from API) */}
          <div className="flex gap-2 overflow-x-auto pb-1">
            {categoryFilters.map((item) => {
              const isActive = selectedCategoryIds.includes(item.id);
              return (
                <button
                  key={item.id}
                  onClick={() =>
                    setSelectedCategoryIds((prev) =>
                      isActive
                        ? prev.filter((id) => id !== item.id)
                        : [...prev, item.id]
                    )
                  }
                  className={`inline-flex flex-shrink-0 items-center rounded-full border px-4 py-2 text-sm transition-colors ${
                    isActive
                      ? "border-red-500 bg-red-500 text-white shadow-[0_10px_25px_rgba(248,113,113,0.45)]"
                      : "border-gray-200 bg-white text-gray-800"
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
            {!categoryFilters.length && (
              <span className="text-xs text-gray-400">Loading categories…</span>
            )}
          </div>

          {/* Row 2 — districts (collapsable) + CLEAR */}
          <motion.div
            initial={false}
            animate={districtOpen ? "open" : "closed"}
            variants={{
              open: { height: "auto", opacity: 1, marginTop: 8 },
              closed: { height: 0, opacity: 0, marginTop: 0 },
            }}
            className="overflow-hidden"
          >
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {districtFilters.map((item) => {
                const isActive = selectedDistrictIds.includes(item.id);
                return (
                  <button
                    key={item.id}
                    onClick={() =>
                      setSelectedDistrictIds((prev) =>
                        isActive
                          ? prev.filter((id) => id !== item.id)
                          : [...prev, item.id]
                      )
                    }
                    className={`inline-flex flex-shrink-0 items-center rounded-full border px-4 py-2 text-xs font-medium transition-colors ${
                      isActive
                        ? "border-red-500 bg-red-50 text-red-600"
                        : "border-gray-200 bg-white/90 text-gray-600"
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}

              {/* CLEAR all district filters */}
              {selectedDistrictIds.length > 0 && (
                <button
                  onClick={() => setSelectedDistrictIds([])}
                  className="ml-auto inline-flex flex-shrink-0 items-center rounded-full border border-gray-300 bg-white/80 px-3 py-1.5 text-[11px] font-medium text-gray-600"
                >
                  Clear
                </button>
              )}

              {!districtFilters.length && (
                <span className="text-xs text-gray-400">Loading districts…</span>
              )}
            </div>
            {filtersError && (
              <p className="px-1 pb-1 text-[10px] text-red-500/80">{filtersError}</p>
            )}
          </motion.div>
        </section>

        {/* All venues */}
        <section>
          <h2 className="mb-3 text-base font-semibold text-gray-900">All Venues</h2>
          <AnimatePresence mode="wait">
            <motion.div
              key={
                hasActiveFilters
                  ? `filtered-${search.trim()}-${selectedCategoryIds.join(",")}-${selectedDistrictIds.join(",")}-${selectedDate ?? "none"}`
                  : "default-list"
              }
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.28, ease: [0.22, 0.61, 0.36, 1] }}
              className="space-y-4"
            >
              {allVenues.map((venue, index) =>
                renderVenueCard(venue, index, "full")
              )}
            </motion.div>
          </AnimatePresence>
          
          {/* Infinite scroll trigger */}
          <div ref={loadMoreRef} className="py-8 text-center">
            {loadingMore && (
              <div className="text-sm text-gray-500">Loading more venues…</div>
            )}
          </div>
        </section>
      </div>
    );
  }, [
    error,
    loading,
    venues,
    search,
    selectedCategoryIds,
    selectedDistrictIds,
    districtOpen,
    categoryFilters,
    districtFilters,
    filtersError,
    selectedDate,
  ]);

  // ---- RENDER ----

  return (
    <LayoutGroup id="venues">
      <div className="min-h-screen bg-gradient-to-b from-[#f7f7f8] to-white px-5 pb-24 pt-8">
        <div className="mx-auto w-full max-w-5xl space-y-8">
          {/* Notch header – scroll animation */}
          <motion.section
            style={{ opacity: heroOpacity, scale: heroScale, y: heroTranslateY }}
            transition={{ type: "spring", stiffness: 220, damping: 26, mass: 0.9 }}
            className="rounded-3xl border border-slate-100 bg-white/90 px-6 pb-5 pt-6 shadow-[0_22px_60px_rgba(15,23,42,0.12)] backdrop-blur"
          >
            <h1 className="text-center text-[24px] sm:text-[28px] font-light text-gray-900">
              Discover where your presence matters
            </h1>
            <p className="mt-2 text-center text-sm text-gray-600">
              Find curated creator experiences across the city.
            </p>

            <div className="mt-5 flex items-center gap-3">
              <div className="flex-1 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 shadow-[0_12px_30px_rgba(15,23,42,0.06)]">
                <Search className="h-4 w-4 text-gray-400" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search venues or areas"
                  className="h-8 w-full border-none bg-transparent text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none"
                />
              </div>
              <button
                onClick={() => setCalendarOpen(true)}
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-red-500 shadow-[0_12px_30px_rgba(15,23,42,0.08)]"
              >
                <Calendar className="h-4 w-4" />
              </button>
            </div>
          </motion.section>

          {content}
        </div>
      </div>

      {/* Search overlay — Spotlight style */}
      <AnimatePresence>
        {searchOverlayOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSearchOverlayOpen(false)}
          >
            <motion.div
              className="relative w-[90%] max-w-md rounded-2xl bg-white p-5 shadow-2xl"
              initial={{ opacity: 0, y: 16, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.96 }}
              transition={{ type: "spring", stiffness: 250, damping: 24, mass: 0.9 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-4 flex items-start justify-between">
                <div>
                  <h2 className="text-sm font-semibold text-gray-900">
                    Search experiences
                  </h2>
                  <p className="mt-1 text-xs text-gray-500">
                    Find venues, districts or vibes across the city.
                  </p>
                </div>
                <button
                  onClick={() => setSearchOverlayOpen(false)}
                  className="ml-3 text-xs text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 shadow-[0_12px_30px_rgba(15,23,42,0.06)]">
                <Search className="h-4 w-4 text-gray-400" />
                <input
                  autoFocus
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search venues, districts or areas"
                  className="h-8 w-full border-none bg-transparent text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none"
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Calendar overlay — month modal; sets selectedDate (YYYY-MM-DD) */}
      <AnimatePresence>
        {calendarOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setCalendarOpen(false)}
          >
            <motion.div
              className="relative w-[90%] max-w-md rounded-2xl bg-white p-5 shadow-2xl"
              initial={{ opacity: 0, y: 20, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.96 }}
              transition={{ type: "spring", stiffness: 240, damping: 24, mass: 0.9 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-4 flex items-start justify-between">
                <div>
                  <h2 className="text-sm font-semibold text-gray-900">Select date</h2>
                  <p className="mt-1 text-xs text-gray-500">
                    Choose a day to refine your experiences.
                  </p>
                </div>
                <button
                  onClick={() => setCalendarOpen(false)}
                  className="ml-3 text-xs text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="mb-3 grid grid-cols-7 gap-2 text-center text-xs text-gray-500">
                {["M", "T", "W", "T", "F", "S", "S"].map((d) => (
                  <div key={d} className="font-medium">
                    {d}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-2 text-sm">
                {Array.from({ length: 30 }, (_, i) => i + 1).map((day) => (
                  <button
                    key={day}
                    onClick={() => {
                      setSelectedDay(day);
                      const today = new Date();
                      const date = new Date(
                        today.getFullYear(),
                        today.getMonth(),
                        day
                      );
                      const iso = date.toISOString().slice(0, 10);
                      setSelectedDate(iso);
                    }}
                    className={`flex h-9 w-9 items-center justify-center rounded-full border text-xs ${
                      selectedDay === day
                        ? "border-red-500 bg-red-500 text-white"
                        : "border-gray-200 bg-white text-gray-700"
                    }`}
                  >
                    {day}
                  </button>
                ))}
              </div>

              {selectedDate && (
                <p className="mt-4 text-xs text-gray-500">
                  Selected date:{" "}
                  <span className="font-medium text-gray-800">
                    {selectedDate}
                  </span>
                </p>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {open && <VenueDetail venue={open as any} onClose={() => setOpen(null)} />}
      </AnimatePresence>
    </LayoutGroup>
  );
}
