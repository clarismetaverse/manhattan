import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

interface ImageLike { url?: string }
interface City { CityName?: string }
interface RestaurantTurbo {
  Name?: string;
  Adress?: string;
  Cover?: ImageLike;
  _cities?: City;
}
interface TimeframeTurbo { Name?: string }
interface OfferTurbo {
  Offer_Name?: string;
  Story?: boolean; Reel?: boolean; Tiktok?: boolean;
  Offer_Cover?: ImageLike;
}
interface ActionTurbo { Action_Name?: string; Action_icon?: ImageLike }
interface Booking {
  id: number;
  BookingDay?: string;
  HourStart?: string | number;
  MinuteStart?: string | number;
  HourEnd?: string | number;
  MinuteEnd?: string | number;
  coupon_status?: string;
  ApprovalStatus?: boolean;
  _restaurant_turbo?: RestaurantTurbo;
  _timeframes_turbo?: TimeframeTurbo;
  _offers_turbo?: OfferTurbo;
  _actions_turbo?: ActionTurbo;
}

const FALLBACK_GRADIENT =
  "radial-gradient(circle at 20% 20%, rgba(255,255,255,0.12) 0%, rgba(10,11,12,0.92) 55%, rgba(10,11,12,1) 100%)";

export default function BookingsScreen() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    (async () => {
      try {
        const res = await fetch(
          "https://xbut-eryu-hhsg.f2.xano.io/api:vGd6XDW3/get_bookings/Upgrade",
          { signal: controller.signal }
        );
        if (!res.ok) throw new Error(`Unexpected response: ${res.status}`);
        const data = (await res.json()) as Booking[];
        setBookings((Array.isArray(data) ? data : []).filter(b => !!b?.id));
      } catch (e: any) {
        if (e?.name !== "AbortError") {
          console.error(e);
          setError("Unable to load bookings. Please try again later.");
        }
      } finally {
        setLoading(false);
      }
    })();
    return () => controller.abort();
  }, []);

  // ---- helpers
  function pad2(n?: string | number) {
    const num = Number(n ?? 0);
    if (!Number.isFinite(num) || num < 0) return "00";
    return num < 10 ? `0${num}` : `${num}`;
  }
  function toDate(iso?: string) {
    if (!iso) return null;
    const [y, m, d] = iso.split("-").map(Number);
    if (!y || !m || !d) return null;
    const dt = new Date(y, m - 1, d);
    return Number.isNaN(dt.getTime()) ? null : dt;
  }
  function fmtDate(iso?: string) {
    const dt = toDate(iso);
    if (!dt) return "";
    return dt.toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" });
  }
  function endMinutes(b: Booking) {
    const d = toDate(b.BookingDay);
    if (!d) return 0;
    const hs = Number(b.HourStart ?? 0);
    const ms = Number(b.MinuteStart ?? 0);
    const he = Number(b.HourEnd ?? 0);
    const me = Number(b.MinuteEnd ?? 0);
    if ([hs, ms, he, me].some((n) => Number.isNaN(n))) return d.getTime();
    const startHM = hs * 60 + ms;
    const endHM = he * 60 + me;
    const dayOffset = endHM < startHM ? 24 * 60 : 0;
    return d.getTime() + (endHM + dayOffset) * 60_000;
  }

  const sorted = useMemo(() => {
    return [...bookings].sort((a, b) => {
      const ad = toDate(a.BookingDay)?.getTime() ?? 0;
      const bd = toDate(b.BookingDay)?.getTime() ?? 0;
      if (ad !== bd) return bd - ad;
      return endMinutes(b) - endMinutes(a);
    });
  }, [bookings]);

  const content = useMemo(() => {
    if (loading) return (
      <div className="flex items-center justify-center py-20 text-sm text-[#E9ECEB]/60">Loading Bookings…</div>
    );
    if (error) return (
      <div className="flex items-center justify-center py-20 text-sm text-[#E9ECEB]/60">{error}</div>
    );
    if (!sorted.length) return (
      <div className="flex items-center justify-center py-20 text-sm text-[#E9ECEB]/60">No bookings found.</div>
    );

    return (
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {sorted.map((b) => {
          const venueName = b._timeframes_turbo?.Name || b._restaurant_turbo?.Name || "—";
          const city = b._restaurant_turbo?._cities?.CityName;
          const dateLabel = fmtDate(b.BookingDay);
          const timeLabel = `${pad2(b.HourStart)}:${pad2(b.MinuteStart)}–${pad2(b.HourEnd)}:${pad2(b.MinuteEnd)}`;
          const offer = b._offers_turbo?.Offer_Name;
          const hasStory = !!b._offers_turbo?.Story;
          const hasReel = !!b._offers_turbo?.Reel;
          const hasTiktok = !!b._offers_turbo?.Tiktok;
          const bgUrl = b._restaurant_turbo?.Cover?.url || b._offers_turbo?.Offer_Cover?.url;
          const status = (b.coupon_status || "").toLowerCase();
          const approved = !!b.ApprovalStatus;

          const statusClasses =
            status === "pending" ? "border-yellow-300/30 bg-yellow-300/10 text-yellow-200"
            : status === "showed" ? "border-emerald-300/30 bg-emerald-300/10 text-emerald-200"
            : "border-white/15 bg-white/10 text-white/70";

          return (
            <Link
              key={b.id}
              to={`/memberspass/booking/${b.id}`}
              className="group relative block overflow-hidden rounded-[22px] border border-white/10 bg-[#111213]/50 shadow-[0_20px_40px_rgba(0,0,0,0.35)] transition-transform duration-300 ease-out hover:-translate-y-1"
            >
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: bgUrl ? `url(${bgUrl})` : FALLBACK_GRADIENT }}
                aria-hidden="true"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" aria-hidden="true" />

              <div className="relative flex h-[240px] flex-col justify-end p-6">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  {city && <span className="inline-flex items-center rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-white/70 backdrop-blur-sm">{city}</span>}
                  {offer && <span className="inline-flex items-center rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] text-white/80 backdrop-blur-sm">{offer}</span>}
                  <span className={`inline-flex items-center rounded-full border px-3 py-1 text-[11px] backdrop-blur-sm ${statusClasses}`}>{status || "n/a"}</span>
                  {approved && <span className="inline-flex items-center rounded-full border border-emerald-300/25 bg-emerald-300/10 px-3 py-1 text-[11px] text-emerald-200 backdrop-blur-sm">Approved</span>}
                </div>
                <h2 className="text-[22px] font-light text-[#E9ECEB] drop-shadow-[0_4px_16px_rgba(0,0,0,0.65)]">{venueName}</h2>
                <p className="mt-1 text-[13px] font-light text-white/80">{dateLabel} • {timeLabel}</p>
                <div className="mt-2 flex items-center gap-2 text-[11px] text-white/70">
                  {hasStory && <span className="rounded border border-white/15 bg-white/10 px-2 py-0.5 backdrop-blur-sm">Story</span>}
                  {hasReel && <span className="rounded border border-white/15 bg-white/10 px-2 py-0.5 backdrop-blur-sm">Reel</span>}
                  {hasTiktok && <span className="rounded border border-white/15 bg-white/10 px-2 py-0.5 backdrop-blur-sm">TikTok</span>}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    );
  }, [loading, error, sorted]);

  return (
    <div className="min-h-screen bg-[#0A0B0C] px-5 pb-24 pt-12 text-[#E9ECEB]">
      <div className="mx-auto w-full max-w-6xl">
        <div className="mb-10">
          <h1 className="text-center text-2xl font-light text-[#F4F5F3]">Dive into the guest experience</h1>
        </div>
        {content}
      </div>
    </div>
  );
}
