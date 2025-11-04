import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

interface MembersGroup {
  id: number;
  Name: string;
  members_count: string;
  about_members?: string;
  cover?: { url?: string | null } | null;
}

const FALLBACK_GRADIENT =
  "radial-gradient(circle at 20% 20%, rgba(255,255,255,0.12) 0%, rgba(10,11,12,0.92) 55%, rgba(10,11,12,1) 100%)";

export default function MembersgroupsHomepage() {
  const [groups, setGroups] = useState<MembersGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    fetch(
      "https://xbut-eryu-hhsg.f2.xano.io/api:fXy8ZMiW/Membersgroupshomepage",
      { signal: controller.signal }
    )
      .then(async (res) => {
        if (!res.ok) {
          throw new Error(`Unexpected response: ${res.status}`);
        }
        const data = (await res.json()) as MembersGroup[];
        const sorted = data
          .filter((group) => Boolean(group?.id))
          .sort(
            (a, b) => Number(b.members_count ?? 0) - Number(a.members_count ?? 0)
          );
        setGroups(sorted);
      })
      .catch((err) => {
        if (err.name !== "AbortError") {
          console.error("Error fetching groups:", err);
          setError("Unable to load members groups. Please try again later.");
        }
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, []);

  const content = useMemo(() => {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-20 text-sm text-[#E9ECEB]/60">
          Loading Members Groups…
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex items-center justify-center py-20 text-sm text-[#E9ECEB]/60">
          {error}
        </div>
      );
    }

    if (!groups.length) {
      return (
        <div className="flex items-center justify-center py-20 text-sm text-[#E9ECEB]/60">
          No members groups found.
        </div>
      );
    }

    return (
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {groups.map((group) => {
          const membersCount = Number(group.members_count ?? 0);
          const coverUrl = group.cover?.url ?? undefined;

          return (
            <Link
              key={group.id}
              to={`/memberspass/${group.id}`}
              className="group relative block overflow-hidden rounded-[22px] border border-white/10 bg-[#111213]/50 shadow-[0_20px_40px_rgba(0,0,0,0.35)] transition-transform duration-300 ease-out hover:-translate-y-1"
            >
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{
                  backgroundImage: coverUrl ? `url(${coverUrl})` : FALLBACK_GRADIENT,
                }}
                aria-hidden="true"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" aria-hidden="true" />

              <div className="relative flex h-[220px] flex-col justify-end p-6">
                <span className="mb-2 inline-flex max-w-max items-center rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-white/70 backdrop-blur-sm">
                  Members Groups in Dubai
                </span>
                <h2 className="text-[22px] font-light text-[#E9ECEB] drop-shadow-[0_4px_16px_rgba(0,0,0,0.65)]">
                  {group.Name}
                </h2>
                <p className="mt-2 text-[13px] font-light text-white/70">
                  {membersCount}/120 Members
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    );
  }, [error, groups, loading]);

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
