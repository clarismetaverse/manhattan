import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, MapPin, Instagram } from "lucide-react";
import DateTimeSheet, { Timeframe } from "./DateTimeSheet";
import type { Venue } from "./VenueTypes";
export default function VenueDetail({
  venue,
  onClose
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
  } | null>(null);
  const offer = venue.offers[activeTab] ?? venue.offers[0];
  const enabled = !!selectedOfferId;
  const activeConfirmed = confirmedSlot && confirmedSlot.offerId === selectedOfferId ? confirmedSlot : null;

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
  if (!offer) {
    return null;
  }
  return <motion.div initial={{
    opacity: 0
  }} animate={{
    opacity: 1
  }} exit={{
    opacity: 0
  }} className="fixed inset-0 z-50 overflow-y-auto" style={{
    background: "radial-gradient(1200px 600px at 70% -10%, #fffaf4 0%, #f7f1e6 40%, #e9dec9 75%, #e5d6c2 100%)"
  }}>
      <div className="mx-auto max-w-sm pb-28">
        {/* Hero morph */}
        <div className="relative">
          <motion.div layoutId={`card-${venue.id}`} className="relative overflow-hidden" style={{
          borderRadius: 24
        }} transition={{
          type: "spring",
          stiffness: 420,
          damping: 34
        }}>
            <img src={venue.image} alt={venue.name} className="h-64 w-full object-cover" style={{
            borderRadius: 24
          }} />
            <motion.div layoutId={`card-grad-${venue.id}`} className="absolute inset-0" style={{
            borderRadius: 24,
            background: "linear-gradient(to top, rgba(0,0,0,.40), rgba(0,0,0,.10), rgba(0,0,0,0))"
          }} />
            <h1 className="absolute bottom-5 left-4 right-4 text-3xl font-semibold text-white drop-shadow-[0_2px_6px_rgba(0,0,0,.5)]">
              {venue.name}
            </h1>
          </motion.div>

          {/* Back */}
          <button onClick={onClose} className="absolute left-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/80 backdrop-blur-md shadow ring-1 ring-white/70">
            <ArrowLeft className="h-5 w-5" />
          </button>
        </div>

        {/* About / Creator Brief */}
        <motion.section initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        duration: 0.35
      }} className="mx-4 -mt-4 rounded-2xl bg-white/65 backdrop-blur-xl ring-1 ring-white/60 shadow-[0_8px_24px_rgba(0,0,0,.08)] p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 text-sm text-stone-700">
                <MapPin className="h-4 w-4" />
                {venue.city}
              </div>
            </div>
            <button className="inline-flex items-center gap-2 text-sm text-stone-700">
              <Instagram className="h-4 w-4" /> Visit
            </button>
          </div>
          <div className="mt-3">
            <div className="flex items-center justify-between">
              <h3 className="text-stone-900 font-semibold">About</h3>
              <button onClick={() => setBriefOpen(v => !v)} className="text-sm text-stone-600 underline">
                {briefOpen ? "Hide brief" : "Creator brief"}
              </button>
            </div>
            <p className="mt-1 text-[13px] leading-6 text-stone-700">
              {venue.brief}
            </p>
            <AnimatePresence initial={false}>
              {briefOpen && <motion.div initial={{
              opacity: 0,
              height: 0
            }} animate={{
              opacity: 1,
              height: "auto"
            }} exit={{
              opacity: 0,
              height: 0
            }} className="mt-2 rounded-xl bg-white/70 backdrop-blur-md ring-1 ring-white/50 p-3 text-sm text-stone-700">
                  Keep it tasteful and upbeat. Tag @venue and #clarisapp. Focus on ambience, signature dishes, and your personality.
                </motion.div>}
            </AnimatePresence>
          </div>
        </motion.section>

        {/* Pinned offer while sheet is open */}
        <AnimatePresence>
          {sheetOpen && selectedOfferId === offer.id && (
            <motion.div
              layout
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="sticky top-2 z-40 mx-4 mt-3"
            >
              <OfferCard
                offerId={offer.id}
                title={offer.title}
                plates={offer.plates ?? 0}
                drinks={offer.drinks ?? 0}
                mission={offer.mission}
                isSelected
                onToggle={() => setSheetOpen(false)}
                pinned
                collabsLeft={3}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bridge CTA between About and Tabs */}
        <AnimatePresence initial={false}>
          {!selectedOfferId && <motion.div initial={{
          opacity: 0,
          y: 4
        }} animate={{
          opacity: 1,
          y: 0
        }} exit={{
          opacity: 0,
          y: -6
        }} transition={{
          duration: 0.3,
          delay: 0.15
        }} className="mx-4 mt-6 mb-2 flex items-baseline justify-between" aria-live="polite">
              <h3 className="text-[15px] font-semibold text-stone-900 tracking-tight">
                Select a collab option
              </h3>
              <span className="text-[12px] text-stone-500">
                Compare perks & requirements
              </span>
            </motion.div>}
        </AnimatePresence>

        {/* Tabs (glass segmented) */}
        <div className="mx-4 mt-4 relative rounded-2xl p-1 bg-white/45 backdrop-blur-xl ring-1 ring-white/50 flex">
          {venue.offers.map((o, i) => <button key={o.id} onClick={() => setActiveTab(i)} aria-pressed={i === activeTab} className={`relative z-10 flex-1 py-2 text-sm font-medium transition-colors ${i === activeTab ? "text-[#FF5A7A]" : "text-stone-700"}`}>
              {o.title}
            </button>)}
          <motion.div layout className="absolute top-1 bottom-1 rounded-xl bg-white shadow-[0_1px_8px_rgba(0,0,0,.06)]" style={{
          left: `calc(${100 / venue.offers.length * activeTab}% + 0.25rem)`,
          width: `calc(${100 / venue.offers.length}% - 0.5rem)`
        }} transition={{
          type: "spring",
          stiffness: 500,
          damping: 30
        }} />
          <motion.div key={activeTab} className="pointer-events-none absolute bottom-0 h-0.5 rounded-full bg-gradient-to-r from-[#FF5A7A] to-[#FF3A6E]" style={{
          left: `calc(${100 / venue.offers.length * activeTab}% + 0.25rem)`,
          width: `calc(${100 / venue.offers.length}% - 0.5rem)`
        }} transition={{
          type: "spring",
          stiffness: 500,
          damping: 30
        }} layout />
        </div>

        {/* Offer card (selectable) */}
        <AnimatePresence mode="wait">
          {!sheetOpen && (
            <motion.section key={offer.id} initial={{
            opacity: 0,
            y: 14
          }} animate={{
            opacity: 1,
            y: 0
          }} exit={{
            opacity: 0,
            y: -10
          }} transition={{
            duration: 0.25
          }} className="mx-4 mt-4">
              <OfferCard offerId={offer.id} title={offer.title} plates={offer.plates ?? 0} drinks={offer.drinks ?? 0} mission={offer.mission} isSelected={selectedOfferId === offer.id} onToggle={() => setSelectedOfferId(prev => prev === offer.id ? null : offer.id)} collabsLeft={3} />
            </motion.section>
          )}
        </AnimatePresence>

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
            <motion.button whileTap={{
            scale: 0.98
          }} animate={enabled ? {
            opacity: 1,
            scale: 1,
            boxShadow: "0 4px 12px rgba(255,90,122,0.25), 0 2px 4px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.8)",
            background: "linear-gradient(135deg, #fefefe 0%, #f5f5f5 100%)",
            color: "#FF5A7A",
            borderColor: "#FF5A7A"
          } : {
            opacity: 0.6,
            scale: 1,
            background: "linear-gradient(to right, #FF5A7A, #FF3A6E)",
            color: "#ffffff",
            borderColor: "transparent",
            boxShadow: "0 2px 8px rgba(0,0,0,0.15)"
          }} disabled={!enabled} aria-disabled={!enabled} className="w-full rounded-[15px] px-4 py-2 font-medium border-[3px] disabled:cursor-not-allowed transition-all" onClick={() => enabled && setSheetOpen(true)}>
              {activeConfirmed?.timeLabel ? `Confirm ${activeConfirmed.timeLabel}` : "Select date & time"}
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
        onConfirm={payload => {
          setConfirmedSlot(payload);
        }}
      />
    </motion.div>;
}

