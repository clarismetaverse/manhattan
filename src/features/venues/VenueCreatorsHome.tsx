import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, Lock, Search, Sparkles } from "lucide-react";

type CreatorLite = {
  id: number;
  name?: string;
  IG_account?: string;
  Tiktok_account?: string;
  Profile_pic?: { url?: string } | null;
};

const SEARCH_ENDPOINT =
  "https://xbut-eryu-hhsg.f2.xano.io/api:vGd6XDW3/search/user_turbo";

const getAuthToken = () =>
  localStorage.getItem("user_turbo_id_token") ||
  localStorage.getItem("user_turbo_token") ||
  localStorage.getItem("auth_token") ||
  "";

const formatHandle = (handle?: string) => {
  if (!handle) return "";
  return handle.startsWith("@") ? handle : `@${handle}`;
};

const avatarFallback = (creator: CreatorLite) =>
  (creator.name || "Creator").slice(0, 1).toUpperCase();

const stripFallback = (count: number) =>
  Array.from({ length: count }, (_, index) => ({ id: -1 - index } as CreatorLite));

const UGCChip = () => (
  <span className="inline-flex items-center gap-1 rounded-full bg-neutral-800 px-2 py-1 text-[11px] text-neutral-200">
    UGC
    <span className="text-[10px] text-neutral-400">UGC-ready</span>
  </span>
);

const TikTokChip = () => (
  <span className="rounded-full border border-pink-500/30 bg-pink-500/20 px-2 py-1 text-[11px] text-pink-200">
    TikTok
  </span>
);

