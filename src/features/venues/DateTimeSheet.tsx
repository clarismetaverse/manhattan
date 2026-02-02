import { useEffect, useMemo, useState, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, MapPin, Instagram, Info } from "lucide-react";
import DateTimeSheet from "./DateTimeSheet";
import { useNavigate } from "react-router-dom";

// --- Cartoonish Claris Icons (SVG) - Friendly & Instagram-native ---
const PlateIcon = () => (
  <span className="text-xl leading-none" role="img" aria-label="plates">
    🥗
  </span>
);

const DrinkIcon = () => (
  <span className="text-xl leading-none" role="img" aria-label="drinks">
    🍷
  </span>
);

const DessertIcon = () => (
  <span className="text-xl leading-none" role="img" aria-label="dessert">
    🍰
  </span>
);

const ChampagneIcon = () => (
  <span className="text-xl leading-none" role="img" aria-label="champagne">
    🥂
  </span>
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
  const [selectedOfferId, setSelectedOfferId] = u
