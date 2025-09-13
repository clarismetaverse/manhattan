import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { fetchPortfolio, type PortfolioItem, XanoError } from '@/services/xano';
import { Pin, Briefcase } from 'lucide-react';

export default function PROView() {
  const navigate = useNavigate();
  
  const {
    data: portfolio,
    isLoading: pfLoading,
    isError: pfErr,
    error: pfError,
    refetch: refetchPortfolio,
  } = useQuery<PortfolioItem[]>({
    queryKey: ['portfolio', 'pro-view'],
    queryFn: fetchPortfolio,
    staleTime: 5 * 60_000,
    refetchOnWindowFocus: false,
    retry: (count, err) => {
      const st = (err as unknown as XanoError)?.status as number | undefined;
      if (st === 401 || st === 403 || st === 429) return false;
      return count < 2;
    },
  });

  return (
    <>
      <div className="mt-6">
        <div className="text-xs mb-2 flex items-center gap-1 text-gray-400">
          <Pin className="w-3 h-3" /> Pinned Collabs
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="h-36 rounded-xl bg-white shadow" />
          <div className="h-36 rounded-xl bg-white shadow" />
        </div>
      </div>
      <div className="mt-6">
        <div className="text-xs text-gray-500 mb-2 flex items-center gap-1">
          <Briefcase className="w-3 h-3" /> Editorial / Marketing Projects
        </div>
        {pfLoading && (
          <div className="grid gap-4">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="relative rounded-lg overflow-hidden shadow bg-white"
              >
                <div className="w-full h-40 sm:h-56 bg-gray-200 animate-pulse" />
              </div>
            ))}
          </div>
        )}
        {pfErr && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 text-rose-700 p-4 text-sm">
            Couldn’t load portfolio. {(pfError as Error)?.message}
            <button onClick={() => refetchPortfolio()} className="ml-2 underline">Retry</button>
          </div>
        )}
        {!pfLoading && !pfErr && (
          <div className="grid gap-4">
            {Array.isArray(portfolio) && portfolio.map((p) => {
              const cover =
                p.Cover?.url ||
                p.Hero?.url ||
                p.Work_Body?.[0]?.url ||
                "https://placehold.co/800x500?text=No+Cover";
              const brands = (p.Brand || [])
                .map((b) => b.LogoBrand?.url)
                .filter(Boolean) as string[];
              const brandName =
                (p.Brand && p.Brand[0]?.BrandName) || "Untitled Project";
              const title = `${brandName}${p.Deliverables ? " — " + p.Deliverables : ""}`;

              return (
                <div
                  key={p.id}
                  onClick={() => navigate(`/case/${p.id}`)}
                  className="relative rounded-lg overflow-hidden shadow bg-white cursor-pointer hover:shadow-lg transition-shadow"
                >
                  {/* Cover full-bleed */}
                  <div className="relative">
                    <img
                      src={cover}
                      alt={title}
                      className="w-full h-40 sm:h-56 object-cover"
                      loading="lazy"
                    />

                    {/* Overlay pill stretta e centrata */}
                    <div className="absolute bottom-3 left-3 px-3 py-1.5 bg-black/40 backdrop-blur-sm rounded-full flex items-center gap-2 max-w-[60%]">
                      {/* Brand tondo: usa il primo logo disponibile se c'è */}
                      {brands.length > 0 ? (
                        <img
                          src={brands[0] as string}
                          alt={`${brandName} logo`}
                          className="w-9 h-9 rounded-full border border-white/60 object-cover flex-shrink-0"
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-white/80 border border-white/60 flex items-center justify-center text-[10px] text-gray-600 flex-shrink-0">
                          LOGO
                        </div>
                      )}

                      {/* Titolo compatto, tronco se lungo */}
                      <div className="min-w-0">
                        <div className="text-white text-sm font-semibold truncate">
                          {p.Name || "Untitled Project"}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            {(!Array.isArray(portfolio) || !portfolio.length) && (
              <div className="rounded-xl border border-gray-200 p-4 text-sm text-gray-600">
                No projects yet. Add your first editorial/marketing project from the studio.
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}

