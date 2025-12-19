import { useEffect, useMemo, useState, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, MapPin, Instagram, Info } from "lucide-react";
import DateTimeSheet, { Timeframe } from "./DateTimeSheet";
import type { Venue } from "./VenueTypes";
import { FeaturedCollabsStrip } from "@/features/venues/FeaturedCollabsStrip";
import { useNavigate } from "react-router-dom";

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
        "flex items-center gap-3",
        "rounded-[18px]",
        "bg-white/70 backdrop-blur-md",
        "border border-white/60",
        "shadow-[0_10px_28px_rgba(15,23,42,0.08)]",
        "ring-1",
        toneRing,
        "px-4 py-3",
      ].join(" ")}
    >
      <div
        className={[
          "h-9 w-9 rounded-full",
          "bg-white/65 backdrop-blur",
          "border border-white/70",
          "shadow-[0_10px_22px_rgba(15,23,42,0.08)]",
          "grid place-items-center",
        ].join(" ")}
      >
        {icon ?? <span className={["h-2.5 w-2.5 rounded-full", toneDot].join(" ")} />}
      </div>

      <div className="min-w-0">
        <p className="text-[11px] font-medium tracking-[0.14em] text-slate-500 uppercase">
          {label}
        </p>
        <div className="flex items-baseline gap-2">
          <p className="text-[18px] font-semibold text-slate-900">{value}</p>
          {sub && <p className="text-[12px] text-slate-500">{sub}</p>}
        </div>
      </div>
    </div>
  );
};


// Dummy featured collabs (no @handles shown)
const demoFeaturedCollabs = [
  {
    id: "pancakes",
    creatorHandle: "Pancake Stack",
    contentType: "3 × Story",
    badge: "Top pick",
    imageUrl:
      "https://images.pexels.com/photos/376464/pexels-photo-376464.jpeg?auto=compress&cs=tinysrgb&w=800",
  },
  {
    id: "fries",
    creatorHandle: "House Fries",
    contentType: "Reel",
    badge: undefined,
    imageUrl:
      "https://images.pexels.com/photos/2983101/pexels-photo-2983101.jpeg?auto=compress&cs=tinysrgb&w=800",
  },
];

