import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, MapPin, Instagram, Info } from "lucide-react";
import DateTimeSheet, { Timeframe } from "./DateTimeSheet";
import { useNavigate } from "react-router-dom";
import {
  fetchAvailableDaysFromMicroservice,
  fetchCalendarRawData,
} from "../../services/calendarAvailability";
import { createBookingUpgrade } from "../../services/bookingUpgrade";

// --- Cartoonish Claris Icons (SVG) - Friendly & Instagram-native ---
const PlateIcon = () => (
  <span className="text-xl leading-none" role="img" aria-label="plates">🥗</span>
);

const DrinkIcon = () => (
  <span className="text-xl leading-none" role="img" aria-label="drinks">🍷</span>
);

const DessertIcon = () => (
  <span className="text-xl leading-none" role="img" aria-label="dessert">🍰</span>
);

const ChampagneIcon = () => (
  <span className="text-xl leading-none" role="img" aria-label="champagne">🥂</span>
);

const fmtHours = (h: number) => {
  if (h < 1) return "<1h";
  if (h < 24) return `${Math.round(h)}h`;
  const d = Math.round(h / 24);
  return `${d}d`;
};

const StatPill = ({
  label,
  value,
  sub,
  icon,
  tone = "neutral",
}: {
  label: string;
  value: string;
  sub?: string;
  icon?: ReactNode;
  tone?: "neutral" | "good" | "warn";
}) => {
  const toneRing =
    tone === "good"
      ? "ring-emerald-200/60"
      : tone === "warn"
      ? "ring-amber-200/60"
      : "ring-slate-200/60";

  const toneDot =
    tone === "good"
      ? "bg-emerald-500/80"
      : tone === "warn"
      ? "bg-amber-500/80"
      : "bg-slate-400/80";

  return (
    <div
      className={[
        "flex items-center gap-2",
        "rounded-full",
        "bg-slate-50/80",
        "border border-slate-200/60",
        "px-3 py-1.5",
      ].join(" ")}
    >
      <div
        className={[
          "h-5 w-5 rounded-full",
          "bg-white",
          "border border-slate-200/70",
          "grid place-items-center",
          "flex-shrink-0",
        ].join(" ")}
      >
        {icon ? (
          <div className="scale-[0.65]">{icon}</div>
        ) : (
          <span className={["h-1.5 w-1.5 rounded-full", toneDot].join(" ")} />
        )}
      </div>

      <div className="flex items-baseline gap-1 min-w-0">
        <p className="text-[13px] font-medium text-slate-900">{value}</p>
        <p className="text-[11px] text-slate-500 truncate">{sub || label}</p>
      </div>
    </div>
  );
};


type XanoFile = {
  url?: string;
  [key: string]: unknown;
};

type Restaurant = {
  id?: number;
  Name?: string;
  Cover?: XanoFile | null;
  GalleryRestaurant?: XanoFile[] | null;
  Brief?: string | null;
  Description?: string | null;
  City?: { Name?: string | null } | null;
  [key: string]: unknown;
};

type ActionTurbo = {
  Action_Name?: string | null;
  Descrizione?: string | null;
  Action_icon?: XanoFile | null;
  Plates?: number | null;
  Drinks?: number | null;
  stories?: number | null;
  Days_deadline?: number | null;
  [key: string]: unknown;
};

type TurboOffer = {
  id: number;
  OfferName: string;
  timeslot_id: number[];
  weekdaysturbo_id: number[];
  actions_turbo_id: number;
  restaurant_turbo_id: number;
  Offer_cover?: { url?: string } | null;
};

type Service = {
  id: number;
  _actions_turbo?: ActionTurbo | null;
  [key: string]: unknown;
};

type ServiceOffer = {
  id: string;
  title: string;
  description: string;
  icon?: string;
  plates?: number;
  drinks?: number;
  stories?: number;
  daysDeadline?: number;
  dessert?: number;
  champagne?: number;
  image?: string;
};

const DETAIL_ENDPOINT =
  "https://xbut-eryu-hhsg.f2.xano.io/api:vGd6XDW3/get_restaurant_and_service_Upgrade";
const OFFER_UPGRADE_URL =
  "https://xbut-eryu-hhsg.f2.xano.io/api:vGd6XDW3/offer_upgrade";
const HARDCODED_VENUE_ID = 1018;
const turboOffersCache = new Map<number, TurboOffer[]>();

const mapTurboOfferToOfferCard = (offer: TurboOffer): ServiceOffer => ({
  id: String(offer.id),
  title: offer.OfferName,
  description: "Details available after booking confirmation.",
  image: offer.Offer_cover?.url ?? undefined,
});

