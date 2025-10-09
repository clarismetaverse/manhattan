import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";
import { toast } from "@/hooks/use-toast";
import { PlaceCard, type Place } from "@/components/home/PlaceCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import SearchBar from "@/components/SearchBar";
import AdvancedFilterModal, { getActiveSelectionCount, type AdvancedFilterMap } from "@/components/filters/AdvancedFilterModal";
import WeekdayFilter from "@/components/filters/WeekdayFilter";
import BottomNavigation from "@/components/navigation/BottomNavigation";
import { Calendar, X, SlidersHorizontal, LogIn, Search as SearchIcon } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { searchPlaces, type PlaceLite } from "@/services/locations";

const API_URL = "https://xbut-eryu-hhsg.f2.xano.io/api:vGd6XDW3/getRestaurantNEW";


const Index = () => {
  const [page] = useState(1);
  const [cityId] = useState(3);
  const { user } = useAuth();
  const navigate = useNavigate();

  // Advanced filter modal state
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [advSelected, setAdvSelected] = useState<AdvancedFilterMap>({});
  const advCount = getActiveSelectionCount(advSelected);
  const [weekday, setWeekday] = useState<string[]>([]);
  const [isWeekdayOpen, setIsWeekdayOpen] = useState(false);
  const totalCount = advCount + weekday.length;
  const weekdayBtnRef = useRef<HTMLButtonElement | null>(null);
  const [searchQ, setSearchQ] = useState("");
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<PlaceLite[]>([]);
  const [showSearch, setShowSearch] = useState(false);


  useEffect(() => {
    // Ensure dark theme
    document.documentElement.classList.add("dark");
  }, []);


  const variables = useMemo(
    () => ({
      city_id: cityId,
      area: advSelected.area ?? [],
      category: advSelected.category ?? [],
      content: advSelected.content ?? [],
      booking: advSelected.booking ?? [],
      weekday,
      page,
      search: "",
    }),
    [cityId, advSelected, weekday, page]
  );

  // Debounce variables to avoid excessive fetches
  const [debouncedVars, setDebouncedVars] = useState(variables);
  useEffect(() => {
    const t = setTimeout(() => setDebouncedVars(variables), 250);
    return () => clearTimeout(t);
  }, [variables]);

  const { data, isLoading, isError, refetch, isFetching } = useQuery<Place[]>({
    queryKey: ["places", debouncedVars],
    queryFn: async ({ signal }) => {
      const v = debouncedVars;
      const base: Record<string, unknown> = { 
        city_id: v.city_id, 
        page: v.page, 
        search: v.search,
        area: v.area,
        category: v.category,
        content: v.content,
        booking: v.booking,
      };
      if ((v.weekday?.length ?? 0) > 0) base.weekday = v.weekday;

      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(base),
        signal,
      });
      if (!res.ok) throw new Error("Failed to load places");
      const json = await res.json();
      
      // Handle new grouped response format
      if (json.filt) {
        type RestaurantRecord = { id: number; [key: string]: unknown };
        const restaurantMap = new Map<number, RestaurantRecord>();

        Object.values(json.filt).forEach((group: unknown) => {
          if (Array.isArray(group)) {
            (group as RestaurantRecord[]).forEach((restaurant) => {
              if (restaurant?.id) {
                restaurantMap.set(restaurant.id, restaurant);
              }
            });
          } else if (group && typeof group === 'object' && 'id' in group) {
            const r = group as RestaurantRecord;
            restaurantMap.set(r.id, r);
          }
        });
        
        return Array.from(restaurantMap.values());
      }
      
      // Fallback for legacy format
      return Array.isArray(json) ? json : json.items ?? [];
    },
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (isError) {
      toast({ title: "Network error", description: "Could not fetch places." });
    }
  }, [isError]);


  useEffect(() => {
    let alive = true;
    const h = setTimeout(async () => {
      const q = searchQ.trim();
      if (q.length < 2) {
        if (alive) setSearchResults([]);
        return;
      }
      try {
        setSearching(true);
        const res = await searchPlaces(q);
        if (!alive) return;
        setSearchResults(res);
      } catch (e) {
        console.error("location search error", e);
        if (alive) setSearchResults([]);
      } finally {
        if (alive) setSearching(false);
      }
    }, 220);
    return () => {
      alive = false;
      clearTimeout(h);
    };
  }, [searchQ]);

  const toPlace = (p: PlaceLite) =>
    ({ id: p.id, Name: p.name, Cover: p.thumb ? { url: p.thumb } : undefined }) as unknown as Place;


  return (
    <div className="min-h-screen bg-black">
      <Helmet>
        <title>Tropical Collabs – Discover Places</title>
        <meta name="description" content="Search and discover tropical venues for influencer collaborations with a futuristic dark red design." />
        <link rel="canonical" href={window.location.origin + "/"} />
        <meta property="og:title" content="Tropical Collabs – Discover Places" />
        <meta property="og:description" content="Find beach clubs, cafes, and venues in paradise to collaborate effortlessly." />
        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            name: 'Tropical Collabs',
            url: window.location.origin + '/',
            potentialAction: {
              '@type': 'SearchAction',
              target: window.location.origin + '/?q={search_term_string}',
              'query-input': 'required name=search_term_string'
            }
          })}
        </script>
      </Helmet>

      <div className="relative mx-auto max-w-5xl px-4 pt-20 mt-6 sticky top-0 z-50">
        <div className="flex justify-between items-center mb-4">
          <div>
            {!user && (
              <Button
                onClick={() => navigate('/login')}
                variant="default"
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                <LogIn className="h-4 w-4 mr-2" />
                Login to View Bookings
              </Button>
            )}
          </div>
        </div>

        {/* ACTIONS ROW */}
        <div className="flex justify-end gap-2 mb-2">
          <Button
            ref={weekdayBtnRef}
            variant="outline"
            size="icon"
            aria-label="Toggle weekday filter"
            onClick={() => setIsWeekdayOpen((v) => !v)}
            className="relative z-40 rounded-2xl bg-card/60 border-border/60 backdrop-blur-xl"
          >
            <Calendar />
          </Button>

          <Button
            variant="glow"
            onClick={() => setIsAdvancedOpen(true)}
            aria-label="Open filters"
            className="rounded-3xl border border-border/60 backdrop-blur-xl bg-card/60"
          >
            <span className="inline-flex items-center">
              <SlidersHorizontal className="mr-2 h-4 w-4" />
              Filters
              {totalCount ? (
                <span className="ml-2 inline-flex items-center justify-center rounded-full px-2 py-0.5 text-xs bg-destructive text-destructive-foreground">
                  {totalCount}
                </span>
              ) : null}
            </span>
            {totalCount > 0 ? (
              <span
                role="button"
                tabIndex={0}
                aria-label="Clear filters"
                onClick={(e) => {
                  e.stopPropagation();
                  setAdvSelected({});
                  setWeekday([]);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    e.stopPropagation();
                    setAdvSelected({});
                    setWeekday([]);
                  }
                }}
                className="ml-2 inline-flex items-center justify-center rounded-full h-6 w-6 bg-background/50 border border-border/60"
              >
                <X className="h-3.5 w-3.5" />
              </span>
            ) : null}
          </Button>

          {/* NEW: Search toggle */}
          <Button
            variant="outline"
            size="icon"
            aria-label="Toggle search"
            onClick={() => setShowSearch((v) => !v)}
            className="rounded-2xl bg-card/60 border-border/60 backdrop-blur-xl"
          >
            <SearchIcon />
          </Button>
        </div>

        {/* COLLAPSIBLE SEARCH AREA */}
        <div
          className={[
            "overflow-hidden transition-all duration-250 ease-out",
            showSearch ? "max-h-24 mt-2" : "max-h-0",
            "z-50 relative",
          ].join(" ")}
        >
          <SearchBar
            value={searchQ}
            onChange={setSearchQ}
            onClose={() => setShowSearch(false)}
            autoFocus
            className="w-full"
          />
        </div>

        <WeekdayFilter
          isOpen={isWeekdayOpen}
          selectedDays={weekday}
          onDaysChange={(days) => setWeekday(days)}
          onClose={() => setIsWeekdayOpen(false)}
          toggleRef={weekdayBtnRef}
          className="top-12"
        />
      </div>

      <main className="mx-auto max-w-5xl px-4 pb-24 safe-pb">
        <div className="mt-4 rounded-2xl border border-border/60 bg-card/60 p-3 md:p-4 backdrop-blur-sm">
          {/* Keep the original skeleton for initial feed only (when not searching) */}
          {(isLoading || isFetching) && searchQ.trim().length < 2 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="overflow-hidden rounded-lg">
                  <Skeleton className="aspect-[16/10] w-full" />
                  <div className="p-4 space-y-2">
                    <Skeleton className="h-5 w-2/3" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {searchQ.trim().length >= 2 ? (
                searching ? (
                  <div className="col-span-full text-center py-6 text-muted-foreground">Searching…</div>
                ) : searchResults.length ? (
                  searchResults.map((p) => <PlaceCard key={p.id} place={toPlace(p)} />)
                ) : (
                  <div className="col-span-full text-center py-12">
                    <p className="text-muted-foreground">No venues found for “{searchQ}”.</p>
                  </div>
                )
              ) : data && data.length > 0 ? (
                data.map((p) => <PlaceCard key={p.id} place={p} />)
              ) : (
                <div className="col-span-full text-center py-12">
                  <p className="text-muted-foreground">No places found. Try different filters.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      <AdvancedFilterModal
        isOpen={isAdvancedOpen}
        onClose={() => setIsAdvancedOpen(false)}
        initialSelected={advSelected}
        onApply={(filterSelection) => {
          setAdvSelected(filterSelection);
        }}
      />
      
      <BottomNavigation />
    </div>
  );
};

export default Index;
