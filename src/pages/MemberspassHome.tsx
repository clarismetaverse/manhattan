import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

/**
 * Memberspass – Cinematic Home (Responsive Fine-Tuned)
 * Typography, spacing, and responsiveness refined for all viewports.
 */

const CARDS = [
  {
    id: "cipriani",
    title: "Cipriani",
    membersCount: 428,
    tonightCount: 91,
    image: "https://images.unsplash.com/photo-1579551055097-5f8b0b6b1d4f?q=80&w=1800&auto=format&fit=crop"
  },
  {
    id: "sanctuary",
    title: "The Sanctuary",
    membersCount: 365,
    tonightCount: 72,
    image: "https://images.unsplash.com/photo-1498654200943-1088dd4438ae?q=80&w=1800&auto=format&fit=crop"
  },
  {
    id: "parigi",
    title: "Palazzo Parigi",
    membersCount: 298,
    tonightCount: 61,
    image: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=1800&auto=format&fit=crop"
  }
];

export default function MemberspassCinematicHomeExact() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-full bg-[#0A0B0C] text-[#E9ECEB] antialiased">
      {/* Subtle spotlight */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-[radial-gradient(520px_120px_at_50%_0%,rgba(255,255,255,0.10),rgba(255,255,255,0)_70%)]" />

      <main className="mx-auto max-w-[760px] px-4 sm:px-6 pt-8 pb-24">
        <p className="mb-6 text-[13px] sm:text-[15px] font-light leading-none text-[#B8BDBC]/90 tracking-[0.06em] uppercase">
          327 members checking in tonight
        </p>

        <ul className="space-y-6 sm:space-y-7">
          {CARDS.map((card) => (
            <li key={card.id}>
              <article className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0E0F10]/50 p-6 sm:p-7 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
                {card.image && (
                  <div
                    className="absolute inset-0 -z-10 bg-cover bg-center"
                    style={{ backgroundImage: `url(${card.image})` }}
                  />
                )}
                <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(100%_60%_at_50%_5%,rgba(9,10,11,0.25)_0%,rgba(9,10,11,0.75)_70%,rgba(9,10,11,0.95)_100%)]" />
                <div className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-32 bg-gradient-to-t from-[#0E0F10]/90 via-[#0E0F10]/40 to-transparent" />

                <h3 className="font-serif text-[28px] sm:text-[32px] font-light tracking-[-0.01em] text-[#F1F1E6]">
                  {card.title}
                </h3>
                <p className="mt-2 text-[13px] sm:text-[14px] text-white/70">
                  {card.membersCount.toLocaleString()} members on Memberspass
                </p>


                {typeof card.tonightCount === "number" && (
                  <div className="absolute bottom-4 right-4 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] text-white/80 backdrop-blur">
                    Tonight check-ins: {card.tonightCount}
                  </div>
                )}
              </article>
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}