function CreatorSearch({
  onResultsChange,
  onSelectCreator,
  onRecentlyViewed,
}: {
  onResultsChange: (results: CreatorLite[]) => void;
  onSelectCreator: (creator: CreatorLite) => void;
  onRecentlyViewed: (creator: CreatorLite) => void;
}) {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<CreatorLite[]>([]);
  const [active, setActive] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const boxRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    let alive = true;
    const handle = setTimeout(async () => {
      if (q.trim().length < 2) {
        setResults([]);
        onResultsChange([]);
        setLoading(false);
        setError(null);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const token = getAuthToken();
        const res = await fetch(SEARCH_ENDPOINT, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ q: q.trim() }),
        });

        if (!res.ok) throw new Error("Failed to fetch creators");
        const data = await res.json();
        const list = Array.isArray(data)
          ? data
          : Array.isArray(data?.items)
            ? data.items
            : Array.isArray(data?.results)
              ? data.results
              : [];
        if (!alive) return;
        setResults(list as CreatorLite[]);
        onResultsChange(list as CreatorLite[]);
        setActive(0);
      } catch (fetchError) {
        console.error(fetchError);
        if (!alive) return;
        setResults([]);
        onResultsChange([]);
        setError("Could not load creators.");
      } finally {
        if (alive) setLoading(false);
      }
    }, 220);

    return () => {
      alive = false;
      clearTimeout(handle);
    };
  }, [q, onResultsChange]);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!boxRef.current) return;
      if (!boxRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      setActive(a => Math.min(a + 1, Math.max(results.length - 1, 0)));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive(a => Math.max(a - 1, 0));
    } else if (e.key === "Enter") {
      if (open && results[active]) {
        e.preventDefault();
        const creator = results[active];
        onSelectCreator(creator);
        onRecentlyViewed(creator);
        setOpen(false);
      }
    }
  };

  return (
    <div ref={boxRef} className="relative">
      <div className="flex items-center gap-2 rounded-xl border border-neutral-700/60 bg-neutral-900 px-3 py-2 focus-within:ring-1 focus-within:ring-pink-500">
        <Search className="h-4 w-4 text-neutral-400" />
        <input
          ref={inputRef}
          value={q}
          onChange={event => {
            setQ(event.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder="Search creators"
          className="flex-1 bg-transparent text-sm text-neutral-100 placeholder-neutral-500 outline-none"
        />
      </div>

      {open && (
        <div className="absolute z-20 mt-2 w-full rounded-xl border border-neutral-800 bg-neutral-950 shadow-xl">
          {q.trim().length < 2 && !loading && (
            <div className="px-3 py-3 text-sm text-neutral-400">Type at least 2 characters</div>
          )}
          {loading && (
            <div className="space-y-2 px-3 py-3">
              {stripFallback(3).map(item => (
                <div key={item.id} className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-neutral-800 animate-pulse" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 w-1/2 rounded bg-neutral-800 animate-pulse" />
                    <div className="h-2 w-1/3 rounded bg-neutral-800 animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          )}
          {!loading && error && (
            <div className="px-3 py-3 text-sm text-rose-200">{error}</div>
          )}
          {!loading && !error && q.trim().length >= 2 && results.length === 0 && (
            <div className="px-3 py-3 text-sm text-neutral-400">No creators found</div>
          )}
          {!loading && results.length > 0 && (
            <div className="max-h-80 overflow-auto">
              {results.map((creator, index) => (
                <button
                  key={creator.id}
                  type="button"
                  onMouseEnter={() => setActive(index)}
                  onClick={() => {
                    onSelectCreator(creator);
                    onRecentlyViewed(creator);
                    setOpen(false);
                  }}
                  className={`flex w-full items-center gap-3 px-3 py-2 text-left hover:bg-neutral-900 ${
                    index === active ? "bg-neutral-900" : ""
                  }`}
                >
                  {creator.Profile_pic?.url ? (
                    <img
                      src={creator.Profile_pic.url}
                      alt=""
                      className="h-9 w-9 rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-9 w-9 rounded-full bg-neutral-800 grid place-items-center text-xs">
                      {avatarFallback(creator)}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm text-neutral-100">
                      {creator.name || `Creator ${creator.id}`}
                    </div>
                    {creator.IG_account && (
                      <a
                        href={`https://instagram.com/${creator.IG_account.replace(/^@/, "")}`}
                        target="_blank"
                        rel="noreferrer"
                        className="truncate text-xs text-neutral-400 hover:text-neutral-200"
                      >
                        {formatHandle(creator.IG_account)}
                      </a>
                    )}
                    <div className="mt-2 flex flex-wrap gap-2">
                      <UGCChip />
                      {creator.Tiktok_account && <TikTokChip />}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={event => {
                      event.stopPropagation();
                      console.log("View creator", creator);
                    }}
                    className="rounded-full border border-neutral-700/60 bg-neutral-900 px-2 py-1 text-[11px] text-neutral-200"
                  >
                    View
                  </button>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const SectionHeader = ({ title, subtitle }: { title: string; subtitle?: string }) => (
  <div className="flex items-center justify-between">
    <div>
      <h2 className="text-lg font-semibold text-neutral-100">{title}</h2>
      {subtitle && <p className="text-xs text-neutral-400 mt-1">{subtitle}</p>}
    </div>
    <button type="button" className="flex items-center gap-1 text-xs text-neutral-300">
      See all <ArrowRight className="h-3 w-3" />
    </button>
  </div>
);

const CreatorCard = ({ creator }: { creator: CreatorLite }) => (
  <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-4 min-w-[200px]">
    <div className="flex items-center gap-3">
      {creator.Profile_pic?.url ? (
        <img src={creator.Profile_pic.url} alt="" className="h-12 w-12 rounded-full object-cover" />
      ) : (
        <div className="h-12 w-12 rounded-full bg-neutral-800 grid place-items-center text-sm">
          {avatarFallback(creator)}
        </div>
      )}
      <div className="min-w-0">
        <div className="truncate text-sm font-medium text-neutral-100">
          {creator.name || `Creator ${creator.id}`}
        </div>
        <div className="mt-1 flex flex-wrap gap-2">
          <UGCChip />
          {creator.Tiktok_account && <TikTokChip />}
        </div>
      </div>
    </div>
    <button
      type="button"
      className="mt-4 w-full rounded-full border border-pink-500/40 bg-pink-500/10 px-3 py-2 text-xs font-medium text-pink-100"
    >
      Invite
    </button>
  </div>
);

const LockedCard = () => (
  <div className="relative min-w-[200px] rounded-2xl border border-neutral-800 bg-neutral-900/60 p-4 overflow-hidden">
    <div className="space-y-3">
      <div className="h-12 w-12 rounded-full bg-neutral-800" />
      <div className="h-3 w-1/2 rounded bg-neutral-800" />
      <div className="h-2 w-2/3 rounded bg-neutral-800" />
    </div>
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-neutral-950/60 backdrop-blur-[2px]">
      <Lock className="h-5 w-5 text-neutral-200" />
      <span className="text-xs text-neutral-200">Locked</span>
    </div>
  </div>
);

export default function VenueCreatorsHome() {
  const [selectedCreator, setSelectedCreator] = useState<CreatorLite | null>(null);
  const [searchResults, setSearchResults] = useState<CreatorLite[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<CreatorLite[]>([]);

  const city = localStorage.getItem("owner_city") || "your city";

  const trendingCreators = useMemo(() => {
    if (searchResults.length) return searchResults.slice(0, 6);
    return recentlyViewed.slice(0, 6);
  }, [searchResults, recentlyViewed]);

  const creatorsStrip = useMemo(() => {
    if (searchResults.length) return searchResults.slice(0, 6);
    if (recentlyViewed.length) return recentlyViewed.slice(0, 6);
    return [];
  }, [searchResults, recentlyViewed]);

  const newInCity = useMemo(() => {
    if (searchResults.length) return searchResults.slice(0, 3);
    return recentlyViewed.slice(0, 3);
  }, [searchResults, recentlyViewed]);

  const handleRecentlyViewed = (creator: CreatorLite) => {
    setRecentlyViewed(prev => {
      const next = [creator, ...prev.filter(item => item.id !== creator.id)];
      return next.slice(0, 6);
    });
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-50">
      <header className="sticky top-0 z-30 border-b border-neutral-800 bg-neutral-950/80 backdrop-blur">
        <div className="mx-auto flex max-w-md items-center justify-between px-4 py-4">
          <div>
            <h1 className="text-lg font-semibold">Discover creators</h1>
            <p className="text-xs text-neutral-400">Invite with your points</p>
          </div>
          <div className="rounded-full border border-neutral-800 bg-neutral-900 px-3 py-1 text-xs text-neutral-300">
            2,450 pts
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-md space-y-8 px-4 pb-12 pt-6">
        <section className="space-y-4">
          <CreatorSearch
            onResultsChange={setSearchResults}
            onSelectCreator={creator => {
              setSelectedCreator(creator);
              console.log("Selected creator", creator);
            }}
            onRecentlyViewed={handleRecentlyViewed}
          />
          {selectedCreator && (
            <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 px-3 py-2 text-xs text-neutral-300">
              Selected: <span className="text-neutral-100">{selectedCreator.name}</span>
            </div>
          )}
        </section>

        <section className="space-y-4">
          <SectionHeader title="Trending" subtitle="Based on current searches" />
          <div className="flex gap-3 overflow-x-auto pb-2">
            {trendingCreators.length === 0
              ? stripFallback(3).map(item => (
                  <div key={item.id} className="min-w-[160px] rounded-2xl bg-neutral-900/60 p-4">
                    <div className="h-10 w-10 rounded-full bg-neutral-800 animate-pulse" />
                    <div className="mt-3 h-3 w-2/3 rounded bg-neutral-800 animate-pulse" />
                    <div className="mt-2 h-2 w-1/2 rounded bg-neutral-800 animate-pulse" />
                  </div>
                ))
              : trendingCreators.map(creator => (
                  <div
                    key={creator.id}
                    className="min-w-[160px] rounded-2xl border border-neutral-800 bg-neutral-900/60 p-4"
                  >
                    <div className="flex items-center justify-between">
                      {creator.Profile_pic?.url ? (
                        <img
                          src={creator.Profile_pic.url}
                          alt=""
                          className="h-10 w-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-neutral-800 grid place-items-center text-xs">
                          {avatarFallback(creator)}
                        </div>
                      )}
                      <Sparkles className="h-4 w-4 text-pink-300" />
                    </div>
                    <div className="mt-3 text-sm text-neutral-100 truncate">
                      {creator.name || `Creator ${creator.id}`}
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <UGCChip />
                      {creator.Tiktok_account && <TikTokChip />}
                    </div>
                  </div>
                ))}
          </div>
        </section>

        <section className="space-y-4">
          <SectionHeader title="Creators" subtitle="UGC-first recommendations" />
          <div className="flex gap-3 overflow-x-auto pb-2">
            {creatorsStrip.length === 0
              ? stripFallback(3).map(item => (
                  <div key={item.id} className="min-w-[200px] rounded-2xl bg-neutral-900/60 p-4">
                    <div className="h-12 w-12 rounded-full bg-neutral-800 animate-pulse" />
                    <div className="mt-3 h-3 w-2/3 rounded bg-neutral-800 animate-pulse" />
                    <div className="mt-2 h-2 w-1/2 rounded bg-neutral-800 animate-pulse" />
                    <div className="mt-4 h-8 rounded-full bg-neutral-800 animate-pulse" />
                  </div>
                ))
              : creatorsStrip.map(creator => <CreatorCard key={creator.id} creator={creator} />)}
          </div>
        </section>

        <section className="space-y-4">
          <SectionHeader title="Premium list (Locked)" subtitle="Models & Pro creators" />
          <div className="flex gap-3 overflow-x-auto pb-2">
            {stripFallback(3).map(item => (
              <LockedCard key={item.id} />
            ))}
          </div>
          <button
            type="button"
            className="w-full rounded-full border border-pink-500/40 bg-pink-500/10 px-4 py-2 text-xs font-semibold text-pink-100"
          >
            Unlock with points
          </button>
        </section>

        <section className="space-y-4">
          <SectionHeader title={`New in ${city}`} />
          <div className="grid gap-3">
            {newInCity.length === 0
              ? stripFallback(3).map(item => (
                  <div key={item.id} className="rounded-2xl bg-neutral-900/60 p-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-neutral-800 animate-pulse" />
                      <div className="flex-1">
                        <div className="h-3 w-1/2 rounded bg-neutral-800 animate-pulse" />
                        <div className="mt-2 h-2 w-1/3 rounded bg-neutral-800 animate-pulse" />
                      </div>
                    </div>
                  </div>
                ))
              : newInCity.map(creator => (
                  <div
                    key={creator.id}
                    className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-4"
                  >
                    <div className="flex items-center gap-3">
                      {creator.Profile_pic?.url ? (
                        <img
                          src={creator.Profile_pic.url}
                          alt=""
                          className="h-10 w-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-neutral-800 grid place-items-center text-xs">
                          {avatarFallback(creator)}
                        </div>
                      )}
                      <div className="min-w-0">
                        <div className="truncate text-sm text-neutral-100">
                          {creator.name || `Creator ${creator.id}`}
                        </div>
                        {creator.IG_account && (
                          <div className="text-xs text-neutral-400">
                            {formatHandle(creator.IG_account)}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
          </div>
        </section>

        <section className="pt-4">
          <button
            type="button"
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-neutral-800 bg-neutral-900/60 px-4 py-3 text-sm text-neutral-200"
          >
            Saved &amp; Lists <ArrowRight className="h-4 w-4" />
          </button>
        </section>
      </main>
    </div>
  );
}
