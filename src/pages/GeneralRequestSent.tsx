import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/button";

export interface GeneralRequestSentProps {
  clubName?: string;
  clubImage?: string;
  userAvatar?: string;
  membersReviewing?: number;
}

type LocationState = GeneralRequestSentProps | undefined;

const DEFAULTS: Required<GeneralRequestSentProps> = {
  clubName: "Cipriani Milano",
  clubImage:
    "https://images.unsplash.com/photo-1579551055097-5f8b0b6b1d4f?q=80&w=2000&auto=format&fit=crop",
  userAvatar:
    "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=800&auto=format&fit=crop",
  membersReviewing: 35,
};

const REVIEWING_AVATARS = [
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1552374196-c4e7ffc6e126?q=80&w=200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1527980965255-d3b416303d12?q=80&w=200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1502767089025-6572583495b0?q=80&w=200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?q=80&w=200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?q=80&w=200&auto=format&fit=crop",
];

export default function GeneralRequestSent(props: GeneralRequestSentProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const prefersReducedMotion = useReducedMotion();

  const state = (location.state as LocationState) ?? {};

  const clubName = state.clubName ?? props.clubName ?? DEFAULTS.clubName;
  const clubImage = state.clubImage ?? props.clubImage ?? DEFAULTS.clubImage;
  const userAvatar = state.userAvatar ?? props.userAvatar ?? DEFAULTS.userAvatar;
  const membersReviewing =
    state.membersReviewing ?? props.membersReviewing ?? DEFAULTS.membersReviewing;

  const displayedReviewers = REVIEWING_AVATARS.slice(
    0,
    Math.min(3, membersReviewing, REVIEWING_AVATARS.length)
  );

  const remainingReviewers = Math.max(0, membersReviewing - displayedReviewers.length);

  const avatarInitial = prefersReducedMotion
    ? { opacity: 1, y: 0 }
    : { opacity: 0, y: -16 };

  const avatarAnimate = prefersReducedMotion
    ? { opacity: 1, y: 0 }
    : {
        opacity: 1,
        y: 0,
      };

  const avatarTransition = prefersReducedMotion
    ? { duration: 0 }
    : { duration: 0.6, delay: 0.12 };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-black text-[#F2F1EF]">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${clubImage})` }}
        aria-hidden="true"
      />
      <div className="absolute inset-0 bg-[rgba(6,7,8,0.08)]" aria-hidden="true" />
      <div className="absolute inset-0 backdrop-blur-[2px]" aria-hidden="true" />
      <motion.div
        className="pointer-events-none absolute inset-x-0 top-0 h-52 bg-[radial-gradient(600px_140px_at_50%_0%,rgba(255,255,255,0.12),rgba(255,255,255,0)_70%)]"
        initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: prefersReducedMotion ? 0 : 0.8, ease: "easeOut" }}
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-black/80 via-black/40 to-transparent"
        aria-hidden="true"
      />

      <main className="relative z-10 mx-auto flex min-h-screen max-w-[760px] flex-col items-center px-6 pt-20 pb-32">
        <motion.div
          className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[12px] uppercase tracking-[0.12em] text-white/80"
          initial={prefersReducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: prefersReducedMotion ? 0 : 0.45, ease: "easeOut" }}
        >
          General Admission Request
        </motion.div>

        <motion.h1
          className="mt-6 text-center font-serif text-[26px] font-light tracking-[-0.01em] text-white drop-shadow-[0_1px_0_rgba(0,0,0,0.5)] sm:text-[30px]"
          initial={prefersReducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: prefersReducedMotion ? 0 : 0.6, ease: "easeOut", delay: 0.08 }}
        >
          Request Sent to {clubName}
        </motion.h1>

        <motion.img
          src={userAvatar}
          alt="Your avatar"
          loading="lazy"
          className="mt-6 h-[120px] w-[120px] rounded-full border border-white/30 object-cover shadow-[0_20px_40px_rgba(0,0,0,0.4)]"
          initial={prefersReducedMotion ? { opacity: 1, y: 0 } : avatarInitial}
          animate={avatarAnimate}
          transition={avatarTransition}
        />

        <motion.p
          className="mt-6 text-center text-[13px] uppercase tracking-[0.08em] text-white/85 sm:text-[14px]"
          initial={prefersReducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: prefersReducedMotion ? 0 : 0.5, ease: "easeOut", delay: 0.18 }}
        >
          any member may pick your request
        </motion.p>

        <motion.div
          className="mt-8 flex items-center"
          initial={prefersReducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: prefersReducedMotion ? 0 : 0.45, ease: "easeOut", delay: 0.24 }}
        >
          {displayedReviewers.map((src, idx) => (
            <motion.img
              key={src}
              src={src}
              alt="Reviewing member"
              loading="lazy"
              className="h-10 w-10 rounded-full border border-white/20 object-cover shadow-[0_8px_24px_rgba(0,0,0,0.45)]"
              style={{ marginLeft: idx === 0 ? 0 : -12 }}
              initial={prefersReducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: prefersReducedMotion ? 0 : 0.4,
                ease: "easeOut",
                delay: prefersReducedMotion ? 0 : 0.26 + idx * 0.05,
              }}
            />
          ))}
          {remainingReviewers > 0 && (
            <motion.div
              className="ml-2 rounded-full border border-white/20 bg-white/10 px-2.5 py-1 text-[12px] text-white/85"
              initial={prefersReducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: prefersReducedMotion ? 0 : 0.4, ease: "easeOut", delay: 0.34 }}
            >
              +{remainingReviewers} more
            </motion.div>
          )}
        </motion.div>

        <motion.p
          className="mt-3 text-center text-[12px] text-white/70"
          initial={prefersReducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: prefersReducedMotion ? 0 : 0.45, ease: "easeOut", delay: 0.32 }}
        >
          Active Members Processing Requests
        </motion.p>

        <div className="flex-1" />

        <div className="fixed inset-x-0 bottom-0 z-20 mx-auto mb-8 max-w-[760px] px-6">
          <div className="rounded-2xl border border-white/12 bg-black/40 p-3 backdrop-blur-xl">
            <Button
              aria-label="Open Guest Cards"
              onClick={() => navigate("/guest-cards")}
              className="h-10 w-full rounded-[12px] border border-white/20 bg-white/10 text-[13px] font-light tracking-wide text-white transition hover:bg-white/20"
            >
              Open Guest Cards
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
