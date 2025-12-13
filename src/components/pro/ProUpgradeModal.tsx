import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// same visual card as before, but driven by props
function ProUpgradeCardMobile({ plan }: { plan: { Name: string; Price: number; Renews?: string; Features?: { Feature: string; About?: string }[] } }) {
  return (
    <div className="w-full px-4 py-6">
      <div className="relative w-full max-w-sm mx-auto rounded-3xl overflow-hidden">
        {/* Enhanced multi-layer glow effect - matching PRO view purple/pink */}
        <div className="pointer-events-none absolute -inset-1 rounded-3xl bg-gradient-to-br from-purple-700 via-pink-700 to-purple-800 opacity-40 blur-3xl animate-pulse" />
        <div className="pointer-events-none absolute -inset-0.5 rounded-3xl bg-gradient-to-br from-purple-800 via-pink-800 to-purple-900 opacity-25 blur-xl" />
        
        {/* Main card with PRO view gradient colors */}
        <div className="relative rounded-3xl bg-gradient-to-br from-purple-950 via-zinc-950 to-pink-950/95 border border-purple-500/20 backdrop-blur-sm p-6 shadow-[0_0_60px_-15px_rgba(168,85,247,0.5),0_20px_40px_-10px_rgba(0,0,0,0.8)] transition-all duration-300 hover:shadow-[0_0_80px_-10px_rgba(168,85,247,0.6),0_25px_50px_-10px_rgba(0,0,0,0.9)]">
          
          {/* Header with icon and title */}
          <div className="flex items-center gap-3">
            <div className="relative h-11 w-11 rounded-2xl bg-gradient-to-br from-purple-600 via-pink-600 to-purple-700 ring-2 ring-purple-400/30 shadow-[0_0_20px_rgba(168,85,247,0.4)] animate-scale-in">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/20 to-transparent" />
            </div>
            <div>
              <div className="text-white font-bold text-lg tracking-tight">{plan.Name || 'Upgrade to PRO'}</div>
              <div className="text-zinc-400 text-xs">Unlock premium collabs & access</div>
            </div>
          </div>

          {/* Price section with subtle divider */}
          <div className="mt-6 pt-5 border-t border-purple-900/30">
            <div className="flex items-baseline gap-2">
              <div className="text-5xl font-black tracking-tight bg-gradient-to-br from-white via-purple-100 to-pink-200 bg-clip-text text-transparent">${plan.Price ?? 0}</div>
              <div className="text-zinc-400 text-sm font-medium">/ {plan.Renews || 'month'}</div>
            </div>
          </div>

          <ul className="mt-5 space-y-3">
            {(Array.isArray(plan.Features) ? plan.Features : []).slice(0, 3).map((f) => (
              <li key={f.Feature} className="flex items-start gap-3">
                <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-rose-500 to-purple-600 text-white/90 ring-1 ring-white/20">
                  ✓
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-zinc-200 text-sm font-semibold leading-tight break-words">
                    {f.Feature}
                  </div>
                  {f.About ? (
                    <div className="mt-1 text-xs text-zinc-400 break-words">
                      {f.About}
                    </div>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>

          {/* CTA section with enhanced button */}
          <div className="mt-7 flex flex-col items-center gap-3">
            <button className="relative h-12 w-full rounded-2xl text-sm font-bold text-white bg-gradient-to-r from-purple-700 via-pink-700 to-purple-800 shadow-[0_10px_40px_-10px_rgba(168,85,247,0.8),inset_0_1px_0_rgba(255,255,255,0.2)] hover:shadow-[0_15px_50px_-10px_rgba(168,85,247,1),inset_0_1px_0_rgba(255,255,255,0.3)] active:scale-[0.98] transition-all duration-200 overflow-hidden group">
              <span className="relative z-10">Upgrade to PRO</span>
              <div className="absolute inset-0 bg-gradient-to-r from-red-600 via-pink-600 to-red-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </button>
            <span className="text-sm text-purple-400 hover:text-purple-300 cursor-pointer transition-all duration-200 hover:underline underline-offset-2">
              See full benefits
            </span>
          </div>

          <p className="mt-4 pt-4 border-t border-purple-900/30 text-[10px] text-zinc-500 text-center">Cancel anytime. Prices shown in USD.</p>
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
