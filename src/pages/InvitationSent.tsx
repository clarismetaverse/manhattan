import { useEffect, useMemo } from "react";
import confetti from "canvas-confetti";
import { motion } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";

type InvitationLocationState = {
  creatorName?: string;
};

export default function InvitationSent() {
  const navigate = useNavigate();
  const location = useLocation();

  const creatorName = useMemo(() => {
    const state = location.state as InvitationLocationState | null;
    return state?.creatorName?.trim() || "Shahlo";
  }, [location.state]);

  useEffect(() => {
    const endAt = Date.now() + 1800;

    const burst = (originX: number) => {
      confetti({
        particleCount: 22,
        startVelocity: 24,
        spread: 62,
        ticks: 120,
        scalar: 0.9,
        gravity: 0.9,
        origin: { x: originX, y: 0.72 },
        colors: ["#FF385C", "#ffffff", "#888888"],
      });
    };

    const interval = window.setInterval(() => {
      if (Date.now() >= endAt) {
        window.clearInterval(interval);
        return;
      }
      burst(0.24);
      burst(0.76);
    }, 280);

    burst(0.24);
    burst(0.76);

    return () => {
      window.clearInterval(interval);
    };
  }, []);

  return (
    <div className="min-h-screen bg-neutral-950 px-4 py-10 text-white">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-md items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="w-full rounded-2xl border border-neutral-800 bg-neutral-900 p-6 text-center shadow-[0_30px_80px_rgba(0,0,0,0.45)]"
        >
          <h1 className="text-2xl font-semibold tracking-tight">Invitation sent ✨</h1>
          <p className="mt-2 text-sm text-neutral-300">{creatorName} received your invite</p>

          <button
            type="button"
            onClick={() => navigate("/memberspass/creators")}
            className="mt-6 w-full rounded-xl bg-[#FF385C] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#ff4f6f]"
          >
            Back to creators
          </button>
        </motion.div>
      </div>
    </div>
  );
}
