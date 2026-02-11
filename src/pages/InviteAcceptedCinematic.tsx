import { useEffect, useMemo, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import confetti from "canvas-confetti";
import { Check } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

type InviteAcceptedState = {
  venueName?: string;
  collabTitle?: string;
  coverUrl?: string;
};

const DEFAULT_COVER =
  "https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=1400&q=80";

export default function InviteAcceptedCinematic() {
  const navigate = useNavigate();
  const location = useLocation();
  const confettiFired = useRef(false);

  const { venueName, collabTitle, coverUrl } = useMemo(() => {
    const state = (location.state as InviteAcceptedState | null) ?? null;
    return {
      venueName: state?.venueName?.trim() || "Venue",
      collabTitle: state?.collabTitle?.trim() || "Guest experience",
      coverUrl: state?.coverUrl?.trim() || DEFAULT_COVER,
    };
  }, [location.state]);

  useEffect(() => {
    const burstTimer = window.setTimeout(() => {
      if (confettiFired.current) return;
      confettiFired.current = true;
      confetti({
        particleCount: 36,
        spread: 52,
        startVelocity: 18,
        gravity: 1.05,
        scalar: 0.82,
        ticks: 130,
        origin: { x: 0.5, y: 0.45 },
        colors: ["#E6E7EA", "#A2AEC2", "#7A8AA2"],
      });
    }, 940);

    const redirectTimer = window.setTimeout(() => {
      navigate("/memberspass/venues", {
        replace: true,
        state: {
          highlight: {
            venueName,
            collabTitle,
          },
        },
      });
    }, 1700);

    return () => {
      window.clearTimeout(burstTimer);
      window.clearTimeout(redirectTimer);
    };
  }, [collabTitle, navigate, venueName]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#060708] text-[#ECEEF2]">
      <div
        className="pointer-events-none absolute inset-0 scale-105 bg-cover bg-center"
        style={{ backgroundImage: `url(${coverUrl})` }}
      />
      <motion.div
        className="pointer-events-none absolute inset-0"
        animate={{ opacity: [0.55, 0.7, 0.58], filter: ["blur(14px)", "blur(8px)", "blur(12px)"] }}
        transition={{ duration: 1.7, ease: "easeInOut" }}
        style={{ backgroundImage: `url(${coverUrl})`, backgroundSize: "cover", backgroundPosition: "center" }}
      />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_55%_at_50%_20%,rgba(24,26,31,0.22),rgba(5,6,8,0.86))]" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/45 via-black/60 to-black/85" />

      <main className="relative z-10 mx-auto flex min-h-screen w-full max-w-md items-center justify-center px-5 py-10">
        <div className="w-full [perspective:1400px]">
          <motion.div
            className="relative h-[280px] w-full [transform-style:preserve-3d]"
            initial={{ rotateY: 0 }}
            animate={{ rotateY: 180 }}
            transition={{ duration: 1.05, ease: [0.22, 0.61, 0.36, 1], delay: 0.35 }}
          >
            <motion.section
              className="absolute inset-0 rounded-[28px] border border-white/10 bg-white/[0.06] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.45)] backdrop-blur-2xl [backface-visibility:hidden]"
              initial={{ opacity: 1 }}
              animate={{ opacity: [1, 1, 0.95] }}
              transition={{ duration: 0.85 }}
            >
              <p className="text-[11px] uppercase tracking-[0.3em] text-white/55">Invitation</p>
              <h1 className="mt-5 text-2xl font-medium tracking-[-0.02em] text-white/92">Accepting invite…</h1>
              <p className="mt-2 text-sm text-white/60">{venueName}</p>
              <p className="mt-1 text-xs text-white/45">{collabTitle}</p>

              <div className="mt-10">
                <div className="h-[7px] overflow-hidden rounded-full border border-white/10 bg-white/10">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-white/45 via-white/75 to-white/50"
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 0.95, ease: "easeOut", delay: 0.15 }}
                  />
                </div>
                <p className="mt-3 text-xs text-white/55">Preparing your activities…</p>
              </div>
            </motion.section>

            <section className="absolute inset-0 rounded-[28px] border border-white/10 bg-white/[0.07] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.45)] backdrop-blur-2xl [transform:rotateY(180deg)] [backface-visibility:hidden]">
              <AnimatePresence>
                <motion.div
                  className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                  initial={{ x: "-40%", opacity: 0 }}
                  animate={{ x: "240%", opacity: [0, 0.38, 0] }}
                  transition={{ delay: 1.02, duration: 0.75, ease: "easeOut" }}
                />
              </AnimatePresence>

              <div className="flex h-full flex-col items-center justify-center text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full border border-white/15 bg-white/10">
                  <Check className="h-7 w-7 text-[#E3E8EF]" strokeWidth={2.4} />
                </div>
                <p className="mt-5 text-[11px] uppercase tracking-[0.3em] text-white/55">Confirmed</p>
                <h2 className="mt-2 text-[28px] font-medium tracking-[-0.02em] text-white/95">Invite accepted</h2>
                <p className="mt-2 text-sm text-white/65">Redirecting to planned activities</p>
              </div>
            </section>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
