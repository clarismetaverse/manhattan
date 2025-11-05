import React, { useEffect, useMemo, useState } from "react";
import type { CSSProperties } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface PaletteVars extends CSSProperties {
  "--sand"?: string;
  "--sand-deep"?: string;
  "--sand-border"?: string;
  "--noir"?: string;
  "--ivory"?: string;
}

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
  const [showRequest, setShowRequest] = useState(false);
  const [showMembersPicker, setShowMembersPicker] = useState(false);
  const [touchStartY, setTouchStartY] = useState<number | null>(null);

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

  useEffect(() => {
    if (!showRequest && !showMembersPicker) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (showMembersPicker) {
          setShowMembersPicker(false);
          return;
        }

        if (showRequest) {
          setShowRequest(false);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showMembersPicker, showRequest]);

  // All hooks must be before any conditional returns
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

  const parsedMembersCount = useMemo(() => {
    if (!group) return 30;
    const membersCount = group.members_count?.trim();
    if (!membersCount) return 30;
    const match = membersCount.match(/\d+/);
    if (!match) return 30;
    const numeric = Number.parseInt(match[0], 10);
    return Number.isNaN(numeric) ? 30 : numeric;
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

  const paletteVars: PaletteVars = {
    "--sand": "#D9CDB8",
    "--sand-deep": "#CBB89C",
    "--sand-border": "#B8A68E",
    "--noir": "#0A0A0A",
    "--ivory": "#F4F3EF",
  };

  const handleTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    setTouchStartY(event.touches[0]?.clientY ?? null);
  };

  const handleTouchEnd = (event: React.TouchEvent<HTMLDivElement>) => {
    if (touchStartY == null) return;

    const endY = event.changedTouches[0]?.clientY ?? touchStartY;
    const delta = touchStartY - endY;
    const threshold = 48;

    if (!showRequest && delta > threshold) {
      setShowRequest(true);
    } else if (showRequest && delta < -threshold) {
      if (showMembersPicker) {
        setShowMembersPicker(false);
      } else {
        setShowRequest(false);
      }
    }

    setTouchStartY(null);
  };

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
          {group.members_count && (
            <p className="text-[14px] text-white/75">
              {group.members_count} Members
            </p>
          )}
        </div>
      </section>

      <main className="mx-auto flex w-full max-w-[760px] flex-col gap-10 px-6 py-12 pb-44">
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

      {showRequest && (
        <div
          className="fixed inset-0 z-30 backdrop-blur-xl bg-black/40 transition-opacity"
          onClick={() => setShowRequest(false)}
        />
      )}

      <div
        className={`fixed inset-x-0 bottom-0 z-40 transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]
          ${showRequest ? "h-[70vh]" : "h-[120px]"}
          bg-[color:var(--sand)] ${showRequest ? "bg-[color:var(--sand-deep)]" : ""}
          border-t border-[color:var(--sand-border)]/50
          rounded-t-[28px] shadow-[0_-12px_40px_rgba(0,0,0,0.35)]
          px-5 sm:px-6 ${showRequest ? "pt-6 pb-8" : "py-4"}`}
        style={paletteVars}
        onClick={() => {
          if (!showRequest) {
            setShowRequest(true);
          }
        }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {!showRequest ? (
          <div className="mx-auto flex h-full w-full max-w-[760px] items-center justify-between">
            <div>
              <div className="mb-2 flex -space-x-2">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div
                    key={index}
                    className="h-9 w-9 rounded-full border border-white/60 bg-white/30 backdrop-blur"
                    style={{
                      backgroundImage:
                        index === 0
                          ? "url(https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&auto=format&fit=crop)"
                          : index === 1
                          ? "url(https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&auto=format&fit=crop)"
                          : "url(https://images.unsplash.com/photo-1544723795-3fb6469f5b39?q=80&auto=format&fit=crop)",
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }}
                  />
                ))}
              </div>
              <p className="text-[15px] font-medium text-[#3B2F1C]">
                +{parsedMembersCount} members
              </p>
              <p className="text-[13px] text-[#3B2F1C]/80 italic">
                enabling guest invitation
              </p>
            </div>
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                setShowRequest(true);
              }}
              className="bg-[color:var(--noir)] text-[color:var(--ivory)] border border-white/80 rounded-full h-[44px] px-5 shadow-[0_0_12px_rgba(255,255,255,0.12)]"
            >
              Book Request
            </button>
          </div>
        ) : (
          <div
            className="mx-auto flex h-full w-full max-w-[760px] flex-col justify-start"
            onClick={(event) => event.stopPropagation()}
          >
            <header className="pb-4 text-center">
              <h3 className="text-[18px] font-light tracking-[-0.01em] text-[color:var(--noir)]">
                Request Guest Access
              </h3>
              <p className="mt-1 text-[13px] text-[color:var(--noir)]/70">
                +{parsedMembersCount} members enabling access
              </p>
            </header>

            <div className="flex-1 overflow-y-auto">
              <div className="mx-auto w-full max-w-[520px]">
                <div className="rounded-3xl border border-white/10 bg-white/[0.08] p-5 shadow-[0_30px_90px_rgba(0,0,0,0.45)] backdrop-blur-2xl">
                  <div className="space-y-3">
                    <button
                      type="button"
                      onClick={() => {
                        setShowRequest(false);
                        navigate("/general-request-sent", {
                          state: {
                            clubName: group.Name,
                            clubImage: group.cover?.url,
                            membersReviewing: parsedMembersCount,
                          },
                        });
                      }}
                      className="w-full border border-white/14 bg-white/[0.10] hover:bg-white/[0.14] rounded-2xl px-5 py-8 text-left transition"
                    >
                      <div className="flex items-center gap-3">
                        <svg width="28" height="28" viewBox="0 0 64 64" fill="none" className="shrink-0">
                          <circle cx="32" cy="42" r="6" fill="white" />
                          <path
                            d="M16 42c0-8.8 7.2-16 16-16s16 7.2 16 16"
                            stroke="white"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                          />
                          <path
                            d="M8 42c0-13.3 10.7-24 24-24s24 10.7 24 24"
                            stroke="white"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            opacity=".85"
                          />
                        </svg>
                        <div>
                          <div className="text-[15px] font-medium tracking-tight">General Request</div>
                          <div className="text-[13px] text-white/75">
                            any Member of the selected membersclub can vouch your access
                          </div>
                        </div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setShowMembersPicker(true);
                      }}
                      className="w-full border-2 [border-image:linear-gradient(135deg,#D9CBA3,#BFAF86)_1] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)] bg-white/[0.04] hover:bg-white/[0.08] rounded-2xl px-5 py-4 text-left transition"
                    >
                      <div className="flex items-center gap-3">
                        <svg width="26" height="26" viewBox="0 0 64 64" fill="none" className="shrink-0">
                          <defs>
                            <linearGradient id="dg-gold" x1="0" x2="1" y1="0" y2="1">
                              <stop offset="0%" stopColor="#D9CBA3" />
                              <stop offset="100%" stopColor="#BFAF86" />
                            </linearGradient>
                          </defs>
                          <circle cx="26" cy="32" r="12" stroke="url(#dg-gold)" strokeWidth="3" />
                          <circle cx="38" cy="32" r="12" stroke="url(#dg-gold)" strokeWidth="3" />
                        </svg>
                        <div>
                          <div className="text-[15px] font-medium tracking-tight text-[#D9CBA3]">Direct Guest (DG)</div>
                          <div className="text-[13px] text-white/75">Ask a specific member to be your host</div>
                        </div>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {showMembersPicker && (
        <Modal onClose={() => setShowMembersPicker(false)}>
          <div className="space-y-5 relative">
            <div className="absolute -top-8 right-0 rounded-full bg-white/10 px-3 py-1.5 text-xs backdrop-blur-sm border border-white/10">
              <span className="text-white/70">Requests left:</span> <span className="font-medium">3</span>
            </div>

            <header className="text-center">
              <h3 className="text-[18px] font-light tracking-[-0.01em]">Choose a Member</h3>
              <p className="mt-1 text-sm text-white/70">
                Send a Direct Guest request to a door member.
              </p>
            </header>

            <ul className="max-h-[46vh] space-y-3 overflow-y-auto pr-1">
              {["@danielv", "@michaelr", "@emilyp", "@celine", "@andrew", "@marco"].map((username, index) => (
                <li
                  key={username}
                  className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 text-white/90"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="h-12 w-12 shrink-0 overflow-hidden rounded-full border border-white/10"
                      style={{
                        backgroundImage:
                          index % 3 === 0
                            ? "url(https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&auto=format&fit=crop)"
                            : index % 3 === 1
                            ? "url(https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&auto=format&fit=crop)"
                            : "url(https://images.unsplash.com/photo-1544723795-3fb6469f5b39?q=80&auto=format&fit=crop)",
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                      }}
                    />
                    <div>
                      <p className="text-[15px] font-medium tracking-tight">{username}</p>
                      <p className="text-[13px] text-white/70">Guardian member</p>
                    </div>
                  </div>
                  <Button className="h-9 rounded-full border border-white/20 bg-white/10 px-4 text-xs uppercase tracking-[0.12em] text-white/90">
                    Request
                  </Button>
                </li>
              ))}
            </ul>
          </div>
        </Modal>
      )}
    </div>
  );
}

function Modal({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />
      <div className="relative z-10 max-w-full px-4">
        <div className="mx-auto w-full max-w-[520px] rounded-3xl border border-white/10 bg-white/[0.08] p-6 shadow-[0_30px_90px_rgba(0,0,0,0.55)] backdrop-blur-2xl">
          {children}
        </div>
      </div>
      <button
        aria-label="Close"
        onClick={onClose}
        className="absolute right-6 top-6 text-white/80 hover:text-white"
      >
        ×
      </button>
    </div>
  );
}
