import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

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
    (typeof venue.area === "string" && (venue.area as string).trim());

  return rawLabel && rawLabel.length ? rawLabel : null;
}

export default function VenuesScreen() {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    fetch("https://xbut-eryu-hhsg.f2.xano.io/api:vGd6XDW3/getRestaurantNEW", {
      signal: controller.signal,
    })
      .then(async (res) => {
        if (!res.ok) throw new Error(`Unexpected response: ${res.status}`);
        const data = (await res.json()) as VenuesResponse | Venue[];
        const merged: Venue[] = Array.isArray(data)
          ? data
          : [
              ...(data.categoryfilter ?? []),
              ...(data.area ?? []),
              ...(data.filt ?? []),
            ];

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
        if (err.name !== "AbortError") {
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
        <div className="flex items-center justify-center py-20 text-sm text-[#E9ECEB]/60">
          Loading Venues…
        </div>
      );
    if (error)
      return (
        <div className="flex items-center justify-center py-20 text-sm text-[#E9ECEB]/60">
          {error}
        </div>
      );
    if (!venues.length)
      return (
        <div className="flex items-center justify-center py-20 text-sm text-[#E9ECEB]/60">
          No venues found.
        </div>
      );

    return (
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {venues.map((venue, i) => {
          const coverUrl = venue.Cover?.url ?? undefined;
          const badgeLabel = getBadgeLabel(venue);
          return (
            <Link
              key={venue.restaurant_turbo_id}
              to={`/memberspass/venues/${venue.restaurant_turbo_id}`}
              className="group relative block overflow-hidden rounded-[22px] border border-white/10 bg-[#111213]/50 shadow-[0_20px_40px_rgba(0,0,0,0.35)] transition-transform duration-300 ease-out hover:-translate-y-1"
            >
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{
                  backgroundImage: coverUrl ? `url(${coverUrl})` : FALLBACK_GRADIENT,
                }}
                aria-hidden="true"
              />
              <div
                className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent"
                aria-hidden="true"
              />

              <div className="relative flex h-[220px] flex-col justify-end p-6">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <span className="inline-flex max-w-max items-center rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-white/70 backdrop-blur-sm">
                    Featured Venue
                  </span>
                  {badgeLabel && (
                    <span className="inline-flex max-w-max items-center rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-white/70 backdrop-blur-sm">
                      {badgeLabel}
                    </span>
                  )}
                </div>
                <h2 className="text-[22px] font-light text-[#E9ECEB] drop-shadow-[0_4px_16px_rgba(0,0,0,0.65)]">
                  {venue.Name}
                </h2>
                <p className="mt-2 text-[13px] font-light text-white/70">#{i + 1} Venue</p>
              </div>
            </Link>
          );
        })}
      </div>
    );
  }, [error, venues, loading]);

  return (
    <div className="min-h-screen bg-[#0A0B0C] px-5 pb-24 pt-12 text-[#E9ECEB]">
      <div className="mx-auto w-full max-w-6xl">
        <div className="mb-10">
          <h1 className="text-center text-2xl font-light text-[#F4F5F3]">
            Dive into the guest experience
          </h1>
        </div>
        {content}
      </div>
    </div>
  );
}
