/**
 * Venues Home — wired to RestaurantUpgradeTop
 *
 * - Endpoint:
 *      POST https://xbut-eryu-hhsg.f2.xano.io/api:vGd6XDW3/RestaurantUpgradeTop
 * - Body:
 *      {
 *        page: number,
 *        search: string,
 *        category_ids: number[],
 *        district_ids: number[],
 *        date: string | null   // "YYYY-MM-DD"
 *      }
 *
 * - Response:
 *      { items: Venue[], curPage: number, nextPage: number | null, ... }
 */

import React, {
  useEffect,
  useMemo,
  useState,
  useRef,
} from "react";
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
  filter_type: string;
}

type DetailVenue = {
  id: string;
  name: string;
  image: string;
  city?: string;
  brief: string;
  offers: Array<{
    id: string;
    title: string;
    plates?: number;
    drinks?: number;
    mission: string;
  }>;
};

type ChipDefinition = {
  label: string;
  id: number | null;
};

const FALLBACK_GRADIENT =
  "radial-gradient(circle at 20% 20%, rgba(255,255,255,0.12) 0%, rgba(10,11,12,0.92) 55%, rgba(10,11,12,1) 100%)";

// For now we don't get a badge label from backend
function getBadgeLabel(_venue: Venue): string | null {
  return null;
}

const STATIC_CATEGORY_LABELS = [
  "Sport",
  "Cocktail",
  "Beauty",
  "Lunch",
  "Breakfast",
] as const;
const STATIC_DISTRICT_LABELS = [
  "Seminyak",
  "Canggu",
  "Uluwatu",
  "Kerobokan",
  "Pererenan",
] as const;

const FILTER_ENDPOINT =
  "https://xbut-eryu-hhsg.f2.xano.io/api:vGd6XDW3/category_venues_turbo";

const normalize = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

