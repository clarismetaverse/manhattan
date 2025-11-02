/**
 * Codex Prompt — GuestMatch (mobile-first)
 *
 * Implement the following React + Tailwind screen for Memberspass (mobile-first).
 * Background: blurred venue photo with dark gradient overlays.
 * Content:
 * • “Dear {firstName},” (small serif italic).
 * • Headline: “Tonight you are a guest at {venue}” (slightly smaller than avatar prominence).
 * • Courtesy row: host avatar + text “As courtesy of {hostName}” + Cipriani logo icon to the side.
 * • Etiquette note: “Wait for your host at the entrance — entry is by invitation only.”
 * Actions: left a minimal chat icon button, right a frosted outline “Guest List Details” button.
 * Remove any page header; ensure the layout is elegant, cinematic, and responsive.
 * Output clean, production-ready JSX + Tailwind only.
 */

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
    "https://images.unsplash.com/photo-1579551055097-5f8b0b6b1d4f?q=80&w=1800&auto=format&fit=crop",
};

export default function GuestMatch(props: GuestMatchProps) {
  const firstName = props.firstName ?? DEFAULTS.firstName;
  const venue = props.venue ?? DEFAULTS.venue;
  const hostName = props.hostName ?? DEFAULTS.hostName;
  const guestAvatar = props.guestAvatar ?? DEFAULTS.guestAvatar;
  const hostAvatar = props.hostAvatar ?? DEFAULTS.hostAvatar;
  const venueImage = props.venueImage ?? DEFAULTS.venueImage;

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-black text-[#F1F2F4]">
      <div
        className="absolute inset-0 -z-10 bg-cover bg-center blur-sm"
        style={{ backgroundImage: `url(${venueImage})` }}
        aria-hidden="true"
      />
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-black/75 via-black/65 to-black/85" aria-hidden="true" />
      <div className="absolute inset-x-0 top-0 -z-10 h-48 bg-gradient-to-b from-white/10 via-transparent to-transparent" aria-hidden="true" />
      <div className="absolute inset-x-0 bottom-0 -z-10 h-48 bg-gradient-to-t from-black/90 via-black/60 to-transparent" aria-hidden="true" />

      <main className="mx-auto flex min-h-screen w-full max-w-md flex-col px-5 pb-16 pt-12 sm:max-w-lg sm:px-6 sm:pt-16">
        <div className="flex flex-1 flex-col">
          <div className="flex flex-col items-center text-center">
            <p className="text-[13px] font-serif italic text-white/75 sm:text-[14px]">Dear {firstName},</p>

            <div className="mt-8 flex flex-col items-center gap-6">
              <div className="relative">
                <div className="absolute -inset-3 rounded-full bg-white/10 blur-xl" aria-hidden="true" />
                <img
                  src={guestAvatar}
                  alt={`${firstName}'s avatar`}
                  className="relative h-[132px] w-[132px] rounded-full border border-white/25 object-cover shadow-[0_20px_50px_rgba(0,0,0,0.65)] sm:h-[148px] sm:w-[148px]"
                  loading="lazy"
                />
              </div>

              <h1 className="max-w-[260px] text-[23px] font-light leading-snug tracking-[-0.01em] text-white sm:max-w-[300px] sm:text-[26px]">
                Tonight you are a guest at {venue}
              </h1>
            </div>
          </div>

          <div className="mt-10 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md shadow-[0_20px_60px_rgba(0,0,0,0.35)] sm:p-5">
            <div className="flex items-center justify-between gap-3 sm:gap-4">
              <div className="flex flex-1 items-center gap-3 sm:gap-4">
                <img
                  src={hostAvatar}
                  alt={`${hostName}'s avatar`}
                  className="h-12 w-12 rounded-full border border-white/25 object-cover"
                  loading="lazy"
                />
                <div className="text-left">
                  <p className="text-[11px] uppercase tracking-[0.16em] text-white/60">As courtesy of</p>
                  <p className="text-[14px] font-light text-white">{hostName}</p>
                </div>
              </div>
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white">
                <svg
                  viewBox="0 0 32 32"
                  aria-hidden="true"
                  className="h-6 w-6 text-white/90"
                >
                  <path
                    d="M22.4 9.2c-1.6-1.6-3.6-2.4-6-2.4-4.8 0-8.2 3.6-8.2 9.2s3.4 9.2 8.2 9.2c2.4 0 4.4-.8 6-2.4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <circle
                    cx="20.6"
                    cy="11.4"
                    r="1.4"
                    fill="currentColor"
                    className="text-white"
                  />
                </svg>
              </div>
            </div>
          </div>

          <p className="mt-8 text-center text-[13px] leading-relaxed text-white/70 sm:text-[14px]">
            Wait for your host at the entrance — entry is by invitation only.
          </p>
        </div>

        <div className="mt-12 flex items-center justify-between gap-3 sm:mt-14">
          <button
            type="button"
            className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white/90 backdrop-blur-sm transition-colors hover:bg-white/15"
            aria-label="Open chat"
          >
            <MessageCircle className="h-5 w-5" />
          </button>
          <button
            type="button"
            className="flex h-11 flex-1 items-center justify-center rounded-full border border-white/25 bg-white/5 text-[13px] font-light uppercase tracking-[0.18em] text-white/90 backdrop-blur-lg transition-colors hover:bg-white/12"
          >
            Guest List Details
          </button>
        </div>
      </main>
    </div>
  );
}