export default function VenueDetail({
  venue,
  onClose,
}: {
  venue: { id: number | string };
  onClose: () => void;
}) {
  const [activeTab, setActiveTab] = useState(0);
  const [selectedOfferId, setSelectedOfferId] = useState<string | null>(null);
  const [briefOpen, setBriefOpen] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [turboOffers, setTurboOffers] = useState<TurboOffer[]>([]);
  const [turboOffersLoading, setTurboOffersLoading] = useState(false);
  const [turboOffersError, setTurboOffersError] = useState<string | null>(null);
  const [confirmedSlot, setConfirmedSlot] = useState<{
    iso: string;
    date: string;
    timeLabel: string;
    offerId: string;
    timeframeId?: string;
    timeslotId?: number;
    timeframeLabel?: string;
  } | null>(null);
  const [availabilityByOffer, setAvailabilityByOffer] = useState<Record<string, Set<string>>>({});
  const [availabilityLoadingByOffer, setAvailabilityLoadingByOffer] = useState<
    Record<string, boolean>
  >({});
  const [availabilityErrorByOffer, setAvailabilityErrorByOffer] = useState<
    Record<string, string | null>
  >({});
  const [remainingByOffer, setRemainingByOffer] = useState<
    Record<string, Record<string, { remaining_slots: number }>>
  >({});
  const [availabilityRangeByOffer, setAvailabilityRangeByOffer] = useState<
    Record<string, { from: number; to: number }>
  >({});
  const navigate = useNavigate();

  const restaurantId = useMemo(() => Number(venue.id), [venue.id]);
  const shouldUseTurboOffers = restaurantId === HARDCODED_VENUE_ID;

  useEffect(() => {
    const controller = new AbortController();
    if (!Number.isFinite(restaurantId)) {
      setError("Invalid restaurant id.");
      return () => controller.abort();
    }

    setLoading(true);
    setError(null);
    setRestaurant(null);
    setServices([]);

    fetch(DETAIL_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ restaurant_id: restaurantId }),
      signal: controller.signal,
    })
      .then(async (res) => {
        if (!res.ok) throw new Error(`Unexpected response: ${res.status}`);
        return (await res.json()) as { restaurant?: Restaurant; services?: Service[] };
      })
      .then((data) => {
        setRestaurant(data.restaurant ?? null);
        setServices(Array.isArray(data.services) ? data.services : []);
      })
      .catch((err) => {
        if ((err as { name?: string }).name === "AbortError") return;
        console.error("Failed to load venue detail", err);
        setError("Unable to load venue details.");
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [restaurantId]);

  useEffect(() => {
    if (!shouldUseTurboOffers) {
      setTurboOffers([]);
      setTurboOffersError(null);
      setTurboOffersLoading(false);
      return;
    }

    const cachedOffers = turboOffersCache.get(restaurantId);
    if (cachedOffers) {
      setTurboOffers(cachedOffers);
      setTurboOffersError(null);
      setTurboOffersLoading(false);
      return;
    }

    const controller = new AbortController();
    setTurboOffersLoading(true);
    setTurboOffersError(null);

    fetch(OFFER_UPGRADE_URL, {
      method: "GET",
      signal: controller.signal,
    })
      .then(async (res) => {
        if (!res.ok) throw new Error(`Unexpected response: ${res.status}`);
        return (await res.json()) as TurboOffer[];
      })
      .then((data) => {
        const normalized = Array.isArray(data) ? data : [];
        turboOffersCache.set(restaurantId, normalized);
        setTurboOffers(normalized);
      })
      .catch((err) => {
        if ((err as { name?: string }).name === "AbortError") return;
        console.error("Failed to load turbo offers", err);
        setTurboOffersError("Unable to load offers.");
      })
      .finally(() => setTurboOffersLoading(false));

    return () => controller.abort();
  }, [restaurantId, shouldUseTurboOffers]);

  const serviceOffers = useMemo<ServiceOffer[]>(
    () =>
      services.map((service) => ({
        id: String(service.id),
        title: service._actions_turbo?.Action_Name ?? "",
        description: service._actions_turbo?.Descrizione ?? "",
        icon: service._actions_turbo?.Action_icon?.url ?? undefined,
        plates: service._actions_turbo?.Plates ?? undefined,
        drinks: service._actions_turbo?.Drinks ?? undefined,
        stories: service._actions_turbo?.stories ?? undefined,
        daysDeadline: service._actions_turbo?.Days_deadline ?? undefined,
      })),
    [services]
  );

  const turboServiceOffers = useMemo<ServiceOffer[]>(
    () => turboOffers.map(mapTurboOfferToOfferCard),
    [turboOffers]
  );

  const offers = shouldUseTurboOffers ? turboServiceOffers : serviceOffers;
  const offersLoading = shouldUseTurboOffers ? turboOffersLoading : false;
  const offersError = shouldUseTurboOffers ? turboOffersError : null;

  // ---- GALLERY STATE (thumbnail selector) ----
  const galleryImages = useMemo(() => {
    const urls =
      restaurant?.GalleryRestaurant?.map((item) => item?.url).filter(Boolean) ?? [];
    const coverUrl = restaurant?.Cover?.url;
    if (coverUrl) urls.unshift(coverUrl);
    return Array.from(new Set(urls.filter(Boolean)));
  }, [restaurant]);

  const [activeImg, setActiveImg] = useState<string | undefined>(undefined);

  useEffect(() => {
    setActiveImg(galleryImages[0]);
  }, [galleryImages]);

  useEffect(() => {
    setActiveTab(0);
    setSelectedOfferId(null);
    setConfirmedSlot(null);
  }, [restaurantId]);

  const hasOffers = offers.length > 0;
  const offer = hasOffers ? offers[activeTab] ?? offers[0] : null;
  const enabled = !!selectedOfferId;
  const activeConfirmed =
    confirmedSlot && confirmedSlot.offerId === selectedOfferId ? confirmedSlot : null;

  const weeklyTimeframes = useMemo<Record<number, Timeframe[]>>(
    () => ({
      0: [],
      1: [
        { id: "mon-lunch", label: "Lunch", start: { h: 12, m: 0 }, end: { h: 15, m: 0 }, stepMins: 30 },
        { id: "mon-dinner", label: "Dinner", start: { h: 18, m: 0 }, end: { h: 22, m: 0 }, stepMins: 30 },
      ],
      2: [
        { id: "tue-lunch", label: "Lunch", start: { h: 12, m: 0 }, end: { h: 15, m: 0 }, stepMins: 30 },
        { id: "tue-dinner", label: "Dinner", start: { h: 18, m: 0 }, end: { h: 22, m: 0 }, stepMins: 30 },
      ],
      3: [
        { id: "wed-lunch", label: "Lunch", start: { h: 12, m: 0 }, end: { h: 15, m: 0 }, stepMins: 30 },
        { id: "wed-dinner", label: "Dinner", start: { h: 18, m: 0 }, end: { h: 22, m: 0 }, stepMins: 30 },
      ],
      4: [
        { id: "thu-lunch", label: "Lunch", start: { h: 12, m: 0 }, end: { h: 15, m: 0 }, stepMins: 30 },
        { id: "thu-dinner", label: "Dinner", start: { h: 18, m: 0 }, end: { h: 22, m: 0 }, stepMins: 30 },
      ],
      5: [
        { id: "fri-lunch", label: "Lunch", start: { h: 12, m: 0 }, end: { h: 15, m: 0 }, stepMins: 30 },
        { id: "fri-dinner", label: "Dinner", start: { h: 18, m: 0 }, end: { h: 23, m: 0 }, stepMins: 30 },
      ],
      6: [
        { id: "sat-brunch", label: "Brunch", start: { h: 11, m: 0 }, end: { h: 14, m: 0 }, stepMins: 30 },
        { id: "sat-dinner", label: "Dinner", start: { h: 17, m: 30 }, end: { h: 23, m: 0 }, stepMins: 30 },
      ],
    }),
    []
  );

  const getTimeframeLabel = (timeframeId?: string) => {
    if (!timeframeId) return undefined;
    return Object.values(weeklyTimeframes)
      .flat()
      .find(tf => tf.id === timeframeId)?.label;
  };

  const handleOfferTap = (offerId: string) => {
    const next = selectedOfferId === offerId ? null : offerId;
    setSelectedOfferId(next);
    setSheetOpen(Boolean(next));
  };

  const loadCalendarAvailability = useCallback(
    async (offerId: string, fromMs: number, toMs: number) => {
      const numericOfferId = Number(offerId);
      if (!Number.isFinite(numericOfferId)) return;
      const cachedRange = availabilityRangeByOffer[offerId];
      if (
        cachedRange &&
        cachedRange.from === fromMs &&
        cachedRange.to === toMs &&
        availabilityByOffer[offerId]
      ) {
        return;
      }

      try {
        setAvailabilityLoadingByOffer(prev => ({ ...prev, [offerId]: true }));
        setAvailabilityErrorByOffer(prev => ({ ...prev, [offerId]: null }));
        const raw = await fetchCalendarRawData(numericOfferId, fromMs, toMs);
        const payload = {
          offer_id: numericOfferId,
          from: fromMs,
          to: toMs,
          book: raw.book.map(booking => ({
            timestamp: booking.timestamp,
            status: String(booking.status ?? "CONFIRMED").toUpperCase(),
            timeslot_id: booking.timeslot_id,
          })),
          offer_timeslot: raw.offer_timeslot.map(timeslot => ({
            timeslot_id: timeslot.timeslot_id,
            active: Boolean(timeslot.active),
          })),
        };

        const availableDays = await fetchAvailableDaysFromMicroservice(payload);
        const nextSet = new Set<string>();
        const remainingMap: Record<string, { remaining_slots: number }> = {};

        availableDays.forEach(day => {
          if (day.available) {
            nextSet.add(day.date);
            if (typeof day.remaining_slots === "number") {
              remainingMap[day.date] = { remaining_slots: day.remaining_slots };
            }
          }
        });

        setAvailabilityByOffer(prev => ({ ...prev, [offerId]: nextSet }));
        setRemainingByOffer(prev => ({ ...prev, [offerId]: remainingMap }));
        setAvailabilityRangeByOffer(prev => ({ ...prev, [offerId]: { from: fromMs, to: toMs } }));
        setAvailabilityLoadingByOffer(prev => ({ ...prev, [offerId]: false }));
      } catch (err) {
        console.error("Failed to load calendar availability", err);
        setAvailabilityByOffer(prev => ({ ...prev, [offerId]: new Set() }));
        setRemainingByOffer(prev => ({ ...prev, [offerId]: {} }));
        setAvailabilityRangeByOffer(prev => ({ ...prev, [offerId]: { from: fromMs, to: toMs } }));
        setAvailabilityLoadingByOffer(prev => ({ ...prev, [offerId]: false }));
        setAvailabilityErrorByOffer(prev => ({
          ...prev,
          [offerId]: "Unable to load availability. Please try again.",
        }));
      }
    },
    [availabilityByOffer, availabilityRangeByOffer]
  );

  const handleMonthRangeChange = (fromMs: number, toMs: number) => {
    if (!selectedOfferId) return;
    void loadCalendarAvailability(selectedOfferId, fromMs, toMs);
  };

  useEffect(() => {
    if (!sheetOpen) return;
    if (!selectedOfferId) return;
    const { fromMs, toMs } = getMonthRange(new Date());
    void loadCalendarAvailability(selectedOfferId, fromMs, toMs);
  }, [sheetOpen, selectedOfferId, loadCalendarAvailability]);

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center"
        style={{
          background:
            "radial-gradient(1200px 600px at 70% -10%, #fffaf4 0%, #f7f1e6 40%, #e9dec9 75%, #e5d6c2 100%)",
        }}
      >
        <div className="rounded-2xl bg-white/80 px-6 py-4 text-sm text-stone-600 shadow">
          Loading venue…
        </div>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center"
        style={{
          background:
            "radial-gradient(1200px 600px at 70% -10%, #fffaf4 0%, #f7f1e6 40%, #e9dec9 75%, #e5d6c2 100%)",
        }}
      >
        <div className="rounded-2xl bg-white/80 px-6 py-4 text-sm text-stone-600 shadow">
          {error}
        </div>
      </motion.div>
    );
  }

  if (!restaurant) return null;

  const restaurantName = restaurant.Name ?? "";
  const restaurantCity =
    restaurant.City?.Name ?? (restaurant as { city?: string | null }).city ?? "";
  const restaurantBrief = restaurant.Brief ?? restaurant.Description ?? "";
  const creatorBrief =
    (restaurant as { CreatorBrief?: string | null; creator_brief?: string | null })
      .CreatorBrief ??
    (restaurant as { CreatorBrief?: string | null; creator_brief?: string | null })
      .creator_brief ??
    "";
  const responseHours = (restaurant as { responseHours?: number }).responseHours;
  const acceptanceRate = (restaurant as { acceptanceRate?: number }).acceptanceRate;

  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0 }}
      className="fixed inset-0 z-50 overflow-y-auto"
      style={{
        background:
          "radial-gradient(1200px 600px at 70% -10%, #fffaf4 0%, #f7f1e6 40%, #e9dec9 75%, #e5d6c2 100%)",
      }}
    >
      <div className="mx-auto max-w-sm pb-28">
        {/* Hero / Gallery */}
        <div className="relative">
          {/* Back */}
          <button
            onClick={onClose}
            className="absolute left-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/80 backdrop-blur-md shadow ring-1 ring-white/70"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>

          {/* Cover image (changes on thumbnail click) */}
          <div className="px-4 pt-2">
            <div className="relative overflow-hidden rounded-[24px]">
              <AnimatePresence mode="wait" initial={false}>
                <motion.img
                  key={activeImg}
                  src={activeImg ?? restaurant.Cover?.url ?? ""}
                  alt={restaurantName}
                  className="h-64 w-full object-cover"
                  initial={{ opacity: 0, scale: 1.02, filter: "blur(6px)" }}
                  animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                  exit={{ opacity: 0, scale: 0.995, filter: "blur(6px)" }}
                  transition={{ duration: 0.55, ease: [0.22, 0.61, 0.36, 1] }}
                />
              </AnimatePresence>
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/20 via-black/0 to-black/0" />
              <div
                className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/35 via-black/10 to-transparent"
              />
            </div>
          </div>

          {/* Thumbnails under cover */}
          <div className="px-4 mt-3">
            <div className="h-px bg-white/50" />
            <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
              {galleryImages.map((url, idx) => {
                const isActive = url === activeImg;
                return (
                  <button
                    key={`${url}-${idx}`}
                    onClick={() => setActiveImg(url)}
                    className={`relative flex h-[44px] w-[44px] flex-shrink-0 overflow-hidden rounded-[12px] ring-1 ring-white/60 transition-all duration-150 ${
                      isActive
                        ? "ring-2 ring-[#FF5A7A] ring-offset-2 ring-offset-white shadow-[0_10px_22px_rgba(255,90,122,0.25)]"
                        : "opacity-90 hover:opacity-100"
                    }`}
                    aria-label={`Open image ${idx + 1}`}
                  >
                    <img
                      src={url}
                      alt={`Gallery thumbnail ${idx + 1}`}
                      className="h-full w-full object-cover"
                    />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Venue name under thumbnails */}
          <div className="px-4 mt-2 text-[22px] font-semibold text-stone-900 tracking-tight">
            {restaurantName}
          </div>

        </div>

        {/* About */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="mx-4 mt-4 rounded-2xl bg-white/65 backdrop-blur-xl ring-1 ring-white/60 shadow-[0_8px_24px_rgba(0,0,0,.08)] p-4"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-stone-900 font-semibold">About</h3>
            {creatorBrief && (
              <button
                onClick={() => setBriefOpen((v) => !v)}
                className="text-sm text-stone-600 underline"
              >
                {briefOpen ? "Hide brief" : "Creator brief"}
              </button>
            )}
          </div>

          {restaurantBrief && (
            <p className="mt-1 text-[13px] leading-6 text-stone-700">
              {restaurantBrief}
            </p>
          )}

          <div className="mt-4 flex items-center justify-between">
            {restaurantCity && (
              <div className="flex items-center gap-2 text-sm text-stone-700">
                <MapPin className="h-4 w-4" />
                {restaurantCity}
              </div>
            )}

            <button className="inline-flex items-center gap-2 text-sm text-stone-700">
              <Instagram className="h-4 w-4" /> Visit
            </button>
          </div>

          {(responseHours != null || acceptanceRate != null) && (
            <div className="mt-3 flex flex-wrap gap-2">
              {responseHours != null && (
                <StatPill
                  label="Response"
                  value={fmtHours(responseHours)}
                  sub="avg time"
                  tone={
                    responseHours <= 6 ? "good" : responseHours <= 24 ? "neutral" : "warn"
                  }
                  icon={
                    <svg
                      viewBox="0 0 24 24"
                      className="h-4 w-4 text-slate-700/70"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.7"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2" />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  }
                />
              )}
              {acceptanceRate != null && (
                <StatPill
                  label="Acceptance"
                  value={`${Math.round(acceptanceRate)}%`}
                  sub="approved"
                  tone={
                    acceptanceRate >= 70 ? "good" : acceptanceRate >= 40 ? "neutral" : "warn"
                  }
                  icon={
                    <svg
                      viewBox="0 0 24 24"
                      className="h-4 w-4 text-slate-700/70"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.7"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M20 6L9 17l-5-5" />
                    </svg>
                  }
                />
              )}
            </div>
          )}
        </motion.section>

        {/* Creator Brief */}
        <AnimatePresence initial={false}>
          {briefOpen && creatorBrief && (
            <motion.section
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="mx-4 mt-3 rounded-2xl bg-white/65 backdrop-blur-xl ring-1 ring-white/60 shadow-[0_8px_24px_rgba(0,0,0,.08)] p-4"
            >
              <h3 className="text-stone-900 font-semibold text-sm">Creator Brief</h3>
              <p className="mt-2 text-[13px] leading-6 text-stone-700">
                {creatorBrief}
              </p>
            </motion.section>
          )}
        </AnimatePresence>

        {/* Bridge CTA */}
        <AnimatePresence initial={false}>
          {!selectedOfferId && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.3, delay: 0.15 }}
              className="mx-4 mt-6 mb-2 flex items-baseline justify-between"
            >
              <h3 className="text-[15px] font-semibold text-stone-900 tracking-tight">
                Select a Collaboration
              </h3>
              <span className="text-[12px] text-stone-500">
                Compare perks &amp; requirements
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tabs */}
        {hasOffers && (
          <div className="mx-4 mt-4 relative rounded-2xl p-1 bg-white/45 backdrop-blur-xl ring-1 ring-white/50 flex">
            {offers.map((o, i) => (
              <button
                key={o.id}
                onClick={() => setActiveTab(i)}
                aria-pressed={i === activeTab}
                className={`relative z-10 flex-1 py-2 text-sm font-medium transition-colors ${
                  i === activeTab ? "text-[#FF5A7A]" : "text-stone-700"
                }`}
              >
                {o.title}
              </button>
            ))}
            <motion.div
              layout
              className="absolute top-1 bottom-1 rounded-xl bg-white shadow-[0_1px_8px_rgba(0,0,0,.06)]"
              style={{
                left: `calc(${(100 / offers.length) * activeTab}% + 0.25rem)`,
                width: `calc(${100 / offers.length}% - 0.5rem)`,
              }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
            <motion.div
              key={activeTab}
              className="pointer-events-none absolute bottom-0 h-0.5 rounded-full bg-gradient-to-r from-[#FF5A7A] to-[#FF3A6E]"
              style={{
                left: `calc(${(100 / offers.length) * activeTab}% + 0.25rem)`,
                width: `calc(${100 / offers.length}% - 0.5rem)`,
              }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
              layout
            />
          </div>
        )}

        {/* Offer card */}
        {offersLoading ? (
          <div className="mx-4 mt-6 rounded-2xl bg-white/70 p-4 text-sm text-stone-600">
            Loading offers…
          </div>
        ) : offersError ? (
          <div className="mx-4 mt-6 rounded-2xl bg-white/70 p-4 text-sm text-stone-600">
            {offersError}
          </div>
        ) : offer ? (
          <>
            <AnimatePresence mode="wait">
              {!sheetOpen && (
                <motion.section
                  key={offer.id}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.25 }}
                  className="mx-4 mt-4"
                >
                  <OfferCard
                    offerId={offer.id}
                    title={offer.title}
                    plates={offer.plates ?? 0}
                    drinks={offer.drinks ?? 0}
                    dessert={offer.dessert ?? 0}
                    champagne={offer.champagne ?? 0}
                    mission={offer.description}
                    isSelected={selectedOfferId === offer.id}
                    onToggle={() => handleOfferTap(offer.id)}
                  />
                </motion.section>
              )}
            </AnimatePresence>

            <p className="mx-4 mt-3 text-sm text-stone-600">
              Choose the high-quality content you’ll craft in return for the complimentary experience
            </p>

            {/* Sticky CTA */}
            <div className="fixed inset-x-0 bottom-3 px-4">
              <div className="mx-auto max-w-sm rounded-2xl bg-white/70 backdrop-blur-lg ring-1 ring-white/50 p-2">
                <div className="px-2 pb-2 text-center text-xs text-stone-600">
                  {enabled
                    ? activeConfirmed
                      ? `${offer.title} · ${activeConfirmed.timeLabel}`
                      : offer.title
                    : "Pick an offer to continue"}
                </div>
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  animate={
                    enabled
                      ? {
                          opacity: 1,
                          scale: 1,
                          boxShadow:
                            "0 4px 12px rgba(255,90,122,0.25), 0 2px 4px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.8)",
                          background: "linear-gradient(135deg, #fefefe 0%, #f5f5f5 100%)",
                          color: "#FF5A7A",
                          borderColor: "#FF5A7A",
                        }
                      : {
                          opacity: 0.6,
                          scale: 1,
                          background: "linear-gradient(to right, #FF5A7A, #FF3A6E)",
                          color: "#ffffff",
                          borderColor: "transparent",
                          boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                        }
                  }
                  disabled={!enabled}
                  className="w-full rounded-[15px] px-4 py-2 font-medium border-[3px] disabled:cursor-not-allowed transition-all"
                  onClick={() => enabled && setSheetOpen(true)}
                >
                  {activeConfirmed?.timeLabel
                    ? `Confirm ${activeConfirmed.timeLabel}`
                    : "Select date & time"}
                </motion.button>
              </div>
            </div>
          </>
        ) : (
          <div className="mx-4 mt-6 rounded-2xl bg-white/70 p-4 text-sm text-stone-600">
            No offers available right now.
          </div>
        )}
      </div>

      {offer && (
        <DateTimeSheet
          open={sheetOpen}
          onClose={() => setSheetOpen(false)}
          offerId={selectedOfferId ?? offer.id}
          venueId={restaurantId}
          availableDaySet={availabilityByOffer[selectedOfferId ?? offer.id]}
          availableDays={remainingByOffer[selectedOfferId ?? offer.id]}
          availabilityLoading={availabilityLoadingByOffer[selectedOfferId ?? offer.id]}
          availabilityError={availabilityErrorByOffer[selectedOfferId ?? offer.id]}
          onRangeChange={handleMonthRangeChange}
          timeframesByDow={weeklyTimeframes}
          onConfirm={async (payload) => {
            const timeframeLabel = getTimeframeLabel(payload.timeframeId);
            setConfirmedSlot({ ...payload, timeframeLabel });

            const matchedOffer =
              offers.find(currentOffer => currentOffer.id === payload.offerId) ?? offer;

            const date = payload.date;
            const timestamp = Date.parse(`${date}T00:00:00Z`);
            const weekday = new Date(`${date}T00:00:00Z`).getUTCDay();
            const weekdaysturboId = weekday === 0 ? 7 : weekday;

            try {
              await createBookingUpgrade({
                offer_upgrade_id: Number(payload.offerId),
                date,
                timestamp,
                weekdaysturbo_id: weekdaysturboId,
                timeslot_id: payload.timeslotId,
                status: "PENDING",
                SlotLimit: { Type: "", Limit: 0 },
                Booking_id_fk: 0,
              });
            } catch (error) {
              console.error("Failed to create booking upgrade", error);
              return;
            }

            navigate("/booking/preview", {
              state: {
                date: payload.date,
                time: payload.timeLabel,
                meal: timeframeLabel,
                venueId: restaurantId,
                venueName: restaurantName,
                offerId: matchedOffer.id,
                offerTitle: matchedOffer.title,
              },
            });
          }}
        />
      )}
    </motion.div>
  );
}