export default function VenueDetail({
  venue,
  onClose,
}: {
  venue: Venue;
  onClose: () => void;
}) {
  const [activeTab, setActiveTab] = useState(0);
  const [selectedOfferId, setSelectedOfferId] = useState<string | null>(null);
  const [briefOpen, setBriefOpen] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [confirmedSlot, setConfirmedSlot] = useState<{
    iso: string;
    date: string;
    timeLabel: string;
    offerId: string;
    timeframeId?: string;
    timeframeLabel?: string;
  } | null>(null);
  const navigate = useNavigate();

  const responseHours = 6;
  const acceptanceRate = 72;
  const responseTone: "good" | "warn" | "neutral" =
    responseHours == null ? "neutral" : responseHours <= 6 ? "good" : responseHours <= 24 ? "neutral" : "warn";
  const acceptanceTone: "good" | "warn" | "neutral" =
    acceptanceRate == null ? "neutral" : acceptanceRate >= 70 ? "good" : acceptanceRate >= 40 ? "neutral" : "warn";

  // ---- GALLERY STATE (thumbnail selector) ----
  const galleryImages = useMemo(() => {
    const urls = (venue.gallery ?? []).filter(Boolean);
    if (urls.length) return urls;
    return venue.image ? [venue.image] : [];
  }, [venue]);

  const [activeImg, setActiveImg] = useState(
    venue.gallery?.[0] ?? venue.image
  );

  useEffect(() => {
    setActiveImg(venue.gallery?.[0] ?? venue.image);
  }, [venue]);

  const offer = venue.offers[activeTab] ?? venue.offers[0];
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

  if (!offer) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
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
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.99 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 22 }}
            className="px-4 pt-2"
            layoutId={`card-${venue.id}`}
          >
            <div className="relative overflow-hidden rounded-[24px]">
              <AnimatePresence mode="wait" initial={false}>
                <motion.img
                  key={activeImg}
                  src={activeImg ?? venue.image}
                  alt={venue.name}
                  className="h-64 w-full object-cover"
                  initial={{ opacity: 0, scale: 1.02, filter: "blur(6px)" }}
                  animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                  exit={{ opacity: 0, scale: 0.995, filter: "blur(6px)" }}
                  transition={{ duration: 0.55, ease: [0.22, 0.61, 0.36, 1] }}
                />
              </AnimatePresence>
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/20 via-black/0 to-black/0" />
              <motion.div
                layoutId={`card-grad-${venue.id}`}
                className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/35 via-black/10 to-transparent"
              />
            </div>
          </motion.div>

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
          <div className="px-4 mt-2 text-[18px] font-semibold text-stone-900 tracking-tight">
            {venue.name}
          </div>

          <div className="px-4">
            <div className="mt-4 grid grid-cols-2 gap-3">
              <StatPill
                label="Response"
                value={responseHours == null ? "—" : fmtHours(responseHours)}
                sub="avg time"
                tone={responseTone}
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

              <StatPill
                label="Acceptance"
                value={acceptanceRate == null ? "—" : `${Math.round(acceptanceRate)}%`}
                sub="approved"
                tone={acceptanceTone}
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
            </div>
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
            <div className="flex items-center gap-2 text-sm text-stone-700">
              <MapPin className="h-4 w-4" />
              {venue.city}
            </div>

            <button className="inline-flex items-center gap-2 text-sm text-stone-700">
              <Instagram className="h-4 w-4" /> Visit
            </button>
          </div>

          <div className="mt-3">
            <div className="flex items-center justify-between">
              <h3 className="text-stone-900 font-semibold">About</h3>
              <button
                onClick={() => setBriefOpen((v) => !v)}
                className="text-sm text-stone-600 underline"
              >
                {briefOpen ? "Hide brief" : "Creator brief"}
              </button>
            </div>

            <p className="mt-1 text-[13px] leading-6 text-stone-700">{venue.brief}</p>

            <AnimatePresence initial={false}>
              {briefOpen && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-2 rounded-xl bg-white/70 backdrop-blur-md ring-1 ring-white/50 p-3 text-sm text-stone-700"
                >
                  Keep it tasteful and upbeat. Tag @venue and #clarisapp. Focus on ambience,
                  signature dishes, and your personality.
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.section>

        {/* Featured collabs strip */}
        <div className="mt-4 px-4">
          <FeaturedCollabsStrip
            collabs={demoFeaturedCollabs}
            onViewAll={() => console.log("View all featured collabs")}
          />
        </div>

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
        <div className="mx-4 mt-4 relative rounded-2xl p-1 bg-white/45 backdrop-blur-xl ring-1 ring-white/50 flex">
          {venue.offers.map((o, i) => (
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
              left: `calc(${(100 / venue.offers.length) * activeTab}% + 0.25rem)`,
              width: `calc(${100 / venue.offers.length}% - 0.5rem)`,
            }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          />
          <motion.div
            key={activeTab}
            className="pointer-events-none absolute bottom-0 h-0.5 rounded-full bg-gradient-to-r from-[#FF5A7A] to-[#FF3A6E]"
            style={{
              left: `calc(${(100 / venue.offers.length) * activeTab}% + 0.25rem)`,
              width: `calc(${100 / venue.offers.length}% - 0.5rem)`,
            }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
            layout
          />
        </div>

        {/* Offer card */}
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
                mission={offer.mission}
                isSelected={selectedOfferId === offer.id}
                onToggle={() =>
                  setSelectedOfferId((prev) => (prev === offer.id ? null : offer.id))
                }
                collabsLeft={3}
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
      </div>

      <DateTimeSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        offerId={selectedOfferId ?? offer.id}
        venueId={venue.id}
        timeframesByDow={weeklyTimeframes}
        onConfirm={(payload) => {
          const timeframeLabel = getTimeframeLabel(payload.timeframeId);
          setConfirmedSlot({ ...payload, timeframeLabel });

          const matchedOffer =
            venue.offers.find(currentOffer => currentOffer.id === payload.offerId) ?? offer;

          navigate("/booking/preview", {
            state: {
              date: payload.date,
              time: payload.timeLabel,
              meal: timeframeLabel,
              venueId: venue.id,
              venueName: venue.name,
              offerId: matchedOffer.id,
              offerTitle: matchedOffer.title,
            },
          });
        }}
      />
    </motion.div>
  );
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
  collabsLeft = 5,
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
        <span className="inline-flex items-center gap-1 rounded-full bg-[#FF5A7A]/8 px-2.5 py-1 text-[10px] font-medium text-[#FF5A7A]">
          {collabsLeft} left
        </span>
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
      <motion.div
        initial={false}
        animate={{ height: isSelected ? "auto" : 0, opacity: isSelected ? 1 : 0 }}
        className="overflow-hidden"
      >
        <p className="mt-4 text-[13px] leading-relaxed text-stone-500">{mission}</p>
      </motion.div>

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
