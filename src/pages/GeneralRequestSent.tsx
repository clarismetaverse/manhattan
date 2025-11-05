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
  clubImage: "https://images.unsplash.com/photo-1579551055097-5f8b0b6b1d4f?q=80&w=2000&auto=format&fit=crop",
  userAvatar: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=800&auto=format&fit=crop",
  membersReviewing: 35
};
const REVIEWING_AVATARS = ["https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop", "https://images.unsplash.com/photo-1552374196-c4e7ffc6e126?q=80&w=200&auto=format&fit=crop", "https://images.unsplash.com/photo-1527980965255-d3b416303d12?q=80&w=200&auto=format&fit=crop", "https://images.unsplash.com/photo-1502767089025-6572583495b0?q=80&w=200&auto=format&fit=crop", "https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?q=80&w=200&auto=format&fit=crop", "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=200&auto=format&fit=crop", "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop", "https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?q=80&w=200&auto=format&fit=crop"];
export default function GeneralRequestSent(props: GeneralRequestSentProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const prefersReducedMotion = useReducedMotion();
  const state = location.state as LocationState ?? {};
  const clubName = state.clubName ?? props.clubName ?? DEFAULTS.clubName;
  const clubImage = state.clubImage ?? props.clubImage ?? DEFAULTS.clubImage;
  const userAvatar = state.userAvatar ?? props.userAvatar ?? DEFAULTS.userAvatar;
  const membersReviewing = state.membersReviewing ?? props.membersReviewing ?? DEFAULTS.membersReviewing;
  const displayedReviewers = REVIEWING_AVATARS.slice(0, Math.min(3, membersReviewing, REVIEWING_AVATARS.length));
  const remainingReviewers = Math.max(0, membersReviewing - displayedReviewers.length);
  const avatarInitial = prefersReducedMotion ? {
    opacity: 1,
    y: 0
  } : {
    opacity: 0,
    y: -16
  };
  const avatarAnimate = prefersReducedMotion ? {
    opacity: 1,
    y: 0
  } : {
    opacity: 1,
    y: 0
  };
  const avatarTransition = prefersReducedMotion ? {
    duration: 0
  } : {
    duration: 0.6,
    delay: 0.12
  };
  return <div className="relative min-h-screen w-full overflow-hidden bg-[#0B0907] text-[#F7F1E6]">
      <div className="pointer-events-none absolute inset-0 z-0 bg-cover bg-center opacity-35 [filter:saturate(115%)_contrast(110%)_brightness(90%)]" style={{
      backgroundImage: `url(${clubImage})`
    }} aria-hidden="true" />
      <div className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(circle_at_20%_20%,rgba(231,209,176,0.25),transparent_45%),radial-gradient(circle_at_80%_15%,rgba(152,126,96,0.2),transparent_55%),linear-gradient(to_bottom,#14100B_0%,#0B0907_65%,#080705_100%)]" aria-hidden="true" />
      <motion.div className="pointer-events-none absolute inset-x-0 top-0 z-0 h-64 bg-[radial-gradient(540px_180px_at_50%_-60px,rgba(244,232,210,0.32),rgba(244,232,210,0)_70%)]" initial={prefersReducedMotion ? {
      opacity: 1
    } : {
      opacity: 0
    }} animate={{
      opacity: 1
    }} transition={{
      duration: prefersReducedMotion ? 0 : 0.8,
      ease: "easeOut"
    }} aria-hidden="true" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-0 h-72 bg-gradient-to-t from-[#080705] via-[rgba(8,7,5,0.6)] to-transparent" aria-hidden="true" />

      <main className="relative z-10 mx-auto flex min-h-screen max-w-[840px] flex-col px-4 py-8 sm:px-6 sm:py-12 md:py-16">
        <div className="flex flex-1 items-center justify-center">
          <motion.section className="relative isolate w-full max-w-[640px] overflow-hidden rounded-[20px] border border-[#E7D9C62e] px-5 pb-10 pt-8 shadow-[0_40px_90px_rgba(4,3,2,0.68)] backdrop-blur-xl sm:rounded-[24px] sm:px-8 sm:pb-12 sm:pt-10 md:px-10 md:pb-14 md:pt-12" style={{
          backgroundColor: "rgba(18,13,8,0.88)"
        }} initial={prefersReducedMotion ? {
          opacity: 1,
          y: 0
        } : {
          opacity: 0,
          y: 24
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: prefersReducedMotion ? 0 : 0.7,
          ease: "easeOut"
        }}>
            <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,rgba(248,240,224,0.14),transparent_68%)]" />
            <motion.div className="mx-auto w-fit rounded-full border border-[#F5E9D33d] bg-[#D9C6AA1f] px-3 py-0.5 text-[11px] uppercase tracking-[0.16em] text-[#E8D7BD] sm:px-3.5 sm:py-1 sm:text-[12px] sm:tracking-[0.18em]" initial={prefersReducedMotion ? {
            opacity: 1,
            y: 0
          } : {
            opacity: 0,
            y: -8
          }} animate={{
            opacity: 1,
            y: 0
          }} transition={{
            duration: prefersReducedMotion ? 0 : 0.45,
            ease: "easeOut"
          }}>
              General Admission Request
            </motion.div>

            <motion.h1 className="mt-5 text-center font-serif text-[26px] font-light tracking-[-0.02em] text-[#FAF3E5] sm:mt-6 sm:text-[28px] md:mt-8 md:text-[32px]" initial={prefersReducedMotion ? {
            opacity: 1,
            y: 0
          } : {
            opacity: 0,
            y: 18
          }} animate={{
            opacity: 1,
            y: 0
          }} transition={{
            duration: prefersReducedMotion ? 0 : 0.6,
            ease: "easeOut",
            delay: 0.08
          }}>
              Request Sent
            </motion.h1>

            <motion.p className="mt-2 text-center text-[14px] font-light text-[rgba(231,217,198,0.8)] sm:mt-3 sm:text-[15px]" initial={prefersReducedMotion ? {
            opacity: 1,
            y: 0
          } : {
            opacity: 0,
            y: 10
          }} animate={{
            opacity: 1,
            y: 0
          }} transition={{
            duration: prefersReducedMotion ? 0 : 0.55,
            ease: "easeOut",
            delay: 0.16
          }}>Members of The Arts Club will be reviewing your request.{clubName} are reviewing your request now.
            </motion.p>

            <motion.div className="mx-auto mt-6 flex h-[100px] w-[100px] items-center justify-center rounded-full border border-[#F1E4CD3d] bg-[#E8D9C61a] shadow-[0_26px_60px_rgba(7,5,3,0.55)] sm:mt-8 sm:h-[110px] sm:w-[110px] md:mt-10 md:h-[126px] md:w-[126px]" initial={prefersReducedMotion ? {
            opacity: 1,
            y: 0
          } : avatarInitial} animate={avatarAnimate} transition={avatarTransition}>
              <img src={userAvatar} alt="Your avatar" loading="lazy" className="h-[82px] w-[82px] rounded-full border border-[#F3E6CF33] object-cover sm:h-[92px] sm:w-[92px] md:h-[104px] md:w-[104px]" />
            </motion.div>

            <motion.div className="mt-6 flex items-center justify-center sm:mt-8 md:mt-10" initial={prefersReducedMotion ? {
            opacity: 1,
            y: 0
          } : {
            opacity: 0,
            y: 12
          }} animate={{
            opacity: 1,
            y: 0
          }} transition={{
            duration: prefersReducedMotion ? 0 : 0.5,
            ease: "easeOut",
            delay: 0.26
          }}>
              {displayedReviewers.map((src, idx) => <motion.img key={src} src={src} alt="Reviewing member" loading="lazy" className="h-10 w-10 rounded-full border border-[#EADCC73d] object-cover shadow-[0_10px_26px_rgba(9,7,5,0.45)]" style={{
              marginLeft: idx === 0 ? 0 : -12
            }} initial={prefersReducedMotion ? {
              opacity: 1,
              y: 0
            } : {
              opacity: 0,
              y: 8
            }} animate={{
              opacity: 1,
              y: 0
            }} transition={{
              duration: prefersReducedMotion ? 0 : 0.45,
              ease: "easeOut",
              delay: prefersReducedMotion ? 0 : 0.28 + idx * 0.05
            }} />)}
              {remainingReviewers > 0 && <motion.div className="ml-2 rounded-full border border-[#E8DAC63d] bg-[#DCCBB11f] px-3 py-1 text-[12px] text-[#F0E4D0]" initial={prefersReducedMotion ? {
              opacity: 1,
              y: 0
            } : {
              opacity: 0,
              y: 8
            }} animate={{
              opacity: 1,
              y: 0
            }} transition={{
              duration: prefersReducedMotion ? 0 : 0.45,
              ease: "easeOut",
              delay: 0.38
            }}>
                  +{remainingReviewers} more
                </motion.div>}
            </motion.div>

            

            <div className="mt-6 h-px w-full bg-gradient-to-r from-transparent via-[#E5D3BA33] to-transparent sm:mt-8 md:mt-10" />

            <motion.div className="mt-6 space-y-4 text-center sm:mt-8 sm:space-y-5 md:mt-10 md:space-y-6" initial={prefersReducedMotion ? {
            opacity: 1
          } : {
            opacity: 0
          }} animate={{
            opacity: 1
          }} transition={{
            duration: prefersReducedMotion ? 0 : 0.6,
            delay: 0.44
          }}>
              

              <Button aria-label="Open Guest Cards" onClick={() => navigate("/guest-cards")} className="h-11 w-full rounded-[14px] border border-[rgba(203,183,154,0.5)] bg-[#F7E8CE] text-[12px] font-medium tracking-[0.08em] text-[#2B1E13] shadow-[0_16px_30px_rgba(21,15,10,0.25)] transition-colors hover:bg-[#FAEDDA] hover:text-[#1C120B] sm:h-12 sm:rounded-[16px] sm:text-[13px]">
                Open Guest Cards
              </Button>

              <div className="flex items-start justify-center gap-2 text-[10px] text-[rgba(231,217,198,0.7)] sm:items-center sm:gap-3 sm:text-[11px]">
                <svg className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 sm:mt-0 sm:h-4 sm:w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="15" y1="9" x2="9" y2="15" />
                  <line x1="9" y1="9" x2="15" y2="15" />
                </svg>
                <span className="max-w-[320px] text-left leading-relaxed sm:max-w-[360px]">
                  Contacting the Membersclub directly may lead to a permanent ban and a notice to
                  the reviewing members.
                </span>
              </div>
            </motion.div>
          </motion.section>
        </div>
      </main>
    </div>;
}