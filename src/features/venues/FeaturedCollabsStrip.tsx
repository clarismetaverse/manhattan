import React from "react";

type FeaturedCollab = {
  id: string;
  creatorHandle: string;
  contentType: string; // e.g. "3 × Story", "Reel"
  badge?: string;      // e.g. "Top pick"
  imageUrl: string;
};

interface FeaturedCollabsStripProps {
  collabs: FeaturedCollab[];
  onViewAll?: () => void;
}

export function FeaturedCollabsStrip({
  collabs,
  onViewAll,
}: FeaturedCollabsStripProps) {
  if (!collabs?.length) return null;

  return (
    <section className="mt-5 space-y-3">
      {/* Header row */}
      <div className="flex items-baseline justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-gray-900">
            Featured collabs
          </h2>
          <p className="mt-0.5 text-xs text-gray-500">
            Real content from creators who visited
          </p>
        </div>

        <button
          type="button"
          onClick={onViewAll}
          className="shrink-0 rounded-full bg-white/70 px-3 py-1 text-[11px] font-medium text-gray-700 shadow-[0_10px_25px_rgba(15,23,42,0.08)] hover:bg-white"
        >
          View more&nbsp;&rsaquo;
        </button>
      </div>

      {/* Horizontal strip */}
      <div className="-mx-5 overflow-x-auto pb-1">
        <div className="flex gap-3 px-5">
          {collabs.map((c) => (
            <button
              key={c.id}
              type="button"
              className="group relative flex min-w-[210px] max-w-[230px] flex-col overflow-hidden rounded-2xl bg-white text-left shadow-[0_16px_40px_rgba(15,23,42,0.12)]"
            >
              {/* Image */}
              <div
                className="h-[190px] w-full bg-cover bg-center"
                style={{ backgroundImage: `url(${c.imageUrl})` }}
              />

              {/* Top badge */}
              {c.badge && (
                <div className="pointer-events-none absolute left-3 top-3">
                  <span className="inline-flex items-center rounded-full bg-white/95 px-3 py-1 text-[11px] font-medium text-gray-800 shadow-[0_10px_25px_rgba(15,23,42,0.35)]">
                    {c.badge}
                  </span>
                </div>
              )}

              {/* Bottom info */}
              <div className="flex flex-1 flex-col gap-0.5 px-3 pb-3 pt-2">
                <p className="text-sm font-semibold text-gray-900">
                  {c.creatorHandle}
                </p>
                <p className="text-xs text-gray-500">{c.contentType}</p>
              </div>

              {/* Pink underline accent – Claris vibe */}
              <div className="h-1 w-full bg-gradient-to-r from-[#ff4b6a] via-[#ff8ab5] to-[#ffc2dd]" />
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
