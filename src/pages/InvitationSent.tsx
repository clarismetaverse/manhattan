import { useEffect, useMemo } from "react";
import confetti from "canvas-confetti";
import { motion } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";

type InvitationLocationState = {
  creatorName?: string;
  creatorAvatarUrl?: string;
};

export default function InvitationSent() {
  const navigate = useNavigate();
  const location = useLocation();

  const { creatorName, creatorAvatarUrl } = useMemo(() => {
    const state = (location.state as InvitationLocationState | null) ?? null;
    return {
      creatorName: state?.creatorName?.trim() || "Shahlo",
      creatorAvatarUrl: state?.creatorAvatarUrl?.trim() || "",
    };
  }, [location.state]);

  useEffect(() => {
    const endAt = Date.now() + 1400;

    const burst = (originX: number) => {
      confetti({
        particleCount: 12,
        startVelocity: 18,
        spread: 55,
        ticks: 110,
        scalar: 0.85,
        gravity: 0.95,
        origin: { x: originX, y: 0.72 },
        colors: ["#FF385C", "#ffffff", "#cbd5e1"],
      });
    };

    const interval = window.setInterval(() => {
      if (Date.now() >= endAt) {
        window.clearInterval(interval);
        return;
      }
      burst(0.24);
      burst(0.76);
    }, 260);

    burst(0.24);
    burst(0.76);

    return () => window.clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen px-4 py-10 text-neutral-900">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[#F6F7FB]" />
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(900px_500px_at_50%_20%,rgba(255,56,92,0.14),transparent_55%)]" />
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(900px_500px_at_30%_80%,rgba(59,130,246,0.10),transparent_55%)]" />

      <div className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-md items-center justify-center">
        <div className="[perspective:1200px] w-full">
          <motion.div
            initial={{ opacity: 0, rotateX: -16, rotateY: 10, y: 22 }}
            animate={{ opacity: 1, rotateX: 0, rotateY: 0, y: 0 }}
            transition={{ duration: 0.85, ease: "easeOut" }}
            whileHover={{ rotateY: -2, rotateX: 1 }}
            className="w-full rounded-3xl border border-black/10 bg-white/70 p-7 text-center shadow-[0_30px_90px_rgba(0,0,0,0.18)] backdrop-blur-xl"
          >
            <div className="mx-auto -mt-2 mb-4 flex items-center justify-center">
              <div className="relative">
                <div className="h-16 w-16 overflow-hidden rounded-full border border-black/10 bg-white shadow-[0_10px_30px_rgba(0,0,0,0.12)]">
                  {creatorAvatarUrl ? (
                    <img
                      src={creatorAvatarUrl}
                      alt={creatorName}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-lg font-semibold text-neutral-700">
                      {creatorName.slice(0, 1).toUpperCase()}
                    </div>
                  )}
                </div>

                <div className="pointer-events-none absolute inset-0 rounded-full ring-2 ring-[#FF385C]/25" />
              </div>
            </div>

            <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">
              Invitation sent <span className="align-middle">✨</span>
            </h1>
            <p className="mt-2 text-sm text-neutral-600">
              {creatorName} received your invite
            </p>

            <button
              type="button"
              onClick={() => navigate("/memberspass/creators")}
              className="mt-7 w-full rounded-2xl bg-[#FF385C] px-4 py-3 text-sm font-semibold text-white shadow-[0_14px_35px_rgba(255,56,92,0.28)] transition hover:bg-[#ff4f6f] active:scale-[0.99]"
            >
              Back to creators
            </button>

            <button
              type="button"
              onClick={() => navigate("/memberspass/creators")}
              className="mt-3 text-xs font-medium text-neutral-500 hover:text-neutral-700"
            >
              View more creators
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
