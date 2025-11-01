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
    count: 91, 
    image: "https://images.unsplash.com/photo-1579551055097-5f8b0b6b1d4f?q=80&w=1800&auto=format&fit=crop",
    description: "Milano's most exclusive gathering. Members appreciate refined conversations and classic elegance.",
    guestPolicy: "Members may bring one guest",
    dressCode: "Formal attire required"
  },
  { 
    id: "sanctuary", 
    title: "The Sanctuary", 
    count: 72, 
    image: "https://images.unsplash.com/photo-1498654200943-1088dd4438ae?q=80&w=1800&auto=format&fit=crop",
    description: "A modern haven for creatives and innovators. Members value authentic connections and boundary-pushing ideas.",
    guestPolicy: "Two guests permitted per visit",
    dressCode: "Smart casual"
  },
  { 
    id: "parigi", 
    title: "Palazzo Parigi", 
    count: 61, 
    image: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=1800&auto=format&fit=crop",
    description: "Where old world charm meets contemporary luxury. Members seek timeless sophistication.",
    guestPolicy: "Members only on Fridays",
    dressCode: "Business formal"
  },
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
            <li
              key={card.id}
              className="relative overflow-hidden rounded-[20px] sm:rounded-[22px] border border-white/5 bg-[#0E0F10]/40 shadow-[0_12px_40px_-20px_rgba(0,0,0,0.75)] transition-transform duration-500 hover:scale-[1.01]"
            >
              {/* Background */}
              <div
                className="absolute inset-0 rounded-[inherit] bg-cover bg-center [filter:grayscale(92%)_contrast(92%)_brightness(55%)]"
                style={{ backgroundImage: `url(${card.image})` }}
              />
              <div className="absolute inset-0 rounded-[inherit] bg-[linear-gradient(180deg,rgba(8,9,10,0.50)_0%,rgba(8,9,10,0.60)_60%,rgba(8,9,10,0.66)_100%)]" />

              {/* Content */}
              <div className="relative z-10 px-5 py-8 sm:px-7 sm:py-10 flex flex-col h-full">
                <div className="absolute bottom-5 right-5 sm:bottom-6 sm:right-6 flex flex-col items-end gap-0.5">
                  <div className="text-[9px] leading-none text-white/60 tracking-[0.07em] uppercase">
                    tonight check ins
                  </div>
                  <div className="font-light text-[12px] leading-none text-white/90 tracking-[-0.01em] mr-2">
                    {card.count}
                  </div>
                </div>

                <h3 className="text-[30px] sm:text-[36px] leading-[1.05] font-light tracking-[-0.015em] text-white drop-shadow-[0_1px_0_rgba(0,0,0,0.65)] mb-3">
                  {card.title}
                </h3>

                <p className="text-[13px] sm:text-[14px] font-light leading-relaxed text-white/75 max-w-[85%] mb-6">
                  {card.description}
                </p>

                <div className="grid grid-cols-2 gap-3 mb-6">
                  <div>
                    <div className="text-[9px] uppercase tracking-[0.08em] text-white/50 mb-1">Guest Policy</div>
                    <div className="text-[11px] font-light text-white/80">{card.guestPolicy}</div>
                  </div>
                  <div>
                    <div className="text-[9px] uppercase tracking-[0.08em] text-white/50 mb-1">Dress Code</div>
                    <div className="text-[11px] font-light text-white/80">{card.dressCode}</div>
                  </div>
                </div>

                <Button 
                  onClick={() => navigate(`/memberspass/${card.id}`)}
                  className="mt-auto w-full sm:w-auto bg-white/10 text-white border border-white/20 hover:bg-white/20 text-[13px] font-light h-9 rounded-[10px]"
                >
                  See members
                </Button>

                <div className="pointer-events-none absolute inset-0 rounded-[inherit] ring-1 ring-white/10" />
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 rounded-b-[inherit] bg-gradient-to-t from-black/70 to-transparent" />
              </div>
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}

