import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Instagram, Info, ChevronDown } from "lucide-react";

// --- Icons ---
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

type Service = {
  id: number;
  _actions_turbo?: ActionTurbo | null;
  [key: string]: unknown;
};

type ServiceOffer = {
  id: string;
  title: string;
  description: string;
  plates?: number;
  drinks?: number;
  dessert?: number;
  champagne?: number;
};

interface ExpandedVenueCardProps {
  venueId: number;
  onSelect: () => void;
}

const DETAIL_ENDPOINT =
  "https://xbut-eryu-hhsg.f2.xano.io/api:vGd6XDW3/get_restaurant_and_service_Upgrade";

export default function ExpandedVenueCard({ venueId, onSelect }: ExpandedVenueCardProps) {
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeImg, setActiveImg] = useState<string | undefined>(undefined);
  const [activeTab, setActiveTab] = useState(0);
  const [selectedOfferId, setSelectedOfferId] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);

    fetch(DETAIL_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ restaurant_id: venueId }),
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
  }, [venueId]);

  const offers = useMemo<ServiceOffer[]>(
    () =>
      services.map((service) => ({
        id: String(service.id),
        title: service._actions_turbo?.Action_Name ?? "",
        description: service._actions_turbo?.Descrizione ?? "",
        plates: service._actions_turbo?.Plates ?? undefined,
        drinks: service._actions_turbo?.Drinks ?? undefined,
      })),
    [services]
  );

  const galleryImages = useMemo(() => {
    const urls =
      restaurant?.GalleryRestaurant?.map((item) => item?.url).filter(Boolean) ?? [];
    const coverUrl = restaurant?.Cover?.url;
    if (coverUrl) urls.unshift(coverUrl);
    return Array.from(new Set(urls.filter(Boolean)));
  }, [restaurant]);

  useEffect(() => {
    setActiveImg(galleryImages[0]);
  }, [galleryImages]);

  if (loading) {
    return (
      <div className="rounded-[24px] bg-white/60 backdrop-blur-xl p-6 shadow-[0_12px_40px_rgba(0,0,0,0.08)]">
        <div className="animate-pulse space-y-4">
          <div className="h-48 bg-stone-200/50 rounded-[20px]" />
          <div className="h-4 bg-stone-200/50 rounded w-2/3" />
          <div className="h-3 bg-stone-200/50 rounded w-1/3" />
        </div>
      </div>
    );
  }

  if (error || !restaurant) {
    return (
      <div className="rounded-[24px] bg-white/60 backdrop-blur-xl p-6 shadow-[0_12px_40px_rgba(0,0,0,0.08)]">
        <p className="text-stone-500 text-sm">{error ?? "Unable to load venue."}</p>
      </div>
    );
  }

  const restaurantName = restaurant.Name ?? "";
  const restaurantCity =
    restaurant.City?.Name ?? (restaurant as { city?: string | null }).city ?? "";
  const restaurantBrief = restaurant.Brief ?? restaurant.Description ?? "";
  const hasOffers = offers.length > 0;
  const offer = hasOffers ? offers[activeTab] ?? offers[0] : null;

  return (
    <div
      className="rounded-[24px] overflow-hidden"
      style={{
        background:
          "radial-gradient(800px 400px at 50% -10%, #fffaf4 0%, #f7f1e6 40%, #e9dec9 75%, #e5d6c2 100%)",
      }}
    >
      {/* Cover image with thumbnails */}
      <div className="px-3 pt-3">
        <div className="relative overflow-hidden rounded-[20px]">
          <AnimatePresence mode="wait" initial={false}>
            <motion.img
              key={activeImg}
              src={activeImg ?? restaurant.Cover?.url ?? ""}
              alt={restaurantName}
              className="h-52 w-full object-cover"
              initial={{ opacity: 0, scale: 1.02, filter: "blur(6px)" }}
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, scale: 0.995, filter: "blur(6px)" }}
              transition={{ duration: 0.45, ease: [0.22, 0.61, 0.36, 1] }}
            />
          </AnimatePresence>
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/35 via-black/10 to-transparent" />
        </div>
      </div>

      {/* Thumbnails */}
      {galleryImages.length > 1 && (
        <div className="px-3 mt-2">
          <div className="flex gap-1.5 overflow-x-auto pb-1">
            {galleryImages.slice(0, 5).map((url, idx) => {
              const isActive = url === activeImg;
              return (
                <button
                  key={`${url}-${idx}`}
                  onClick={() => setActiveImg(url)}
                  className={`relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg ring-1 ring-white/60 transition-all ${
                    isActive
                      ? "ring-2 ring-[#FF5A7A] ring-offset-1 ring-offset-white shadow-md"
                      : "opacity-80 hover:opacity-100"
                  }`}
                >
                  <img src={url} alt="" className="h-full w-full object-cover" />
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Name + Location */}
      <div className="px-4 mt-3">
        <h3 className="text-xl font-semibold text-stone-900 tracking-tight">{restaurantName}</h3>
        {restaurantCity && (
          <div className="mt-1 flex items-center gap-1.5 text-sm text-stone-600">
            <MapPin className="h-4 w-4" />
            <span>{restaurantCity}</span>
          </div>
        )}
      </div>

      {/* About section */}
      {restaurantBrief && (
        <div className="mx-3 mt-3 rounded-xl bg-white/65 backdrop-blur-xl ring-1 ring-white/60 shadow-[0_4px_16px_rgba(0,0,0,.06)] p-3">
          <div className="flex items-center justify-between">
            <h4 className="text-stone-900 font-medium text-sm">About</h4>
            <button className="inline-flex items-center gap-1.5 text-xs text-stone-600">
              <Instagram className="h-3.5 w-3.5" /> Visit
            </button>
          </div>
          <p className="mt-1.5 text-xs leading-relaxed text-stone-600 line-clamp-3">
            {restaurantBrief}
          </p>
        </div>
      )}

      {/* Offer tabs */}
      {hasOffers && (
        <div className="mx-3 mt-3 relative rounded-xl p-1 bg-white/45 backdrop-blur-xl ring-1 ring-white/50 flex">
          {offers.slice(0, 3).map((o, i) => (
            <button
              key={o.id}
              onClick={() => setActiveTab(i)}
              className={`relative z-10 flex-1 py-1.5 text-xs font-medium transition-colors ${
                i === activeTab ? "text-[#FF5A7A]" : "text-stone-600"
              }`}
            >
              {o.title}
            </button>
          ))}
          <motion.div
            layout
            className="absolute top-1 bottom-1 rounded-lg bg-white shadow-sm"
            style={{
              left: `calc(${(100 / Math.min(offers.length, 3)) * activeTab}% + 0.25rem)`,
              width: `calc(${100 / Math.min(offers.length, 3)}% - 0.5rem)`,
            }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          />
        </div>
      )}

      {/* Compact offer card */}
      {offer && (
        <div className="mx-3 mt-3">
          <button
            onClick={() => setSelectedOfferId(prev => prev === offer.id ? null : offer.id)}
            className={`w-full text-left rounded-xl p-3 backdrop-blur-md border-2 transition-all ${
              selectedOfferId === offer.id
                ? "bg-white/90 border-[#FF5A7A] shadow-[0_6px_20px_rgba(255,90,122,0.1)]"
                : "bg-white/70 border-stone-200/60"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-medium text-stone-800 text-sm">{offer.title}</span>
              {selectedOfferId === offer.id && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#FF5A7A]/10 text-[#FF5A7A] font-medium">
                  Selected
                </span>
              )}
            </div>
            
            <div className="mt-2 flex items-center gap-3">
              {(offer.plates ?? 0) > 0 && (
                <div className="flex items-center gap-1">
                  <PlateIcon />
                  <span className="text-xs text-stone-600">{offer.plates}</span>
                </div>
              )}
              {(offer.drinks ?? 0) > 0 && (
                <div className="flex items-center gap-1">
                  <DrinkIcon />
                  <span className="text-xs text-stone-600">{offer.drinks}</span>
                </div>
              )}
            </div>

            <AnimatePresence initial={false}>
              {selectedOfferId === offer.id && offer.description && (
                <motion.p
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="mt-2 text-xs text-stone-500 leading-relaxed overflow-hidden"
                >
                  {offer.description}
                </motion.p>
              )}
            </AnimatePresence>
          </button>
        </div>
      )}

      {/* CTA Button */}
      <div className="px-3 py-3 mt-2">
        <button
          onClick={onSelect}
          className="w-full rounded-xl py-2.5 font-medium text-sm text-white shadow-[0_4px_16px_rgba(255,90,122,0.35)]"
          style={{
            background: "linear-gradient(135deg, #FF5A7A 0%, #FF3A6E 100%)",
          }}
        >
          Book Experience
        </button>
      </div>
    </div>
  );
}
