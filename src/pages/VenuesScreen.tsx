/**
 * Codex Prompt — Venues Home (Pinned + Sticky Filters + Motion)
 *
 * Goal:
 * Implement a mobile-first Venues home screen with AURA-style light UI, subtle silver notch
 * header, controlled red accents, and a mixed scroll behavior:
 *
 * 1) Top “notch” hero:
 *    - Title + subtitle + search bar + calendar icon.
 *    - White / silver card, rounded 3XL, light shadow, NO red inside the notch.
 *    - Title: “Discover where your presence matters”
 *    - Subtitle: “Find curated creator experiences across the city.”
 *    - Search input full width, calendar icon pill on the right.
 *    - The hero gently FADES and COMPRESSES on scroll (opacity / scale / y
 *      animated with Framer Motion based on scrollY).
 *
 * 2) Pinned This Week:
 *    - Horizontal scrollable carousel of venue cards.
 *    - Cards: rounded 22px, full-bleed image with dark gradient overlay,
 *      red “Pinned This Week” badge, optional city/category badge, white text.
 *    - This section scrolls away normally (not sticky).
 *    - Each pinned card has a PHYSICS FEEL: spring transition + subtle 3D tilt
 *      on hover/tap (rotateX/rotateY + y).
 *
 * 3) Sticky Category Filters:
 *    - Row of round chips (Sport, Cocktail, Beauty, Lunch, Breakfast).
 *    - Entire filter bar is position: sticky; top: 0; with a subtle background and blur.
 *    - First chip (Sport) highlighted in red; others white with gray border.
 *    - Once user scrolls, notch + pinned disappear but this filter row remains anchored,
 *      so the vertical venue list uses almost the whole screen.
 *
 * 4) All Venues:
 *    - Vertical list of full-width venue cards (same visual language as pinned).
 *    - Scrolls under the sticky filter bar.
 *    - Cards have a softer lift on hover/tap (no 3D tilt, just y/scale).
 *
 * Data / Logic:
 * - Fetch venues from the provided Xano endpoint (POST).
 * - Deduplicate venues by restaurant_turbo_id; hide venues with hidden/Visible flags.
 * - Use first 5 venues as “Pinned This Week”; remaining ones as “All Venues”.
 * - Search:
 *   • Text input filters venues by name and badge label (city/category).
 *   • Filtering affects both pinned and all venues.
 *
 * - Detail Overlay:
 *   • On card tap, open existing <VenueDetail /> overlay.
 *   • Pass a simplified DetailVenue object with id, name, image, city, brief, offers.
 *
 * Styling:
 * - Use TailwindCSS utility classes; no external CSS.
 * - Keep the brand language:
 *      background: light gradient (from #f7f7f8 to white),
 *      text: gray/black,
 *      accents: controlled red (#ef4444 range),
 *      occasional black for badges.
 * - Use framer-motion LayoutGroup + motion for subtle card animations
 *   (hero scroll animation + pinned 3D tilt).
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
import VenueDetail from "@/features/venues/VenueDetail"; // ← already created

interface Venue {
  restaurant_turbo_id: number;
  Name: string;
  Cover?: { url?: string | null } | null;
  visible?: boolean;
  Visible?: boolean;
  display?: boolean;
  hidden?: boolean;
  Hidden?: boolean;
  status?: string;
  city?: string | null;
  City?: string | null;
  category?: string | null;
  Category?: string | null;
  [k: string]: any;
}

interface VenuesResponse {
  categoryfilter?: Venue[];
  area?: Venue[];
  filt?: Venue[];
  [k: string]: any;
}

const FALLBACK_GRADIENT =
  "radial-gradient(circle at 20% 20%, rgba(255,255,255,0.12) 0%, rgba(10,11,12,0.92) 55%, rgba(10,11,12,1) 100%)";

function isHiddenVenue(venue: Venue): boolean {
  if (!venue) return true;
  const status = typeof venue.status === "string" ? venue.status.toLowerCase() : "";
  return (
    venue.visible === false ||
    (venue as { Visible?: boolean }).Visible === false ||
    venue.display === false ||
    venue.hidden === true ||
    (venue as { Hidden?: boolean }).Hidden === true ||
    status === "hidden"
  );
}

function getBadgeLabel(venue: Venue): string | null {
  const rawLabel =
    (typeof venue.city === "string" && venue.city.trim()) ||
    (typeof venue.City === "string" && venue.City.trim()) ||
    (typeof venue.category === "string" && venue.category.trim()) ||
    (typeof venue.Category === "string" && venue.Category.trim()) ||
    (typeof (venue as any).area === "string" && String((venue as any).area).trim());

  return rawLabel && rawLabel.length ? rawLabel : null;
}

type DetailVenue = {
  id: string;
  name: string;
  image: string;
  city?: string;
  brief: string;
  offers: Array<{ id: string; title: string; plates?: number; drinks?: number; mission: string }>;
};

const CATEGORY_FILTERS = ["Sport", "Cocktail", "Beauty", "Lunch", "Breakfast"];
const DISTRICT_FILTERS = ["Seminyak", "Canggu", "Uluwatu", "Kerobokan", "Pererenan"];

/**
 * Codex Patch — Make sticky bar Search & Calendar interactive
 *
 * Goal:
 * Keep the existing VenuesScreen layout and logic, but:
 *
 *  - Search icon (in the sticky bar):
 *      • Opens a floating, Spotlight-style overlay.
 *      • Overlay: dark blurred backdrop + centered white card with:
 *            - Title: “Search experiences”
 *            - Subtitle: “Find venues, districts or vibes”
 *            - Text input bound to the same `search` state used in the hero.
 *      • Closing: tapping an X button or tapping the backdrop.
 *
 *  - Calendar icon (in the sticky bar):
 *      • Opens a simple month modal overlay.
 *      • Overlay: same dark blurred backdrop + centered white card with:
 *            - Title: “Select date”
 *            - A simple month grid (1–30) as buttons.
 *            - Selecting a day updates a local `selectedDay` state.
 *      • No real date filter logic is required; this is just UI for now.
 *      • Closing: tapping an X button or tapping the backdrop.
 *
 * Implementation details:
 *  1. Add new React state in VenuesScreen:
 *        const [searchOverlayOpen, setSearchOverlayOpen] = useState(false);
 *        const [calendarOpen, setCalendarOpen] = useState(false);
 *        const [selectedDay, setSelectedDay] = useState<number | null>(null);
 *
 *  2. Update the Search + Calendar icon buttons in the sticky filter bar
 *     so they call setSearchOverlayOpen(true) and setCalendarOpen(true).
 *
 *  3. At the bottom of the component JSX (inside LayoutGroup, but after the main
 *     page content), add two <AnimatePresence> blocks:
 *        - One for the Search overlay (Spotlight style).
 *        - One for the Calendar month modal.
 *
 *     Both overlays should:
 *        - Use motion.div for the backdrop (fade in/out).
 *        - Use motion.div for the card (scale + y + opacity in/out).
 *        - Have z-index higher than VenueDetail so they appear on top (e.g. z-50).
 */

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

  // Scroll-based hero animation (fade + compress)
  const { scrollY } = useScroll();
  const heroOpacity = useTransform(scrollY, [0, 140], [1, 0]);
  const heroScale = useTransform(scrollY, [0, 140], [1, 0.93]);
  const heroTranslateY = useTransform(scrollY, [0, 140], [0, -26]);

  useEffect(() => {
    const controller = new AbortController();

    fetch("https://xbut-eryu-hhsg.f2.xano.io/api:vGd6XDW3/getRestaurantNEW", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        city_id: 3,
        page: 1,
        search: "",
        area: [],
        category: [],
        content: [],
        booking: [],
      }),
      signal: controller.signal,
    })
      .then(async (res) => {
        if (!res.ok) throw new Error(`Unexpected response: ${res.status}`);
        const json = (await res.json()) as VenuesResponse | Venue[];

        let merged: Venue[] = [];
        if ((json as any).categoryfilter && Array.isArray((json as any).categoryfilter)) {
          const restaurantMap = new Map<number, Venue>();
          (json as any).categoryfilter.forEach((r: any) => {
            if (r?.restaurant_turbo_id) restaurantMap.set(r.restaurant_turbo_id, r);
          });
          merged = Array.from(restaurantMap.values());
        } else if ((json as any).filt) {
          const restaurantMap = new Map<number, Venue>();
          Object.values((json as any).filt).forEach((group: any) => {
            if (Array.isArray(group)) {
              group.forEach((r: any) => {
                if (r?.restaurant_turbo_id) restaurantMap.set(r.restaurant_turbo_id, r);
              });
            }
          });
          merged = Array.from(restaurantMap.values());
        } else if (Array.isArray(json)) {
          merged = json as Venue[];
        } else {
          merged = [...(((json as any).area ?? []) as Venue[])];
        }

        const seen = new Set<number>();
        const filtered = merged.filter((v) => {
          const id = Number(v?.restaurant_turbo_id ?? 0);
          if (!id || seen.has(id)) return false;
          if (isHiddenVenue(v)) return false;
          seen.add(id);
          return true;
        });

        setVenues(filtered);
      })
      .catch((err) => {
        if ((err as any).name !== "AbortError") {
          console.error("Error fetching venues:", err);
          setError("Unable to load venues. Please try again later.");
        }
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, []);

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
    if (!venues.length)
      return (
        <div className="flex items-center justify-center py-16 text-sm text-gray-500">
          No venues found.
        </div>
      );

    const normalizedSearch = search.trim().toLowerCase();
    const visibleVenues = normalizedSearch
      ? venues.filter((v) => {
          const name = (v.Name ?? "").toLowerCase();
          const badge = (getBadgeLabel(v) ?? "").toLowerCase();
          return name.includes(normalizedSearch) || badge.includes(normalizedSearch);
        })
      : venues;

    const pinnedVenues = visibleVenues.slice(0, 5);
    const pinnedIds = new Set(pinnedVenues.map((v) => v.restaurant_turbo_id));
    const allVenues = visibleVenues.filter((v) => !pinnedIds.has(v.restaurant_turbo_id));

    const renderVenueCard = (venue: Venue, index: number, size: "compact" | "full") => {
      const id = String(venue.restaurant_turbo_id);
      const coverUrl = venue.Cover?.url ?? "";
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
          whileHover={
            isPinned
              ? { y: -8, rotateX: -4, rotateY: 4 }
              : { y: -4 }
          }
          whileTap={isPinned ? { scale: 0.97, rotateX: 0, rotateY: 0 } : { scale: 0.98 }}
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
              <p className="mt-1 text-xs font-light text-white/80">#{rankNumber} Venue</p>
            </div>
          </div>
        </motion.button>
      );
    };

    return (
      <div className="space-y-8">
        {/* Pinned section - normal scroll, goes away when user scrolls down */}
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

        {/* STICKY FILTER BAR – icons + categories always, districts collapsable */}
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

            {/* District toggle pill (collapsable row) */}
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

          {/* Row 1 — categories (always visible) */}
          <div className="flex gap-2 overflow-x-auto pb-1">
            {CATEGORY_FILTERS.map((label, i) => (
              <button
                key={label}
                className={`inline-flex flex-shrink-0 items-center rounded-full border px-4 py-2 text-sm ${
                  i === 0
                    ? "border-red-500 bg-red-500 text-white shadow-[0_10px_25px_rgba(248,113,113,0.45)]"
                    : "border-gray-200 bg-white text-gray-800"
                }`}
              >
                {label}
              </button>
            ))}
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
              {DISTRICT_FILTERS.map((label) => (
                <button
                  key={label}
                  className="
                    inline-flex flex-shrink-0 items-center rounded-full
                    border border-gray-200 bg-white/90 px-4 py-2
                    text-xs font-medium text-gray-600
                  "
                >
                  {label}
                </button>
              ))}
            </div>
          </motion.div>
        </section>

        {/* All venues - vertical list taking full screen height under sticky filters */}
        <section>
          <h2 className="mb-3 text-base font-semibold text-gray-900">All Venues</h2>
          <div className="space-y-4">
            {allVenues.map((venue, index) =>
              renderVenueCard(venue, index, "full")
            )}
          </div>
        </section>
      </div>
    );
  }, [error, loading, venues, search]);

  return (
    <LayoutGroup id="venues">
      <div className="min-h-screen bg-gradient-to-b from-[#f7f7f8] to-white px-5 pb-24 pt-8">
        <div className="mx-auto w-full max-w-5xl space-y-8">
          {/* Notch header – fades & compresses on scroll */}
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
              <button className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-red-500 shadow-[0_12px_30px_rgba(15,23,42,0.08)]">
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
                  <h2 className="text-sm font-semibold text-gray-900">Search experiences</h2>
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

      {/* Calendar overlay — simple month modal */}
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

              {/* Simple month grid (1–30) */}
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
                    onClick={() => setSelectedDay(day)}
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

              {selectedDay && (
                <p className="mt-4 text-xs text-gray-500">
                  Selected day: <span className="font-medium text-gray-800">{selectedDay}</span>
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
