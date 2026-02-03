import { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, MapPin, Instagram, ChevronDown } from "lucide-react";
import DateTimeSheet from "./DateTimeSheet";

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

type Timeframe = {
  id: number;
  Name: string;
};

interface VenueDetailProps {
  venue: { id: number | string };
  onClose: () => void;
}

const DETAIL_ENDPOINT =
  "https://xbut-eryu-hhsg.f2.xano.io/api:vGd6XDW3/get_restaurant_and_service_Upgrade";

const TIMEFRAMES_ENDPOINT =
  "https://xbut-eryu-hhsg.f2.xano.io/api:vGd6XDW3/get_timeframes_turbo/Upgrade";

export default function VenueDetail({ venue, onClose }: VenueDetailProps) {
  const navigate = useNavigate();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeImg, setActiveImg] = useState<string | undefined>(undefined);
  const [activeTab, setActiveTab] = useState(0);
  const [selectedOfferId, setSelectedOfferId] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [timeframes, setTimeframes] = useState<Timeframe[]>([]);

  const restaurantId = venue.id;

  // Fetch restaurant and services
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);

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

  // Fetch timeframes for label mapping
  useEffect(() => {
    if (!restaurantId) return;

    fetch(TIMEFRAMES_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ restaurant_id: restaurantId }),
    })
      .then(async (res) => {
        if (!res.ok) return;
        const data = await res.json();
        if (Array.isArray(data)) {
          setTimeframes(data.map((tf: any) => ({ id: tf.id, Name: tf.Name })));
        }
      })
      .catch(() => {});
  }, [restaurantId]);

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

  const getTimeframeLabel = useCallback(
    (timeframeId: number): string => {
      const tf = timeframes.find((t) => t.id === timeframeId);
      return tf?.Name ?? "Meal";
    },
    [timeframes]
  );

  const restaurantName = restaurant?.Name ?? "";
  const restaurantCity =
    restaurant?.City?.Name ?? (restaurant as { city?: string | null })?.city ?? "";
  const restaurantBrief = restaurant?.Brief ?? restaurant?.Description ?? "";
  const hasOffers = offers.length > 0;
  const offer = hasOffers ? offers[activeTab] ?? offers[0] : null;

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      >
        <div className="bg-white rounded-3xl p-8 shadow-2xl">
          <div className="animate-pulse space-y-4">
            <div className="h-48 bg-stone-200 rounded-2xl w-72" />
            <div className="h-4 bg-stone-200 rounded w-2/3" />
            <div className="h-3 bg-stone-200 rounded w-1/3" />
          </div>
        </div>
      </motion.div>
    );
  }

  if (error || !restaurant) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      >
        <div className="bg-white rounded-3xl p-8 shadow-2xl text-center">
          <p className="text-stone-500">{error ?? "Unable to load venue."}</p>
          <button
            onClick={onClose}
            className="mt-4 px-4 py-2 rounded-lg bg-stone-100 text-stone-700 hover:bg-stone-200"
          >
            Close
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div className="min-h-full flex items-end sm:items-center justify-center p-4">
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-md rounded-t-3xl sm:rounded-3xl overflow-hidden bg-gradient-to-b from-white to-stone-50 shadow-2xl"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 p-2 rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Cover image */}
          <div className="relative h-56 overflow-hidden">
            <AnimatePresence mode="wait" initial={false}>
              <motion.img
                key={activeImg}
                src={activeImg ?? restaurant.Cover?.url ?? ""}
                alt={restaurantName}
                className="h-full w-full object-cover"
                initial={{ opacity: 0, scale: 1.02 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.4 }}
              />
            </AnimatePresence>
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent" />
          </div>

          {/* Thumbnails */}
          {galleryImages.length > 1 && (
            <div className="px-4 -mt-6 relative z-10">
              <div className="flex gap-2 overflow-x-auto pb-2">
                {galleryImages.slice(0, 5).map((url, idx) => (
                  <button
                    key={`${url}-${idx}`}
                    onClick={() => setActiveImg(url)}
                    className={`h-12 w-12 flex-shrink-0 overflow-hidden rounded-xl ring-2 transition-all ${
                      url === activeImg
                        ? "ring-[#FF5A7A] shadow-lg"
                        : "ring-white/60 opacity-80 hover:opacity-100"
                    }`}
                  >
                    <img src={url} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Content */}
          <div className="px-4 pt-4 pb-6 space-y-4">
            {/* Name & Location */}
            <div>
              <h2 className="text-2xl font-semibold text-stone-900">{restaurantName}</h2>
              {restaurantCity && (
                <div className="mt-1 flex items-center gap-1.5 text-sm text-stone-600">
                  <MapPin className="h-4 w-4" />
                  <span>{restaurantCity}</span>
                </div>
              )}
            </div>

            {/* About */}
            {restaurantBrief && (
              <div className="rounded-xl bg-stone-100/80 p-3">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="text-stone-800 font-medium text-sm">About</h4>
                  <button className="inline-flex items-center gap-1.5 text-xs text-stone-500 hover:text-stone-700">
                    <Instagram className="h-3.5 w-3.5" /> Visit
                  </button>
                </div>
                <p className="text-xs text-stone-600 leading-relaxed line-clamp-3">
                  {restaurantBrief}
                </p>
              </div>
            )}

            {/* Offer tabs */}
            {hasOffers && (
              <div className="relative rounded-xl p-1 bg-stone-100 flex">
                {offers.slice(0, 3).map((o, i) => (
                  <button
                    key={o.id}
                    onClick={() => {
                      setActiveTab(i);
                      setSelectedOfferId(o.id);
                    }}
                    className={`relative z-10 flex-1 py-2 text-xs font-medium transition-colors ${
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

            {/* Offer card */}
            {offer && (
              <div className="rounded-xl p-4 bg-white border-2 border-stone-200 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-stone-800">{offer.title}</span>
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
                {offer.description && (
                  <p className="mt-2 text-xs text-stone-500 leading-relaxed">
                    {offer.description}
                  </p>
                )}
              </div>
            )}

            {/* CTA */}
            <button
              onClick={() => {
                if (offer) {
                  setSelectedOfferId(offer.id);
                  setSheetOpen(true);
                }
              }}
              disabled={!offer}
              className="w-full py-3 rounded-xl font-medium text-white bg-gradient-to-r from-[#FF5A7A] to-[#FF3A6E] shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
            >
              Select Date & Time
            </button>
          </div>
        </motion.div>
      </div>

      {/* Date Time Sheet */}
      {offer && (
        <DateTimeSheet
          open={sheetOpen}
          onClose={() => setSheetOpen(false)}
          offerId={selectedOfferId ?? offer.id}
          venueId={restaurantId}
          onConfirm={(payload) => {
            const timeframeLabel = getTimeframeLabel(payload.timeframeId);

            const matchedOffer =
              offers.find((currentOffer) => currentOffer.id === payload.offerId) ?? offer;

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
