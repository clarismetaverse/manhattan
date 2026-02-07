import React, { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Calendar, Clock, Instagram, MapPin } from "lucide-react";

type BookingStatus = "CONFIRMED" | "PENDING" | "CANCELLED" | null;

interface RestaurantTurbo {
  id: number;
  Name: string;
  Instagram?: string;
  Maps_Link?: string;
  Adress?: string;
  Cover?: { url?: string } | null;
  Cover2?: { url?: string } | null;
  GalleryRestaurant?: Array<{ url?: string }> | null;
  Tags?: string;
  Tag2?: string;
}

interface ActionRecord {
  id: number;
  Action_Name?: string;
  Social?: string;
  Descrizione?: string;
  Action_icon?: { url?: string } | null;
  Coupons_Services?: Array<{ service_icon?: { url?: string } }>;
}

interface Timeslot {
  id: number;
  Active: boolean;
  Start_time: number;
  End_time: number;
}

interface SlotLimit {
  Type: string;
  Limit: number;
}

interface Booking {
  id: number;
  created_at: number;
  weekdaysturbo_id: number;
  Booking_id_fk: number;
  date: string | null;
  status: BookingStatus;
  offer_upgrade_id: number;
  timestamp: number;
  restaurant_turbo_id: number;
  actions_turbo_id: number;
  user_turbo_id: number;
  SlotLimit?: SlotLimit | null;
  _restaurant_turbo?: RestaurantTurbo | null;
  timeslot_id?: Array<Timeslot | null> | null;
  _actions_record_01?: ActionRecord | null;
}

