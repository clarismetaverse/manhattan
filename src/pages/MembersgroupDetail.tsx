import React, { useEffect, useMemo, useState } from "react";
import type { CSSProperties } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface GroupDetail {
  id: number;
  Name: string;
  members_count: string;
  about_members: string;
  Category?: string | null;
  cover?: { url?: string | null } | null;
}

const FALLBACK_GRADIENT =
  "linear-gradient(140deg, rgba(12,14,16,0.95) 0%, rgba(24,28,32,0.88) 50%, rgba(8,9,10,0.95) 100%)";

export default function MembersgroupDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [group, setGroup] = useState<GroupDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setError("Group not found.");
      setLoading(false);
      return;
    }

    const controller = new AbortController();

    const loadGroup = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `https://xbut-eryu-hhsg.f2.xano.io/api:fXy8ZMiW/Memberdetail?id=${id}`,
          { signal: controller.signal }
        );

        if (!response.ok) {
          throw new Error(`Unexpected response: ${response.status}`);
        }

        const data = (await response.json()) as GroupDetail | null;

        if (!data || !data.id) {
          setGroup(null);
          setError("We couldn't find details for this group.");
          return;
        }

        setGroup(data);
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
        console.error("Error fetching group detail:", err);
        setError("Unable to load group details. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    void loadGroup();

    return () => controller.abort();
  }, [id]);

  const heroBackground = useMemo<CSSProperties>(() => {
    if (!group) {
      return { backgroundImage: FALLBACK_GRADIENT };
    }

    const coverUrl = group.cover?.url ?? undefined;
    return {
      backgroundImage: coverUrl ? `url(${coverUrl})` : FALLBACK_GRADIENT,
      backgroundSize: "cover",
      backgroundPosition: "center",
    };
  }, [group]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0A0B0C] text-[#E9ECEB]/80">
        Loading group details…
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-[#0A0B0C] px-6 text-center text-[#E9ECEB]/80">
        <p>{error}</p>
        <Button
          className="h-11 rounded-full border border-white/20 bg-white/10 text-white hover:bg-white/15"
          onClick={() => navigate("/memberspass/groups")}
        >
          Return Home
        </Button>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-[#0A0B0C] px-6 text-center text-[#E9ECEB]/80">
        <p>No data available.</p>
        <Button
          className="h-11 rounded-full border border-white/20 bg-white/10 text-white hover:bg-white/15"
          onClick={() => navigate("/memberspass/groups")}
        >
          Return Home
        </Button>
      </div>
    );
  }

  const membersCount = group.members_count?.trim();

  return (
    <div className="min-h-screen w-full bg-[#0A0B0C] text-[#E9ECEB] antialiased">
      <section
        className="relative h-[320px] w-full overflow-hidden rounded-b-[26px] sm:h-[420px]"
        style={heroBackground}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-transparent" aria-hidden="true" />
        <div className="absolute inset-0 backdrop-blur-[2px]" aria-hidden="true" />

        <div className="relative flex h-full flex-col justify-end gap-2 p-8">
          {group.Category && (
            <span className="inline-flex max-w-max items-center rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-white/70 backdrop-blur-sm">
              {group.Category}
            </span>
          )}
          <h1 className="text-[34px] font-light tracking-[-0.015em] drop-shadow-[0_8px_24px_rgba(0,0,0,0.8)]">
            {group.Name}
          </h1>
          {membersCount && (
            <p className="text-[14px] text-white/75">
              {membersCount} Members
            </p>
          )}
        </div>
      </section>

      <main className="mx-auto flex w-full max-w-[760px] flex-col gap-10 px-6 py-12">
        <section className="space-y-3">
          <h2 className="text-[12px] uppercase tracking-[0.16em] text-white/55">About Members</h2>
          <p className="text-[15px] font-light leading-relaxed text-white/85">
            {group.about_members}
          </p>
        </section>

        <section className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div className="rounded-[18px] border border-white/10 bg-white/5 p-5 shadow-[0_12px_30px_rgba(0,0,0,0.45)] backdrop-blur-md">
            <h3 className="mb-2 text-[11px] uppercase tracking-[0.14em] text-white/60">Guest Policy</h3>
            <p className="text-[14px] font-light text-white/80">By invitation only.</p>
          </div>
          <div className="rounded-[18px] border border-white/10 bg-white/5 p-5 shadow-[0_12px_30px_rgba(0,0,0,0.45)] backdrop-blur-md">
            <h3 className="mb-2 text-[11px] uppercase tracking-[0.14em] text-white/60">Dress Code</h3>
            <p className="text-[14px] font-light text-white/80">Smart casual elegance.</p>
          </div>
        </section>

        <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:justify-start">
          <Button className="h-12 flex-1 rounded-full border border-white/20 bg-white/10 text-white shadow-[0_18px_40px_rgba(0,0,0,0.45)] hover:bg-white/15 sm:flex-none sm:px-6">
            Request Guest Access
          </Button>
          <Button
            variant="outline"
            className="h-12 flex-1 rounded-full border border-white/25 bg-transparent text-white/80 hover:bg-white/10 sm:flex-none sm:px-6"
            onClick={() => navigate("/memberspass/groups")}
          >
            Return Home
          </Button>
        </div>
      </main>
    </div>
  );
}
