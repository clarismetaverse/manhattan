import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// same visual card as before, but driven by props
function ProUpgradeCardMobile({ plan }: { plan: { Name: string; Price: number; Renews?: string; Features?: { Feature: string; About?: string }[] } }) {
  return (
    <div className="w-full px-4 py-6">
      <div className="relative w-full max-w-sm mx-auto rounded-3xl overflow-hidden">
        <div className="pointer-events-none absolute -inset-0.5 rounded-3xl bg-gradient-to-br from-fuchsia-600 via-rose-600 to-purple-700 opacity-30 blur-2xl" />
        <div className="relative rounded-3xl bg-zinc-950/90 border border-white/10 p-5 shadow-[0_0_40px_-10px_rgba(236,72,153,0.35)]">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-rose-500 via-fuchsia-500 to-purple-600 ring-1 ring-white/20 shadow-lg" />
            <div>
              <div className="text-zinc-100 font-semibold text-lg tracking-tight">{plan.Name || 'Upgrade to PRO'}</div>
              <div className="text-zinc-400 text-xs">Unlock premium collabs & access</div>
            </div>
          </div>

          <div className="mt-5 flex items-baseline gap-2">
            <div className="text-4xl font-extrabold tracking-tight text-white">${plan.Price ?? 0}</div>
            <div className="text-zinc-400 text-sm">/ {plan.Renews || 'month'}</div>
          </div>

          <ul className="mt-5 space-y-3">
            {(plan.Features ?? []).slice(0, 3).map((f) => (
              <li key={f.Feature} className="flex items-start gap-3">
                <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-rose-500 to-purple-600 text-white/90 ring-1 ring-white/20">
                  ✓
                </span>
                <div>
                  <div className="text-zinc-200 text-sm font-semibold leading-tight">{f.Feature}</div>
                  <div className="text-xs text-zinc-400">{f.About ?? ''}</div>
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-6 flex flex-col items-center gap-2">
            <button className="h-11 w-full rounded-2xl text-sm font-semibold text-white bg-gradient-to-r from-rose-600 via-fuchsia-600 to-purple-700 shadow-[0_10px_30px_-10px_rgba(168,85,247,0.6)] active:scale-[0.99] transition-transform">
              Upgrade to PRO
            </button>
            <span className="text-sm text-fuchsia-400 hover:text-fuchsia-300 cursor-pointer transition-colors">
              See full benefits
            </span>
          </div>

          <p className="mt-3 text-[10px] text-zinc-500">Cancel anytime. Prices shown in USD.</p>
        </div>
      </div>
    </div>
  );
}

type ProUpgradeModalProps = {
  open: boolean;
  onClose: () => void;
};

const PLAN_URL = 'https://xbut-eryu-hhsg.f2.xano.io/api:bwh6Xc5O/proplan';

type Plan = {
  Name: string;
  Price: number;
  Renews?: string;
  Features?: { Feature: string; About?: string }[];
};

export default function ProUpgradeModal({ open, onClose }: ProUpgradeModalProps) {
  const [loading, setLoading] = useState(true);
  const [plan, setPlan] = useState<Plan | null>(null);

  useEffect(() => {
    if (!open) return;
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const res = await fetch(PLAN_URL, { method: 'GET' });
        const json = await res.json();
        if (!alive) return;
        setPlan(Array.isArray(json) ? json[0] : json);
      } catch (error) {
        if (!alive) return;
        setPlan(null);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-black/60" onClick={onClose} />
          <motion.div
            className="relative w-full sm:w-auto sm:min-w-[380px] max-w-[440px] bg-transparent"
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 24 }}
          >
            {loading ? (
              <div className="p-8 text-center text-white">Loading plan…</div>
            ) : plan ? (
              <ProUpgradeCardMobile plan={plan} />
            ) : (
              <div className="p-8 text-center text-white">Plan unavailable</div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