function getMonthRange(date: Date) {
  const from = new Date(date.getFullYear(), date.getMonth(), 1, 0, 0, 0, 0);
  const to = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
  return { fromMs: from.getTime(), toMs: to.getTime() };
}

/* OfferCard - Cartoon Friendly Instagram-native */
function OfferCard({
  title,
  plates,
  drinks,
  dessert = 0,
  champagne = 0,
  mission,
  isSelected,
  onToggle,
  offerId,
  pinned = false,
  collabsLeft,
}: {
  title: string;
  plates: number;
  drinks: number;
  dessert?: number;
  champagne?: number;
  mission: string;
  isSelected: boolean;
  onToggle: () => void;
  offerId: string;
  pinned?: boolean;
  collabsLeft?: number;
}) {
  const chipLabel =
    title.toLowerCase().includes("story")
      ? "Stories Content"
      : title.toLowerCase().includes("reel")
      ? "Reel Content"
      : "Creator Content";

  const hasMission = Boolean(mission);

  return (
    <motion.button
      layout
      layoutId={`offer-${offerId}`}
      onClick={onToggle}
      aria-pressed={isSelected}
      whileTap={{ scale: 0.98 }}
      animate={
        isSelected
          ? {
              boxShadow:
                "0 8px 20px rgba(255,90,122,0.12), 0 2px 8px rgba(224,201,163,0.2)",
              backgroundColor: "rgba(255,255,255,0.9)",
              borderColor: "#FF5A7A",
            }
          : {
              boxShadow:
                "0 2px 12px rgba(0,0,0,0.04)",
              backgroundColor: "rgba(255,255,255,0.7)",
              borderColor: "#F0E6D8",
            }
      }
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={`relative w-full text-left border-2 backdrop-blur-md ${
        pinned ? "rounded-xl px-3 py-3" : "rounded-3xl px-5 py-5"
      }`}
    >
      {/* Top right badges */}
      <div className="absolute right-4 top-4 flex items-center gap-2">
        {isSelected && (
          <span className="inline-flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-medium text-stone-600 ring-1 ring-stone-200/50">
            Selected
          </span>
        )}
        {collabsLeft != null && (
          <span className="inline-flex items-center gap-1 rounded-full bg-[#FF5A7A]/8 px-2.5 py-1 text-[10px] font-medium text-[#FF5A7A]">
            {collabsLeft} left
          </span>
        )}
      </div>

      {/* Title + Content Type Pill */}
      <div className="flex items-center gap-3">
        <div className="text-lg font-semibold text-stone-800 tracking-tight">{title}</div>
        <span className="rounded-full bg-stone-100/80 px-3 py-1 text-[10px] font-medium text-stone-500 uppercase tracking-wide">
          {chipLabel}
        </span>
      </div>

      {/* Perks Grid - 2x2 with vertical layout */}
      <div className="mt-5 grid grid-cols-2 gap-4">
        {/* Plates */}
        {plates > 0 && (
          <div className="flex flex-col items-center text-center">
            <div className="flex h-[36px] w-[36px] items-center justify-center rounded-full bg-[#E8F5E9]/80 shadow-[inset_0_1px_2px_rgba(255,255,255,0.9),0_1px_3px_rgba(0,0,0,0.06)]">
              <PlateIcon />
            </div>
            <div className="mt-2 text-[9px] font-medium uppercase tracking-widest text-stone-400">
              Plates
            </div>
            <div className="mt-0.5 text-sm font-medium text-stone-700">{plates}</div>
          </div>
        )}

        {/* Drinks */}
        {drinks > 0 && (
          <div className="flex flex-col items-center text-center">
            <div className="flex h-[36px] w-[36px] items-center justify-center rounded-full bg-[#FCE4EC]/80 shadow-[inset_0_1px_2px_rgba(255,255,255,0.9),0_1px_3px_rgba(0,0,0,0.06)]">
              <DrinkIcon />
            </div>
            <div className="mt-2 text-[9px] font-medium uppercase tracking-widest text-stone-400">
              Drinks
            </div>
            <div className="mt-0.5 text-sm font-medium text-stone-700">{drinks}</div>
          </div>
        )}

        {/* Dessert */}
        {dessert > 0 && (
          <div className="flex flex-col items-center text-center">
            <div className="flex h-[36px] w-[36px] items-center justify-center rounded-full bg-[#FFF3E0]/80 shadow-[inset_0_1px_2px_rgba(255,255,255,0.9),0_1px_3px_rgba(0,0,0,0.06)]">
              <DessertIcon />
            </div>
            <div className="mt-2 text-[9px] font-medium uppercase tracking-widest text-stone-400">
              Dessert
            </div>
            <div className="mt-0.5 text-sm font-medium text-stone-700">{dessert}</div>
          </div>
        )}

        {/* Champagne */}
        {champagne > 0 && (
          <div className="flex flex-col items-center text-center">
            <div className="flex h-[36px] w-[36px] items-center justify-center rounded-full bg-[#FFF8E1]/80 shadow-[inset_0_1px_2px_rgba(255,255,255,0.9),0_1px_3px_rgba(0,0,0,0.06)]">
              <ChampagneIcon />
            </div>
            <div className="mt-2 text-[9px] font-medium uppercase tracking-widest text-stone-400">
              Champagne
            </div>
            <div className="mt-0.5 text-sm font-medium text-stone-700">{champagne}</div>
          </div>
        )}
      </div>

      {/* Mission collapsible */}
      {hasMission && (
        <motion.div
          initial={false}
          animate={{ height: isSelected ? "auto" : 0, opacity: isSelected ? 1 : 0 }}
          className="overflow-hidden"
        >
          <p className="mt-4 text-[13px] leading-relaxed text-stone-500">{mission}</p>
        </motion.div>
      )}

      {/* Bottom hint */}
      <div className="mt-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 text-stone-400">
          <Info className="h-3.5 w-3.5" />
          <span className="text-[11px]">Tap to see details</span>
        </div>
        <span className="text-[10px] px-2 py-0.5 rounded-md bg-stone-50 text-stone-500 border border-stone-100">
          by venue approval
        </span>
      </div>
    </motion.button>
  );
}