/* Subcomponent: OfferCard */
function OfferCard({
  title,
  plates,
  drinks,
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
  mission: string;
  isSelected: boolean;
  onToggle: () => void;
  offerId: string;
  pinned?: boolean;
  collabsLeft?: number;
}) {
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
              boxShadow: "0 8px 24px rgba(255,90,122,0.15), 0 4px 12px rgba(224,201,163,0.3), inset 0 1px 0 rgba(255,255,255,0.8)",
              backgroundColor: "rgba(255,255,255,0.85)",
              borderColor: "#FF5A7A",
            }
          : {
              boxShadow: "0 4px 16px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.6)",
              backgroundColor: "rgba(255,255,255,0.65)",
              borderColor: "#E3D3BB",
            }
      }
      transition={{ duration: 0.35, ease: "easeOut" }}
      className={`relative w-full text-left border-2 backdrop-blur-md ${
        pinned ? "rounded-xl px-3 py-3" : "rounded-3xl px-5 py-5"
      }`}
    >
      {pinned ? (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="text-sm font-semibold text-stone-900">{title}</div>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-stone-100 text-stone-600 border border-stone-200">
              by venue approval
            </span>
          </div>
          <div className="text-[11px] text-stone-600">
            {plates} plates · {drinks} drinks
          </div>
        </div>
      ) : (
        <>
          <div className="absolute right-3 top-3 flex items-center gap-2">
            {isSelected && (
              <span className="inline-flex items-center gap-1 rounded-full bg-white/85 px-2 py-1 text-[11px] text-stone-700 ring-1 ring-white/60">
                Selected
              </span>
            )}
            <span className="inline-flex items-center gap-1 rounded-full bg-[#FF5A7A]/10 px-2 py-1 text-[11px] font-medium text-[#FF5A7A]">
              {collabsLeft} left
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-xl font-semibold text-stone-900">{title}</div>
            <span className="text-[10px] px-2 py-0.5 rounded-md bg-stone-100 text-stone-600 border border-stone-200">
              by venue approval
            </span>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-4 text-stone-700">
            <div>
              <div className="text-xs tracking-wide">PLATES</div>
              <div className="text-2xl font-semibold">{plates}</div>
            </div>
            <div>
              <div className="text-xs tracking-wide">DRINKS</div>
              <div className="text-2xl font-semibold">{drinks}</div>
            </div>
          </div>
          <motion.div
            initial={false}
            animate={{ height: isSelected ? "auto" : 0, opacity: isSelected ? 1 : 0 }}
            className="overflow-hidden"
          >
            <p className="mt-4 text-sm text-stone-600">{mission}</p>
          </motion.div>
          <div className="mt-3 text-right">
            <span className="text-sm underline text-stone-700">Content Instructions</span>
          </div>
        </>
      )}
    </motion.button>
  );
}