import { useState } from "react";
import { Music2, Sparkles } from "lucide-react";
import type { CreatorLite } from "@/services/creatorSearch";
import CreatorProfileSheet from "@/components/creators/CreatorProfileSheet";

type CreatorCardProps = {
  creator: CreatorLite;
  showSparkle?: boolean;
};

export default function CreatorCard({ creator, showSparkle }: CreatorCardProps) {
  const [open, setOpen] = useState(false);
  const hasTikTok = Boolean(creator.Tiktok_account);
  const badgeLabel = hasTikTok ? "TikTok" : "UGC-ready";

  return (
    <div className="w-64 shrink-0 snap-start">
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full overflow-hidden rounded-2xl border border-neutral-200 bg-white text-left shadow-sm transition hover:-translate-y-0.5"
      >
        <div className="relative">
          {creator.Profile_pic?.url ? (
            <img
              src={creator.Profile_pic.url}
              alt={creator.name || "Creator"}
              className="h-56 w-full object-cover"
            />
          ) : (
            <div className="h-56 w-full bg-gradient-to-br from-neutral-100 via-neutral-200 to-neutral-50" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
          <div className="absolute left-3 top-3 flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-white/80 px-2 py-1 text-[10px] font-medium text-neutral-800">
              UGC-ready
            </span>
            {hasTikTok && (
              <span className="inline-flex items-center gap-1 rounded-full bg-white/80 px-2 py-1 text-[10px] font-medium text-neutral-800">
                <Music2 className="h-3 w-3" />
                TikTok
              </span>
            )}
          </div>
          <div className="absolute bottom-4 left-4">
            <p className="text-base font-semibold text-white">
              {creator.name || "Unnamed creator"}
            </p>
          </div>
          <div className="absolute right-3 top-3 flex items-center gap-2">
            {showSparkle && (
              <span className="inline-flex items-center gap-1 rounded-full bg-white/80 px-2 py-1 text-[10px] font-medium text-neutral-800">
                <Sparkles className="h-3 w-3" />
                Trending
              </span>
            )}
            <span className="rounded-full bg-white/80 px-2 py-1 text-[10px] font-medium text-neutral-800">
              {badgeLabel}
            </span>
          </div>
        </div>

        <div className="px-4 pb-4 pt-3">
          <div className="flex items-center justify-between text-xs text-neutral-500">
            <span>Premium UGC creator</span>
            <span className="rounded-full bg-neutral-100 px-2 py-1 text-[11px] font-medium text-neutral-700">
              UGC-ready
            </span>
          </div>
        </div>
      </button>

      <CreatorProfileSheet creator={creator} open={open} onClose={() => setOpen(false)} />
    </div>
  );
}
