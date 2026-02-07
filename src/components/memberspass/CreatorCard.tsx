import { useState } from "react";
import { Instagram, Lock, Music2 } from "lucide-react";
import type { CreatorLite } from "@/services/creatorSearch";
import CreatorProfileSheet from "@/components/memberspass/CreatorProfileSheet";

type CreatorCardProps = {
  creator: CreatorLite;
  locked?: boolean;
};

export default function CreatorCard({ creator, locked }: CreatorCardProps) {
  const [open, setOpen] = useState(false);
  const hasTikTok = Boolean(creator.Tiktok_account);
  const platformLabel = hasTikTok ? "TikTok creator" : "Instagram creator";

  return (
    <div className="relative w-[220px] shrink-0 snap-start">
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="group relative flex w-full flex-col overflow-hidden rounded-3xl border border-neutral-200 bg-white text-left shadow-[0_10px_30px_rgba(0,0,0,0.08)]"
      >
        <div className="relative h-44 w-full overflow-hidden">
          {creator.Profile_pic?.url ? (
            <img
              src={creator.Profile_pic.url}
              alt={creator.name || "Creator"}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-neutral-100 to-neutral-200" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
          {locked && (
            <div className="absolute inset-0 bg-white/40" />
          )}
          {locked && (
            <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-neutral-900 px-2 py-1 text-[10px] font-semibold text-white">
              <Lock className="h-3 w-3" />
              Locked
            </span>
          )}
        </div>
        <div className="space-y-2 px-4 pb-4 pt-3">
          <p className="truncate text-base font-semibold text-neutral-900">
            {creator.name || "Unnamed creator"}
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[11px] font-medium text-neutral-600">
              UGC-ready
            </span>
            <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[11px] font-medium text-neutral-600">
              UGC first
            </span>
            <span className="rounded-full bg-[#FFF1F4] px-2 py-0.5 text-[11px] font-medium text-[#FF5A7A]">
              {platformLabel}
            </span>
          </div>
          <div className="flex items-center gap-2 text-neutral-400">
            {creator.IG_account && <Instagram className="h-4 w-4" />}
            {creator.Tiktok_account && <Music2 className="h-4 w-4" />}
          </div>
        </div>
      </button>

      <CreatorProfileSheet creator={creator} open={open} onClose={() => setOpen(false)} locked={locked} />
    </div>
  );
}
