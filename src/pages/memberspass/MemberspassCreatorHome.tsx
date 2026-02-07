import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import CreatorCarousel from "@/components/creators/CreatorCarousel";
import CreatorSearchBar from "@/components/creators/CreatorSearchBar";
import FeaturedContentCard from "@/components/creators/FeaturedContentCard";
import { searchCreators, type CreatorLite } from "@/services/creatorSearch";

const placeholderCreators: CreatorLite[] = [
  {
    id: 1,
    name: "Aria Vela",
    IG_account: "aria.ugc",
    Tiktok_account: "ariaugc",
    Profile_pic: {
      url: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=600&q=80",
    },
  },
  {
    id: 2,
    name: "Luca Mendez",
    IG_account: "luca.m",
    Profile_pic: {
      url: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=600&q=80",
    },
  },
  {
    id: 3,
    name: "Kei Nakamura",
    Tiktok_account: "keinakama",
    Profile_pic: {
      url: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=600&q=80",
    },
  },
];

const featuredContent = [
  {
    title: "Best UGC — February",
    imageUrl:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80",
    creators: [
      {
        name: "Aria",
        avatar:
          "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=200&q=80",
      },
      {
        name: "Luca",
        avatar:
          "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80",
      },
    ],
  },
  {
    title: "Editors' Picks",
    imageUrl:
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80",
    creators: [
      {
        name: "Kei",
        avatar:
          "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=200&q=80",
      },
    ],
  },
];

export default function MemberspassCreatorHome() {
  const navigate = useNavigate();
  const [points] = useState(2450);
  const [city] = useState(() => {
    if (typeof window === "undefined") return "your city";
    return localStorage.getItem("owner_city") || "your city"; // TODO: replace with owner profile city.
  });

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<CreatorLite[]>([]);
  const [lastResults, setLastResults] = useState<CreatorLite[]>([]);
  const [selectedCreator, setSelectedCreator] = useState<CreatorLite | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let alive = true;
    const timeout = window.setTimeout(async () => {
      const term = query.trim();
      if (!term) {
        setResults([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const data = await searchCreators(term);
        if (!alive) return;
        setResults(data);
        if (data.length) setLastResults(data);
      } catch (error) {
        if (!alive) return;
        console.error("Creator search failed", error);
        setResults([]);
      } finally {
        if (alive) setLoading(false);
      }
    }, 220);

    return () => {
      alive = false;
      window.clearTimeout(timeout);
    };
  }, [query]);

  const displayCreators = useMemo(() => {
    return lastResults.length ? lastResults : placeholderCreators;
  }, [lastResults]);

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900">
      <div className="sticky top-0 z-20 border-b border-neutral-200 bg-neutral-50/90 backdrop-blur">
        <div className="mx-auto flex w-full max-w-md items-center justify-between px-4 py-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="rounded-full border border-neutral-200 p-2 text-neutral-600 hover:text-neutral-900"
            aria-label="Go back"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <h1 className="text-sm font-semibold text-neutral-900">Creators</h1>
          <span className="rounded-full border border-neutral-200 bg-white px-3 py-1 text-xs text-neutral-600">
            {points.toLocaleString()} pts
          </span>
        </div>
      </div>

      <div className="mx-auto w-full max-w-md px-4 pb-16 pt-6">
        <section>
          <h2 className="text-2xl font-semibold text-neutral-900">New in {city}</h2>
          <p className="mt-2 text-sm text-neutral-500">
            Invite creators using points you collected with Claris.
          </p>

          <div className="mt-5">
            <CreatorSearchBar
              value={query}
              onChange={setQuery}
              results={results}
              loading={loading}
              onSelect={(creator) => {
                setSelectedCreator(creator);
                setQuery(creator.name || "");
              }}
            />
          </div>

          {selectedCreator && (
            <div className="mt-3 flex items-center justify-between rounded-2xl border border-neutral-200 bg-white px-3 py-2 text-xs text-neutral-600">
              <span>
                Selected: <span className="font-medium text-neutral-900">{selectedCreator.name}</span>
              </span>
              <button
                type="button"
                className="text-xs text-neutral-500 hover:text-neutral-900"
                onClick={() => {
                  setSelectedCreator(null);
                  setQuery("");
                }}
              >
                Clear
              </button>
            </div>
          )}
        </section>

        <CreatorCarousel title={`New in ${city}`} creators={displayCreators} />
        <CreatorCarousel title="Trending" creators={displayCreators} showSparkle />

        <section className="mt-8">
          <div className="flex items-center justify-between px-4">
            <h2 className="text-base font-semibold text-neutral-900">Top featured content</h2>
            <span className="text-xs text-neutral-400">Swipe</span>
          </div>
          <div className="mt-4 flex gap-4 overflow-x-auto px-4 pb-2 snap-x snap-mandatory">
            {featuredContent.map((item) => (
              <FeaturedContentCard
                key={item.title}
                title={item.title}
                imageUrl={item.imageUrl}
                creators={item.creators}
              />
            ))}
          </div>
        </section>

        <section className="mt-8">
          <div className="flex items-center justify-between px-4">
            <div>
              <h2 className="text-base font-semibold text-neutral-900">Premium list</h2>
              <p className="mt-1 flex items-center gap-2 text-xs text-neutral-500">
                <Lock className="h-3 w-3" />
                Locked — Models & Pro influencers
              </p>
            </div>
            <button
              type="button"
              onClick={() => window.alert("Unlock flow coming soon.")}
              className="rounded-full border border-neutral-200 bg-white px-3 py-1 text-xs text-neutral-700"
            >
              Unlock with points
            </button>
          </div>
          <div className="mt-4 flex gap-4 overflow-x-auto px-4 pb-2 snap-x snap-mandatory">
            {[1, 2].map((item) => (
              <div
                key={item}
                className="relative w-64 shrink-0 snap-start overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-sm"
              >
                <div className="h-44 w-full bg-gradient-to-br from-neutral-100 to-neutral-200 blur-[2px]" />
                <div className="px-4 pb-4 pt-3 blur-[2px]">
                  <div className="h-4 w-24 rounded-full bg-neutral-200" />
                  <div className="mt-2 h-3 w-32 rounded-full bg-neutral-200" />
                </div>
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-white/70 text-center">
                  <Lock className="h-5 w-5 text-neutral-500" />
                  <p className="text-xs font-semibold text-neutral-700">Locked</p>
                  <p className="text-[11px] text-neutral-500">Requires 1,200 pts</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
