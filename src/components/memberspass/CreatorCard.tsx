import { useState } from "react";
import { Lock, Star } from "lucide-react";
import type { CreatorLite } from "@/services/creatorSearch";
import CreatorProfileSheet from "@/components/memberspass/CreatorProfileSheet";

type CreatorCardProps = {
  creator: CreatorLite;
  locked?: boolean;
  variant?: "default" | "vic";
};

export default function CreatorCard({
  creator,
  locked,
  variant = "default",
}: CreatorCardProps) {
  const [open, setOpen] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const img = creator.Profile_pic?.url;
  const isUgcReady = true;
  const isUgcFirst = true;
  const isVic = variant === "vic";

  return (
    <div className="relative w-full shrink-0 snap-start">
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="group relative w-full overflow-hidden rounded-3xl border border-neutral-200 text-left shadow-[0_10px_30px_rgba(0,0,0,0.08)] transition-transform duration-200 ease-out hover:scale-[1.02] hover:shadow-xl active:scale-[0.98]"
      >
        <div className="relative h-[300px] w-full overflow-hidden rounded-3xl">
          {img ? (
            <img
              src={img}
              alt={creator.name || "Creator"}
              className={`h-full w-full object-cover ${locked ? "filter blur-[2px]" : ""}`}
            />
          ) : (
            <div className="h-full w-full bg-neutral-100" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          {locked && <div className="absolute inset-0 bg-black/40" />}
          {locked && (
            <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-white/90 px-2 py-1 text-xs font-semibold text-neutral-800">
              <Lock className="h-3 w-3" />
              Premium
            </span>
          )}
          <div className="absolute bottom-4 left-4 text-left text-white">
            <div>
              <p className="text-lg font-semibold text-white">
                {creator.name || "Unnamed creator"}
              </p>
              {!isVic && (
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  {isUgcReady && (
                    <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-medium text-white backdrop-blur">
                      UGC-ready
                    </span>
                  )}
                  {isUgcFirst && (
                    <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-medium text-white backdrop-blur">
                      UGC first
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </button>
      {isVic && (
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            setIsFavorite((prev) => !prev);
          }}
          aria-pressed={isFavorite}
          aria-label={isFavorite ? "Remove favourite" : "Add favourite"}
          className="absolute right-3 top-3 z-10 rounded-full bg-white/90 p-2 text-neutral-800 shadow-md transition hover:scale-105 active:scale-95"
        >
          <Star className={isFavorite ? "h-4 w-4 fill-neutral-900" : "h-4 w-4"} />
        </button>
      )}

      <CreatorProfileSheet
        creator={creator}
        open={open}
        onClose={() => setOpen(false)}
        locked={locked}
        variant={variant}
        isFavorite={isFavorite}
        onToggleFavorite={() => setIsFavorite((prev) => !prev)}
      />
    </div>
  );
}
