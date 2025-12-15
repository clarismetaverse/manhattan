import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Circle, Bookmark, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

type Offer = {
  id: number;
  title: string;
  brand_guidelines: string;
  content_instructions: string;
  checklist: string[];
};

type Venue = {
  id: number;
  name: string;
  cover_url?: string;
};

export default function BookingPreviewConfirm() {
  const navigate = useNavigate();
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [scrolledToBottom, setScrolledToBottom] = useState(false);

  // TODO: replace with real selected venue/offer coming from app state or route params
  const venue: Venue = {
    id: 1,
    name: "Izzi Restaurant",
    cover_url:
      "https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?q=80&w=1200&auto=format&fit=crop",
  };

  // TODO: replace with real selected offer (from endpoint)
  const offer: Offer = {
    id: 101,
    title: "Creator Dinner Collab — Reel + Story",
    brand_guidelines:
      "Warm Scandinavian minimal. Keep colors natural and soft. Avoid heavy filters. Focus on calm, premium vibes. No loud captions, no meme edits.",
    content_instructions:
      "Capture: 1x venue exterior/entrance, 2x food close-ups, 1x ambience wide shot, 1x quick staff/service moment. Deliver: 1 Reel (8–12s) + 1 Story mention with tag.",
    checklist: [
      "Confirm date & time",
      "Read brand tone & style",
      "Confirm deliverables format",
      "Include venue tag in story",
      "No heavy filters / keep warm tones",
      "Shoot at least 2 food close-ups",
      "Upload within 24 hours",
    ],
  };

  const [checked, setChecked] = useState<Record<string, boolean>>({});

  const total = offer.checklist.length;
  const done = useMemo(
    () => offer.checklist.filter((x) => checked[x]).length,
    [offer.checklist, checked]
  );

  const toggleItem = (label: string) => {
    setChecked((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;

    const { scrollTop, clientHeight, scrollHeight } = el;
    setScrolledToBottom(scrollTop + clientHeight >= scrollHeight - 24);
  }, []);

  useEffect(() => {
    const timer = setTimeout(handleScroll, 0);
    return () => clearTimeout(timer);
  }, [handleScroll]);

  const canConfirm = scrolledToBottom;

  return (
    <div
      ref={scrollRef}
      onScroll={handleScroll}
      className="relative h-[100dvh] overflow-y-auto bg-black text-white"
    >
      {/* soft background aura */}
      <div className="pointer-events-none fixed inset-0 opacity-40">
        <div className="absolute -top-24 left-1/2 h-72 w-[520px] -translate-x-1/2 rounded-full bg-gradient-to-r from-fuchsia-600 via-rose-600 to-purple-700 blur-3xl" />
        <div className="absolute bottom-[-140px] left-[-120px] h-72 w-72 rounded-full bg-rose-600/40 blur-3xl" />
      </div>

      <div className="relative mx-auto w-full max-w-md px-4 pb-28 pt-5">
        {/* header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="flex items-center gap-3"
        >
          <button
            onClick={() => navigate(-1)}
            className="h-10 w-10 rounded-2xl border border-white/10 bg-zinc-900/60 backdrop-blur-xl flex items-center justify-center active:scale-[0.99]"
            aria-label="Back"
          >
            <ArrowLeft className="h-5 w-5 text-zinc-200" />
          </button>

          <div className="flex-1">
            <div className="text-sm text-zinc-400">Booking</div>
            <div className="text-lg font-semibold tracking-tight">Preview & Confirm</div>
          </div>

          <button
            // TODO: implement save-for-later behavior (local + backend)
            onClick={() => {}}
            className="h-10 px-3 rounded-2xl border border-white/10 bg-zinc-900/60 backdrop-blur-xl flex items-center gap-2 text-sm text-zinc-200 active:scale-[0.99]"
          >
            <Bookmark className="h-4 w-4" />
            Save
          </button>
        </motion.div>

        {/* venue/offer summary card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
          className="mt-4 relative overflow-hidden rounded-3xl border border-white/15 bg-zinc-950/70 backdrop-blur-xl shadow-[0_0_40px_-14px_rgba(236,72,153,0.45)]"
        >
          <div className="absolute inset-0 opacity-20 bg-gradient-to-br from-fuchsia-600 via-rose-600 to-purple-700" />
          <div className="relative p-4 flex gap-3">
            <div className="h-14 w-14 rounded-2xl overflow-hidden border border-white/10 bg-zinc-900 shrink-0">
              {venue.cover_url ? (
                <img
                  src={venue.cover_url}
                  alt={venue.name}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              ) : null}
            </div>

            <div className="min-w-0">
              <div className="text-sm text-zinc-300">Selected venue</div>
              <div className="font-semibold leading-tight truncate">{venue.name}</div>
              <div className="mt-1 text-xs text-zinc-400 truncate">{offer.title}</div>
            </div>
          </div>
        </motion.div>

        {/* brand guidelines */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="mt-4 rounded-3xl border border-white/15 bg-zinc-950/70 backdrop-blur-xl p-4"
        >
          <div className="text-sm font-semibold">Brand guidelines</div>
          <p className="mt-2 text-sm text-zinc-300 leading-relaxed">
            {offer.brand_guidelines}
          </p>
        </motion.div>

        {/* content instructions */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="mt-3 rounded-3xl border border-white/15 bg-zinc-950/70 backdrop-blur-xl p-4"
        >
          <div className="text-sm font-semibold">Content instructions</div>
          <p className="mt-2 text-sm text-zinc-300 leading-relaxed">
            {offer.content_instructions}
          </p>
        </motion.div>

        {/* checklist */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="mt-4 rounded-3xl border border-white/15 bg-zinc-950/70 backdrop-blur-xl p-4"
        >
          <div className="flex items-end justify-between">
            <div>
              <div className="text-sm font-semibold">To-do checklist</div>
              <div className="text-xs text-zinc-400 mt-1">
                {done}/{total} completed
              </div>
            </div>

            <div className="h-2 w-24 rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-rose-600 via-fuchsia-600 to-purple-700"
                style={{ width: `${total ? Math.round((done / total) * 100) : 0}%` }}
              />
            </div>
          </div>

          <div className="mt-3 space-y-2">
            {offer.checklist.map((item) => {
              const isOn = !!checked[item];
              return (
                <button
                  key={item}
                  onClick={() => toggleItem(item)}
                  className={`w-full text-left rounded-2xl border px-3 py-3 flex items-start gap-3 transition-colors ${
                    isOn
                      ? "border-white/15 bg-white/[0.06]"
                      : "border-white/10 bg-white/[0.03] hover:bg-white/[0.05]"
                  }`}
                >
                  <span className="mt-0.5">
                    {isOn ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-300" />
                    ) : (
                      <Circle className="h-5 w-5 text-zinc-500" />
                    )}
                  </span>
                  <span className={`text-sm leading-snug ${isOn ? "text-zinc-100" : "text-zinc-200"}`}>
                    {item}
                  </span>
                </button>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* sticky bottom bar */}
      <div className="fixed inset-x-0 bottom-0 z-50">
        <div className="pointer-events-none h-8 bg-gradient-to-t from-black to-transparent" />
        <div className="border-t border-white/15 bg-black/80 backdrop-blur-xl">
          {!canConfirm ? (
            <div className="mx-auto max-w-md px-4 pt-3 text-center text-xs text-zinc-400">
              Scroll to the bottom to enable confirmation
            </div>
          ) : null}

          <div className="mx-auto max-w-md px-4 py-3 flex items-center gap-3">
            <button
              disabled={!canConfirm}
              // TODO: call confirm booking endpoint
              onClick={() => {}}
              className={`h-12 flex-1 rounded-2xl text-sm font-semibold transition-all ${
                canConfirm
                  ? "bg-gradient-to-r from-rose-600 via-fuchsia-600 to-purple-700 text-white shadow-[0_12px_30px_-14px_rgba(168,85,247,0.8)]"
                  : "bg-zinc-800 text-zinc-400 cursor-not-allowed"
              }`}
            >
              Confirm booking
            </button>

            <button
              // TODO: implement save-for-later behavior
              onClick={() => {}}
              className="h-12 px-4 rounded-2xl border border-white/10 bg-zinc-950/40 text-sm text-zinc-200 hover:bg-white/[0.06]"
            >
              Save for later
            </button>
          </div>

          <div className="pb-[env(safe-area-inset-bottom)]" />
        </div>
      </div>
    </div>
  );
}
