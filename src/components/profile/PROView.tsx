import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchPortfolio, type PortfolioItem, XanoError } from '@/services/xano';
import { Pin, Users, Briefcase } from 'lucide-react';

export default function PROView() {
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
              <div key={i} className="rounded-2xl bg-white shadow overflow-hidden">
                <div className="w-full h-40 sm:h-56 bg-gray-200 animate-pulse" />
                <div className="p-3 h-16 bg-gray-50" />
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
            {(portfolio ?? []).map((p) => {
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
              const team = p.Team || [];
              const preview = team.slice(0, 3);
              const extra = Math.max(0, team.length - preview.length);

              return (
                <div
                  key={p.id}
                  className="relative rounded-2xl overflow-hidden shadow bg-white"
                >
                  <div className="relative">
                    <img
                      src={cover}
                      alt={title}
                      className="w-full h-40 sm:h-56 object-cover"
                    />
                    {!!brands.length && (
                      <div className="absolute top-3 right-3 flex gap-2">
                        {brands.slice(0, 3).map((b, i) => (
                          <img
                            key={i}
                            src={b}
                            alt="brand"
                            className="w-16 h-16 rounded-md border-4 border-white shadow object-cover"
                          />
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="p-3 text-sm relative z-10 bg-white/80 backdrop-blur-sm">
                    <div className="font-semibold text-base">{title}</div>
                    <div className="mt-2 flex items-center gap-2">
                      <Users className="w-4 h-4 text-gray-500" />
                      <div className="flex -space-x-2">
                        {preview.map((m, i) => (
                          <img
                            key={i}
                            src={
                              m.Profile_pic?.url ||
                              "https://placehold.co/48x48?text=PRO"
                            }
                            alt={m.NickName || "pro"}
                            title={m.NickName || "pro"}
                            className="w-7 h-7 rounded-full border object-cover"
                          />
                        ))}
                        {extra > 0 && (
                          <div className="w-7 h-7 rounded-full border bg-gray-100 text-[10px] flex items-center justify-center">
                            +{extra}
                          </div>
                        )}
                      </div>
                      <span className="text-xs text-gray-500">
                        {team.length} collaborators
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
            {!portfolio?.length && (
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

