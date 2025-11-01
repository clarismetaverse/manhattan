import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

/**
 * Memberspass — General Request Sent (Cinematic, Share‑worthy)
 * - Fullscreen blurred club background
 * - Central DG black circle with user avatar intersecting
 * - Copy: request sent + members reviewing
 * - Overlapping member avatars (generic)
 * - Frosted Return Home button
 *
 * Props are optional; sensible defaults provided for quick drop‑in.
 */

export interface GeneralRequestSentProps {
  clubName?: string;
  clubImage?: string;
  userAvatar?: string;
  membersReviewing?: number; // e.g., 35
}

export default function GeneralRequestSent({
  clubName = "Cipriani Milano",
  clubImage =
    "https://images.unsplash.com/photo-1579551055097-5f8b0b6b1d4f?q=80&w=2000&auto=format&fit=crop",
  userAvatar =
    "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=800&auto=format&fit=crop",
  membersReviewing = 35,
}: GeneralRequestSentProps) {
  const navigate = useNavigate();

  const ghostFaces = [
    "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1552374196-c4e7ffc6e126?q=80&w=200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1527980965255-d3b416303d12?q=80&w=200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1502767089025-6572583495b0?q=80&w=200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?q=80&w=200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=200&auto=format&fit=crop",
  ];

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-black text-[#F2F1EF]">
      {/* BACKDROP — cinematic blur + grade */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${clubImage})` }}
      />
      <div className="absolute inset-0 bg-[rgba(6,7,8,0.55)]" />
      <div className="absolute inset-0 backdrop-blur-[8px]" />
      {/* top lens reflection */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-52 bg-[radial-gradient(600px_140px_at_50%_0%,rgba(255,255,255,0.12),rgba(255,255,255,0)_70%)]" />
      {/* bottom vignette for readability */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

      {/* CONTENT */}
      <main className="relative z-10 mx-auto flex min-h-screen max-w-[760px] flex-col items-center px-5 pt-20 pb-28">
        {/* DG circle + avatar */}
        <div className="relative mb-8 flex h-[180px] w-[180px] items-center justify-center">
          {/* DG black disc */}
          <div className="absolute inset-0 rounded-full bg-[#0B0C0D] shadow-[inset_0_10px_30px_rgba(0,0,0,0.65)] ring-1 ring-white/5" />
          {/* subtle rim reflection */}
          <div className="absolute inset-0 rounded-full bg-[radial-gradient(80%_80%_at_50%_0%,rgba(255,255,255,0.12),rgba(255,255,255,0)_60%)]" />
          {/* user avatar intersecting from top */}
          <img
            src={userAvatar}
            alt="You"
            className="absolute -top-10 left-1/2 h-[120px] w-[120px] -translate-x-1/2 rounded-full border border-white/20 shadow-[0_20px_40px_rgba(0,0,0,0.45)] object-cover"
          />
        </div>

        {/* Copy */}
        <h1 className="text-center font-serif text-[24px] sm:text-[28px] font-light tracking-[-0.01em] drop-shadow-[0_1px_0_rgba(0,0,0,0.5)]">
          Request Sent to {clubName}
        </h1>
        <p className="mt-2 text-center text-[13px] sm:text-[14px] uppercase tracking-[0.08em] text-white/85">
          +{membersReviewing} Members are reviewing your access tonight
        </p>

        {/* Overlapping avatars */}
        <div className="mt-6 flex items-center">
          {ghostFaces.slice(0, 6).map((src, idx) => (
            <img
              key={idx}
              src={src}
              alt="member"
              className="h-10 w-10 rounded-full border border-white/20 object-cover shadow-[0_8px_24px_rgba(0,0,0,0.45)]"
              style={{ marginLeft: idx === 0 ? 0 : -12 }}
            />
          ))}
          <div className="ml-2 rounded-full border border-white/20 bg-white/10 px-2.5 py-1 text-[12px] text-white/85">
            +{Math.max(0, membersReviewing - 6)} more
          </div>
        </div>

        <p className="mt-3 text-center text-[12px] text-white/70">Active Members Processing Requests</p>

        {/* Spacer to push CTA to bottom visually */}
        <div className="flex-1" />

        {/* CTA */}
        <div className="fixed inset-x-0 bottom-0 z-20 mx-auto mb-7 max-w-[760px] px-5">
          <div className="rounded-2xl border border-white/10 bg-black/40 backdrop-blur-xl p-3">
            <Button
              onClick={() => navigate("/memberspass")}
              className="w-full h-12 rounded-[12px] bg-white/10 text-white border border-white/20 hover:bg-white/20 text-[14px] font-light tracking-wide"
            >
              Return Home
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
