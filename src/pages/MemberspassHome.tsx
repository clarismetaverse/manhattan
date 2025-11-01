import React from "react";

/**
 * Memberspass – Cinematic Home (Responsive Fine-Tuned)
 * Typography, spacing, and responsiveness refined for all viewports.
 */

const CARDS = [
  { id: "cipriani", title: "Cipriani", count: 91, image: "https://images.unsplash.com/photo-1579551055097-5f8b0b6b1d4f?q=80&w=1800&auto=format&fit=crop" },
  { id: "sanctuary", title: "The Sanctuary", count: 72, image: "https://images.unsplash.com/photo-1498654200943-1088dd4438ae?q=80&w=1800&auto=format&fit=crop" },
  { id: "parigi", title: "Palazzo Parigi", count: 61, image: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=1800&auto=format&fit=crop" },
];

export default function MemberspassCinematicHomeExact() {
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
              <div className="relative z-10 px-5 py-6 sm:px-7 sm:py-8">
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="pt-1 font-light text-[36px] sm:text-[42px] leading-none text-[#E8ECEB] tracking-[-0.01em] drop-shadow-[0_1px_0_rgba(0,0,0,0.6)]">
                    {card.count}
                  </div>
                  <div className="pt-[10px] sm:pt-[12px] text-[12.5px] sm:text-[13.5px] leading-none text-[#A9AFAD] tracking-[0.07em] uppercase">
                    tonight check ins
                  </div>
                </div>

                <h3 className="mt-5 sm:mt-6 text-[30px] sm:text-[36px] md:text-[40px] leading-[1.05] font-light tracking-[-0.015em] text-[#EEF1F0] drop-shadow-[0_1px_0_rgba(0,0,0,0.65)]">
                  {card.title}
                </h3>

                <div className="pointer-events-none absolute inset-0 rounded-[inherit] ring-1 ring-white/10" />
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 rounded-b-[inherit] bg-gradient-to-t from-black/60 to-transparent" />
              </div>
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}

