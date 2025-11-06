import React from "react";
import { useNavigate } from "react-router-dom";
import { MessageCircle } from "lucide-react";

export interface GuestMatchProps {
  firstName?: string;
  venue?: string;
  hostName?: string;
  guestAvatar?: string;
  hostAvatar?: string;
  venueImage?: string;
}

const DEFAULTS: Required<GuestMatchProps> = {
  firstName: "Alexandra",
  venue: "Cipriani Milano",
  hostName: "Matteo Cipriani",
  guestAvatar:
    "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=640&auto=format&fit=crop",
  hostAvatar:
    "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=640&auto=format&fit=crop",
  venueImage:
    "https://images.unsplash.com/photo-1579551055097-5f8b0b6b1d4f?q=80&w=2000&auto=format&fit=crop",
};

export default function GuestMatch(props: GuestMatchProps) {
  const navigate = useNavigate();
  const firstName = props.firstName ?? DEFAULTS.firstName;
  const venue = props.venue ?? DEFAULTS.venue;
  const hostName = props.hostName ?? DEFAULTS.hostName;
  const guestAvatar = props.guestAvatar ?? DEFAULTS.guestAvatar;
  const hostAvatar = props.hostAvatar ?? DEFAULTS.hostAvatar;
  const venueImage = props.venueImage ?? DEFAULTS.venueImage;

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-black text-[#F1F2F4] antialiased">
      {/* BACKDROP: blurred venue image + cinematic overlays */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center backdrop-blur-[8px]"
        style={{ backgroundImage: `url(${venueImage})` }}
        aria-hidden="true"
      />
      <div className="absolute inset-0 z-0 bg-[rgba(8,9,10,0.55)]" aria-hidden="true" />
      <div
        className="absolute inset-x-0 top-0 -z-10 h-48
                   bg-[radial-gradient(520px_140px_at_50%_0%,rgba(255,255,255,0.12),rgba(255,255,255,0)_70%)]"
        aria-hidden="true"
      />
      <div
        className="absolute inset-x-0 bottom-0 -z-10 h-56
                   bg-gradient-to-t from-black/88 via-black/55 to-transparent"
        aria-hidden="true"
      />

      {/* CONTENT */}
      <main className="mx-auto flex min-h-screen w-full max-w-md flex-col px-5 pb-16 pt-12 sm:max-w-lg sm:px-6 sm:pt-16">
        <div className="flex flex-1 flex-col items-center text-center">
          {/* Dear */}
          <p className="text-[13px] font-serif italic text-white/80 sm:text-[14px]">
            Dear {firstName},
          </p>

          {/* Guest avatar hero with “aura” */}
          <div className="mt-8 flex flex-col items-center gap-6">
            <div className="relative">
              {/* soft white aura */}
              <div
                className="absolute inset-0 -z-10 rounded-full
                           bg-[radial-gradient(closest-side,rgba(255,255,255,0.16),rgba(255,255,255,0.06)_55%,transparent_70%)]
                           blur-[6px]"
                aria-hidden="true"
              />
              {/* subtle emerald→sand conic glow */}
              <div
                className="absolute -inset-4 -z-10 rounded-full
                           bg-[conic-gradient(from_140deg,rgba(16,185,129,0.12),rgba(217,203,184,0.10),transparent_70%)]
                           blur-[18px]"
                aria-hidden="true"
              />
              <img
                src={guestAvatar}
                alt={`${firstName}'s avatar`}
                className="relative h-[136px] w-[136px] rounded-full border border-white/25 object-cover shadow-[0_20px_50px_rgba(0,0,0,0.65)] sm:h-[152px] sm:w-[152px]"
                loading="lazy"
              />
            </div>

            {/* Headline */}
            <h1 className="max-w-[300px] text-[24px] font-light leading-snug tracking-[-0.01em] text-white sm:max-w-[340px] sm:text-[28px]">
              Tonight you are a guest at {venue}
            </h1>
          </div>

          {/* Host courtesy pill (host name with emerald→sand gradient) */}
          <div className="mt-10 w-full rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md shadow-[0_20px_60px_rgba(0,0,0,0.35)] sm:p-5">
            <div className="flex items-center justify-between gap-3 sm:gap-4">
              <div className="flex flex-1 items-center gap-3 sm:gap-4">
                <img
                  src={hostAvatar}
                  alt={`${hostName}'s avatar`}
                  className="h-12 w-12 rounded-full border border-white/25 object-cover"
                  loading="lazy"
                />
                <div className="text-left">
                  <p className="text-[11px] uppercase tracking-[0.16em] text-white/60">
                    As courtesy of
                  </p>
                  <p
                    className="text-[16px] font-medium leading-tight
                               bg-gradient-to-r from-emerald-200 via-emerald-100 to-[#D9CBA3]
                               bg-clip-text text-transparent"
                  >
                    {hostName}
                  </p>
                </div>
              </div>
              {/* Brand logo token (placeholder) */}
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white">
                <svg viewBox="0 0 32 32" aria-hidden="true" className="h-6 w-6 text-white/90">
                  <path
                    d="M22.4 9.2c-1.6-1.6-3.6-2.4-6-2.4-4.8 0-8.2 3.6-8.2 9.2s3.4 9.2 8.2 9.2c2.4 0 4.4-.8 6-2.4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <circle cx="20.6" cy="11.4" r="1.4" fill="currentColor" className="text-white" />
                </svg>
              </div>
            </div>
          </div>

          {/* Etiquette note */}
          <p className="mt-8 max-w-[520px] px-2 text-center text-[13px] leading-relaxed text-white/75 sm:text-[14px]">
            Wait for your host at the entrance — entry is by invitation only.
          </p>
        </div>

        {/* Action bar */}
        <div className="mt-12 grid grid-cols-[48px_1fr] items-center gap-3 sm:mt-14">
          <button
            type="button"
            className="flex h-12 w-12 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white/90 backdrop-blur-sm transition-colors hover:bg-white/15"
            aria-label="Open chat"
          >
            <MessageCircle className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => navigate("/memberspass/tickets")}
            className="flex h-12 items-center justify-center rounded-full border border-white/25 bg-white/5 text-[13px] font-light uppercase tracking-[0.18em] text-white/90 backdrop-blur-lg transition-colors hover:bg-white/12"
          >
            Open Guest Experiences
          </button>
        </div>

        {/* Route description */}
        <p className="mt-4 text-center text-[11px] text-white/50">
          Access your exclusive guest tickets and experiences
        </p>
      </main>
    </div>
  );
}