const API_URL = "https://xbut-eryu-hhsg.f2.xano.io/api:bwh6Xc5O/Bookings";
const WEEKDAYS = ["", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const minutesToHHMM = (mins?: number | null) => {
  if (mins === null || mins === undefined || Number.isNaN(mins)) {
    return null;
  }
  const hours = Math.floor(mins / 60);
  const minutes = mins % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
};

const formatDate = (dateStr?: string | null) => {
  if (!dateStr) return null;
  const parsed = new Date(`${dateStr}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" });
};

const getHeroUrl = (booking: Booking) => {
  const restaurant = booking._restaurant_turbo;
  return (
    restaurant?.Cover?.url ||
    restaurant?.Cover2?.url ||
    restaurant?.GalleryRestaurant?.[0]?.url ||
    null
  );
};

const statusTone = (status: BookingStatus) => {
  switch (status) {
    case "CONFIRMED":
      return "bg-emerald-100/70 text-emerald-900 ring-1 ring-emerald-200/80";
    case "CANCELLED":
      return "bg-rose-100/70 text-rose-900 ring-1 ring-rose-200/80";
    default:
      return "bg-amber-100/70 text-amber-900 ring-1 ring-amber-200/80";
  }
};

const getSortTime = (booking: Booking) => {
  if (booking.date) {
    const dateValue = new Date(`${booking.date}T00:00:00`);
    if (!Number.isNaN(dateValue.getTime())) {
      return dateValue.getTime();
    }
  }
  if (booking.timestamp && booking.timestamp > 0) {
    return booking.timestamp;
  }
  return null;
};

const getDisplayTime = (booking: Booking) => {
  const timeslot = booking.timeslot_id?.find((slot) => slot && slot.Active) ?? booking.timeslot_id?.find(Boolean);
  if (timeslot?.Start_time !== undefined && timeslot?.End_time !== undefined) {
    const start = minutesToHHMM(timeslot.Start_time);
    const end = minutesToHHMM(timeslot.End_time);
    if (start && end) {
      return `${start} - ${end}`;
    }
  }
  if (booking.timestamp && booking.timestamp > 0) {
    return new Date(booking.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }
  return "Time TBD";
};

const getStatusLabel = (status: BookingStatus) => status ?? "PENDING";

const getCollaborationTitle = (booking: Booking) =>
  booking._actions_record_01?.Action_Name || booking._actions_record_01?.Social || "Collaboration";

export default function TicketListV2() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(API_URL, { signal: controller.signal });
        if (!response.ok) {
          throw new Error("Unable to load bookings.");
        }
        const data = (await response.json()) as Booking[];
        setBookings(Array.isArray(data) ? data : []);
      } catch (err) {
        if (!controller.signal.aborted) {
          setError(err instanceof Error ? err.message : "Something went wrong.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    void load();

    return () => {
      controller.abort();
    };
  }, []);

  const grouped = useMemo(() => {
    const now = Date.now();
    const sorted = [...bookings].sort((a, b) => {
      const priority = (status: BookingStatus) => {
        if (status === "CONFIRMED") return 0;
        if (status === "PENDING" || status === null) return 1;
        return 2;
      };
      const statusDiff = priority(a.status) - priority(b.status);
      if (statusDiff !== 0) return statusDiff;
      const aTime = getSortTime(a);
      const bTime = getSortTime(b);
      if (aTime === null && bTime === null) return 0;
      if (aTime === null) return 1;
      if (bTime === null) return -1;
      return aTime - bTime;
    });

    const upcoming: Booking[] = [];
    const past: Booking[] = [];
    const cancelled: Booking[] = [];

    sorted.forEach((booking) => {
      if (booking.status === "CANCELLED") {
        cancelled.push(booking);
        return;
      }
      const time = getSortTime(booking);
      if (time !== null && time >= now) {
        upcoming.push(booking);
      } else {
        past.push(booking);
      }
    });

    return { upcoming, past, cancelled };
  }, [bookings]);

  return (
    <div className="min-h-screen bg-[#EEE6D8] px-3 py-4 text-stone-900 font-[SF Pro Display,Inter,sans-serif]">
      <div className="mx-auto flex max-w-sm flex-col gap-5">
        <div className="space-y-1">
          <h1 className="font-serif text-2xl text-black/90">My Bookings</h1>
          <p className="text-sm text-black/50">Your upcoming and past collaborations.</p>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[0, 1, 2].map((key) => (
              <div
                key={key}
                className="h-40 animate-pulse rounded-3xl border border-black/5 bg-white/60 shadow-[0_12px_40px_rgba(0,0,0,0.06)]"
              />
            ))}
          </div>
        ) : error ? (
          <div className="rounded-3xl border border-rose-200/70 bg-rose-50/80 p-4 text-sm text-rose-700 shadow-sm">
            {error} Please try again soon.
          </div>
        ) : bookings.length === 0 ? (
          <div className="rounded-3xl border border-black/10 bg-white/70 p-6 text-center text-sm text-black/60 shadow-sm">
            No bookings yet. Your tickets will appear here once confirmed.
          </div>
        ) : (
          <div className="space-y-6">
            {grouped.upcoming.length > 0 && (
              <section className="space-y-3">
                <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-black/45">Upcoming</h2>
                <div className="grid gap-4">
                  <AnimatePresence>
                    {grouped.upcoming.map((booking) => (
                      <TicketCardV2 key={booking.id} booking={booking} />
                    ))}
                  </AnimatePresence>
                </div>
              </section>
            )}
            {grouped.past.length > 0 && (
              <section className="space-y-3">
                <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-black/45">Past</h2>
                <div className="grid gap-4">
                  <AnimatePresence>
                    {grouped.past.map((booking) => (
                      <TicketCardV2 key={booking.id} booking={booking} />
                    ))}
                  </AnimatePresence>
                </div>
              </section>
            )}
            {grouped.cancelled.length > 0 && (
              <section className="space-y-3">
                <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-black/45">Cancelled</h2>
                <div className="grid gap-4">
                  <AnimatePresence>
                    {grouped.cancelled.map((booking) => (
                      <TicketCardV2 key={booking.id} booking={booking} />
                    ))}
                  </AnimatePresence>
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function TicketCardV2({ booking }: { booking: Booking }) {
  const heroUrl = getHeroUrl(booking);
  const dateLabel = formatDate(booking.date);
  const timeLabel = getDisplayTime(booking);
  const weekday =
    !booking.date && booking.weekdaysturbo_id > 0 ? WEEKDAYS[booking.weekdaysturbo_id] : null;
  const subtitle = [dateLabel || weekday || "Date TBD", timeLabel].filter(Boolean).join(" • ");
  const statusLabel = getStatusLabel(booking.status);
  const restaurant = booking._restaurant_turbo;
  const slotLimit =
    booking.SlotLimit && booking.SlotLimit.Type && booking.SlotLimit.Limit > 0
      ? `Limit: ${booking.SlotLimit.Limit} ${booking.SlotLimit.Type}`
      : null;

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 12 }}
      transition={{ duration: 0.25 }}
      className="relative overflow-hidden rounded-3xl border border-black/5 bg-white/70 shadow-[0_12px_40px_rgba(0,0,0,0.06)] backdrop-blur-md"
    >
      <div className="flex flex-col">
        <div className="relative h-32 w-full overflow-hidden">
          {heroUrl ? (
            <img src={heroUrl} alt={restaurant?.Name || "Venue"} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-stone-200/70 text-xs uppercase tracking-[0.3em] text-stone-500">
              Venue
            </div>
          )}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
          <span
            className={`absolute right-4 top-4 inline-flex items-center rounded-full px-3 py-1 text-[10px] font-semibold tracking-[0.2em] ${statusTone(
              booking.status,
            )}`}
          >
            {statusLabel}
          </span>
        </div>

        <div className="space-y-4 p-4">
          <div className="space-y-1">
            <h3 className="font-serif text-xl leading-tight text-black/90">
              {restaurant?.Name || "Venue"}
            </h3>
            <p className="text-sm text-black/55">{subtitle}</p>
          </div>

          <div className="space-y-1 text-sm text-black/70">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-black/50" />
              <span>{getCollaborationTitle(booking)}</span>
            </div>
            {slotLimit && (
              <div className="flex items-center gap-2 text-xs text-black/50">
                <Clock className="h-4 w-4" />
                <span>{slotLimit}</span>
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {restaurant?.Instagram && (
              <a
                href={restaurant.Instagram}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-[#FF5A7A]/10 px-3 py-1.5 text-xs font-medium text-[#FF5A7A] ring-1 ring-[#FF5A7A]/30 transition hover:bg-[#FF5A7A]/20"
              >
                <Instagram className="h-4 w-4" />
                Instagram
              </a>
            )}
            {restaurant?.Maps_Link && (
              <a
                href={restaurant.Maps_Link}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1.5 text-xs font-medium text-black/70 ring-1 ring-black/10 transition hover:bg-white"
              >
                <MapPin className="h-4 w-4" />
                Map
              </a>
            )}
          </div>
        </div>
      </div>
    </motion.article>
  );
}