export default function VenuesScreen() {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [open, setOpen] = useState<DetailVenue | null>(null);
  const [search, setSearch] = useState("");

  const [districtOpen, setDistrictOpen] = useState(false);

  const [searchOverlayOpen, setSearchOverlayOpen] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);

  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null); // "YYYY-MM-DD"

  const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>([]);
  const [selectedDistrictIds, setSelectedDistrictIds] = useState<number[]>([]);

  const [categoryFilters, setCategoryFilters] = useState<ChipDefinition[]>(
    STATIC_CATEGORY_LABELS.map((label) => ({ label, id: null }))
  );
  const [districtFilters, setDistrictFilters] = useState<ChipDefinition[]>(
    STATIC_DISTRICT_LABELS.map((label) => ({ label, id: null }))
  );
  const [filtersError, setFiltersError] = useState<string | null>(null);

  // Pagination state (wired to Xano curPage / nextPage)
  const [page, setPage] = useState(1);
  const [nextPage, setNextPage] = useState<number | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  // Scroll-based hero animation
  const { scrollY } = useScroll();
  const heroOpacity = useTransform(scrollY, [0, 140], [1, 0]);
  const heroScale = useTransform(scrollY, [0, 140], [1, 0.93]);
  const heroTranslateY = useTransform(scrollY, [0, 140], [0, -26]);

  // ---- FETCH FILTER LOOKUPS ----
  useEffect(() => {
    const controller = new AbortController();
    setFiltersError(null);

    fetch(FILTER_ENDPOINT, { signal: controller.signal })
      .then(async (res) => {
        if (!res.ok) throw new Error(`Unable to fetch filters: ${res.status}`);
        return (await res.json()) as TurboFilterItem[];
      })
      .then((items) => {
        const categoryMap = new Map<string, TurboFilterItem>();
        const districtMap = new Map<string, TurboFilterItem>();

        for (const item of items) {
          if (!item?.CategoryName) continue;
          const key = normalize(item.CategoryName);
          if (item.filter_type === "category" && !categoryMap.has(key)) {
            categoryMap.set(key, item);
          }
          if (item.filter_type === "area" && !districtMap.has(key)) {
            districtMap.set(key, item);
          }
        }

        setCategoryFilters((prev) =>
          prev.map((chip) => {
            const match = categoryMap.get(normalize(chip.label));
            return { ...chip, id: match?.id ?? null };
          })
        );
        setDistrictFilters((prev) =>
          prev.map((chip) => {
            const match = districtMap.get(normalize(chip.label));
            return { ...chip, id: match?.id ?? null };
          })
        );
      })
      .catch((err) => {
        if ((err as { name?: string }).name === "AbortError") return;
        console.error("Failed to load filter IDs", err);
        setFiltersError("Unable to load filters. Chips may be disabled.");
      });

    return () => controller.abort();
  }, []);

  // When search / filters / date change → reset pagination to page 1
  useEffect(() => {
    setPage(1);
    setNextPage(null);
    setHasMore(true);
    setVenues([]);
  }, [search, selectedCategoryIds, selectedDistrictIds, selectedDate]);

  // ---- FETCH FROM RestaurantUpgradeTop WITH PAGINATION ----
  useEffect(() => {
    const controller = new AbortController();
    const isFirstPage = page === 1;

    if (isFirstPage) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }
    setError(null);

    const body = {
      page,
      search: search.trim(),
      category_ids: selectedCategoryIds,
      district_ids: selectedDistrictIds,
      date: selectedDate,
    };

    (async () => {
      try {
        const res = await fetch(
          "https://xbut-eryu-hhsg.f2.xano.io/api:vGd6XDW3/RestaurantUpgradeTop",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
            signal: controller.signal,
          }
        );

        if (!res.ok) {
          const text = await res.text();
          console.error("Xano error:", res.status, text);
          setError(`Unable to load venues (code ${res.status}).`);
          setVenues([]);
          setHasMore(false);
          return;
        }

        const json = (await res.json()) as
          | RestaurantUpgradeTopResponse
          | Venue[];

        let items: Venue[] = [];
        let metaNextPage: number | null = null;

        if (Array.isArray(json)) {
          items = json;
        } else {
          items = Array.isArray(json.items) ? json.items : [];
          metaNextPage =
            typeof json.nextPage === "number" ? json.nextPage : null;
        }

        if (isFirstPage) {
          setVenues(items);
        } else {
          setVenues((prev) => [...prev, ...items]);
        }

        setNextPage(metaNextPage);
        setHasMore(!!metaNextPage);
      } catch (err: any) {
        if (err?.name === "AbortError") return;
        console.error("Network error calling RestaurantUpgradeTop:", err);
        setError("Network error. Please try again.");
        setHasMore(false);
      } finally {
        if (isFirstPage) setLoading(false);
        else setLoadingMore(false);
      }
    })();

    return () => controller.abort();
  }, [
    page,
    search,
    selectedCategoryIds,
    selectedDistrictIds,
    selectedDate,
  ]);

  // ---- Infinite scroll: observe sentinel ----
  useEffect(() => {
    if (!hasMore || loadingMore || loading) return;

    const node = loadMoreRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first.isIntersecting && nextPage) {
          setPage(nextPage);
        }
      },
      { root: null, rootMargin: "200px", threshold: 0 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [hasMore, loadingMore, loading, nextPage]);

  // ---- LOCAL VIEW MODEL ----

  const content = useMemo(() => {
    if (loading && !venues.length)
      return (
        <div className="flex items-center justify-center py-16 text-sm text-gray-500">
          Loading venues…
        </div>
      );
    if (error && !venues.length)
      return (
        <div className="flex items-center justify-center py-16 text-sm text-gray-500">
          {error}
        </div>
      );
    if (!venues.length)
      return (
        <div className="flex items-center justify-center py-16 text-sm text-gray-500">
          No venues found.
        </div>
      );

    const normalizedSearch = search.trim().toLowerCase();
    const visibleVenues = normalizedSearch
      ? venues.filter((v) => (v.Name ?? "").toLowerCase().includes(normalizedSearch))
      : venues;

    const pinnedVenues = visibleVenues.slice(0, 5);
    const pinnedIds = new Set(pinnedVenues.map((v) => v.id));
    const allVenues = visibleVenues.filter((v) => !pinnedIds.has(v.id));

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

            const detail: DetailVenue = {
              id,
              name: venue.Name,
              image: coverUrl,
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
                  mission:
                    "Post 1 Reel with yourself, ambience and dishes. Tag @venue and #clarisapp in caption.",
                },
              ],
            };
            setOpen(detail);
          }}
          whileHover={isPinned ? { y: -8, rotateX: -4, rotateY: 4 } : { y: -4 }}
          whileTap={
            isPinned ? { scale: 0.97, rotateX: 0, rotateY: 0 } : { scale: 0.98 }
          }
          transition={{ type: "spring", stiffness: 260, damping: 22, mass: 0.9 }}
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
              <p className="mt-1 text-xs font-light text-white/80">
                #{rankNumber} Venue
              </p>
            </div>
          </div>
        </motion.button>
      );
    };

    return (
      <div className="space-y-8">
        {/* Pinned section */}
        {pinnedVenues.length > 0 && (
          <section>
            <h2 className="mb-3 text-base font-semibold text-gray-900">
              Pinned This Week
            </h2>
            <div className="-mx-5 overflow-x-auto pb-1">
              <motion.div
                className="flex gap-4 px-5"
                layout
                transition={{ type: "spring", stiffness: 260, damping: 26 }}
              >
                {pinnedVenues.map((venue, index) =>
                  renderVenueCard(venue, index, "compact")
                )}
              </motion.div>
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

          {/* Row 1 — categories */}
          <div className="flex gap-2 overflow-x-auto pb-1">
            {categoryFilters.map((item, index) => {
              const isActive =
                item.id != null && selectedCategoryIds.includes(item.id);
              const isDisabled = item.id == null;
              return (
                <button
                  key={item.label}
                  onClick={() => {
                    if (isDisabled) return;
                    setSelectedCategoryIds((prev) =>
                      prev.includes(item.id as number)
                        ? prev.filter((id) => id !== item.id)
                        : [...prev, item.id as number]
                    );
                  }}
                  disabled={isDisabled}
                  className={`inline-flex flex-shrink-0 items-center rounded-full border px-4 py-2 text-sm transition-colors ${
                    isDisabled
                      ? "cursor-not-allowed border-gray-200 bg-gray-100 text-gray-400"
                      : isActive
                      ? "border-red-500 bg-red-500 text-white shadow-[0_10px_25px_rgba(248,113,113,0.45)]"
                      : index === 0 && selectedCategoryIds.length === 0
                      ? "border-red-500 bg-red-500 text-white shadow-[0_10px_25px_rgba(248,113,113,0.45)]"
                      : "border-gray-200 bg-white text-gray-800"
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>

          {/* Row 2 — districts (collapsable) */}
          <motion.div
            initial={false}
            animate={districtOpen ? "open" : "closed"}
            variants={{
              open: { height: "auto", opacity: 1, marginTop: 8 },
              closed: { height: 0, opacity: 0, marginTop: 0 },
            }}
            className="overflow-hidden"
          >
            <div className="flex gap-2 overflow-x-auto pb-1">
              {districtFilters.map((item) => {
                const isActive =
                  item.id != null && selectedDistrictIds.includes(item.id);
                const isDisabled = item.id == null;
                return (
                  <button
                    key={item.label}
                    onClick={() => {
                      if (isDisabled) return;
                      setSelectedDistrictIds((prev) =>
                        prev.includes(item.id as number)
                          ? prev.filter((id) => id !== item.id)
                          : [...prev, item.id as number]
                      );
                    }}
                    disabled={isDisabled}
                    className={`inline-flex flex-shrink-0 items-center rounded-full border px-4 py-2 text-xs font-medium transition-colors ${
                      isDisabled
                        ? "cursor-not-allowed border-gray-200 bg-gray-100 text-gray-400"
                        : isActive
                        ? "border-red-500 bg-red-50 text-red-600"
                        : "border-gray-200 bg-white/90 text-gray-600"
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
            {filtersError && (
              <p className="px-1 pb-1 text-[10px] text-red-500/80">
                {filtersError}
              </p>
            )}
          </motion.div>
        </section>

        {/* All venues */}
        <section>
          <h2 className="mb-3 text-base font-semibold text-gray-900">
            All Venues
          </h2>
          <div className="space-y-4">
            {allVenues.map((venue, index) =>
              renderVenueCard(venue, index, "full")
            )}
          </div>

          {/* Infinite scroll sentinel */}
          <div
            ref={loadMoreRef}
            className="flex h-10 items-center justify-center text-xs text-gray-400"
          >
            {loadingMore
              ? "Loading more…"
              : !hasMore && allVenues.length > 0
              ? "No more venues"
              : null}
          </div>
        </section>
      </div>
    );
  }, [
    error,
    loading,
    loadingMore,
    venues,
    search,
    selectedCategoryIds,
    selectedDistrictIds,
    districtOpen,
    categoryFilters,
    filtersError,
    hasMore,
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
                  <h2 className="text-sm font-semibold text-gray-900">
                    Select date
                  </h2>
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
