import { useState } from "react";
import { Lock } from "lucide-react";
import type { CreatorLite } from "@/services/creatorSearch";
import CreatorProfileSheet from "@/components/memberspass/CreatorProfileSheet";

type CreatorCardProps = {
  creator: CreatorLite;
  locked?: boolean;
};

export default function CreatorCard({ creator, locked }: CreatorCardProps) {
  const [open, setOpen] = useState(false);
  const img = creator.Profile_pic?.url;
  const isUgcReady = true;
  const isUgcFirst = true;

  return (
    <div className="relative w-full shrink-0 snap-start">
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="group relative w-full overflow-hidden rounded-3xl text-left shadow-[0_10px_30px_rgba(0,0,0,0.12)]"
      >
        <div className="relative h-[340px] w-full">
          {img ? (
            <img src={img} alt={creator.name || "Creator"} className="h-full w-full object-cover" />
          ) : (
            <div className="h-full w-full bg-neutral-100" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
          {locked && (
            <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-white/85 px-2 py-1 text-[10px] font-semibold text-neutral-900">
              <Lock className="h-3 w-3" />
              Premium
            </span>
          )}
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <div className="text-left">
              <p className="text-lg font-semibold text-white">
                {creator.name || "Unnamed creator"}
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                {isUgcReady && (
                  <span className="rounded-full bg-white/85 px-2 py-1 text-[11px] font-medium text-neutral-900">
                    UGC-ready
                  </span>
                )}
                {isUgcFirst && (
                  <span className="rounded-full bg-white/85 px-2 py-1 text-[11px] font-medium text-neutral-900">
                    UGC first
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </button>

      <CreatorProfileSheet creator={creator} open={open} onClose={() => setOpen(false)} locked={locked} />
    </div>
  );
}
