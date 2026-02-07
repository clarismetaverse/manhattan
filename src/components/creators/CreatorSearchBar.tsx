import { useEffect, useRef, useState } from "react";
import { Music2, Search } from "lucide-react";
import type { CreatorLite } from "@/services/creatorSearch";

type CreatorSearchBarProps = {
  value: string;
  onChange: (value: string) => void;
  results: CreatorLite[];
  loading?: boolean;
  onSelect: (creator: CreatorLite) => void;
};

export default function CreatorSearchBar({
  value,
  onChange,
  results,
  loading,
  onSelect,
}: CreatorSearchBarProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <div className="flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-4 py-3 shadow-sm">
        <Search className="h-4 w-4 text-neutral-400" />
        <input
          value={value}
          onChange={(event) => {
            onChange(event.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder="Search creators"
          className="w-full bg-transparent text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none"
        />
      </div>

      {open && (loading || results.length > 0 || value.trim()) && (
        <div className="absolute z-20 mt-2 w-full rounded-2xl border border-neutral-200 bg-white shadow-lg">
          {loading && (
            <div className="px-4 py-3 text-sm text-neutral-500">Searching creators…</div>
          )}
          {!loading &&
            results.map((creator) => (
              <button
                key={creator.id}
                type="button"
                onClick={() => {
                  onSelect(creator);
                  setOpen(false);
                }}
                className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-neutral-50"
              >
                {creator.Profile_pic?.url ? (
                  <img
                    src={creator.Profile_pic.url}
                    alt={creator.name || "Creator"}
                    className="h-8 w-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-neutral-200" />
                )}
                <div className="min-w-0">
                  <p className="text-sm font-medium text-neutral-900">
                    {creator.name || "Unnamed creator"}
                  </p>
                  {creator.Tiktok_account && (
                    <div className="mt-1 inline-flex items-center gap-1 rounded-full bg-neutral-100 px-2 py-0.5 text-[11px] text-neutral-500">
                      <Music2 className="h-3 w-3" />
                      TikTok
                    </div>
                  )}
                </div>
              </button>
            ))}
          {!loading && results.length === 0 && (
            <div className="px-4 py-3 text-sm text-neutral-500">No creators found.</div>
          )}
        </div>
      )}
    </div>
  );
}
