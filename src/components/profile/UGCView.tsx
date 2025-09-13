import React from 'react';
import { Pin, Briefcase, Users } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { fetchPortfolio, type PortfolioItem } from '@/services/xano';

export default function UGCView() {
  const { data: portfolio, isLoading, isError, error, refetch } = useQuery<PortfolioItem[]>({
    queryKey: ['portfolio'],
    queryFn: fetchPortfolio,
    staleTime: 5 * 60_000,
    refetchOnWindowFocus: false,
    retry: (count, err) => {
      const message = (err as Error)?.message?.toLowerCase?.() || '';
      if (message.includes('unauthorized') || message.includes('rate limit')) return false;
      return count < 2;
    },
  });
  return (
    <>
      <div className="mt-6">
        <div className="text-xs mb-2 flex items-center gap-1 text-gray-500">
          <Pin className="w-3 h-3" /> Pinned Collabs
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="h-36 rounded-xl bg-white shadow" />
          <div className="h-36 rounded-xl bg-white shadow" />
        </div>
      </div>
      <div className="mt-6">
        <div className="text-xs mb-2 flex items-center gap-1 text-gray-500">
          <Briefcase className="w-3 h-3" /> Editorial / Marketing Projects
        </div>
        {isLoading && (
          <div className="grid gap-4">
            {[1, 2].map((i) => (
              <div key={i} className="rounded-2xl bg-white shadow overflow-hidden">
                <div className="w-full h-40 sm:h-56 bg-gray-200 animate-pulse" />
                <div className="p-3 h-16 bg-gray-50" />
              </div>
            ))}
          </div>
        )}
        {isError && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 text-rose-700 p-4 text-sm">
            Couldn’t load portfolio. {(error as Error)?.message}
            <button onClick={() => refetch()} className="ml-2 underline">
              Retry
            </button>
          </div>
        )}
        {!isLoading && !isError && (
          <div className="grid gap-4">
            {(portfolio?.length ? portfolio : []).map((p) => {
              const cover =
                p.Cover?.url ||
                p.Hero?.url ||
                p.Work_Body?.[0]?.url ||
                'https://placehold.co/800x500?text=No+Cover';
              const brands = (p.Brand || [])
                .map((b) => b.LogoBrand?.url)
                .filter(Boolean) as string[];
              const brandName = (p.Brand && p.Brand[0]?.BrandName) || 'Untitled Project';
              const title = `${brandName}${p.Deliverables ? ' — ' + p.Deliverables : ''}`;
              const team = p.Team || [];
              const preview = team.slice(0, 3);
              const extra = Math.max(0, team.length - preview.length);
              return (
                <div key={p.id} className="relative rounded-2xl overflow-hidden shadow bg-white">
                  <div className="relative p-3">
                    {!!brands.length && (
                      <div className="flex gap-2 mb-3">
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
                            src={m.Profile_pic?.url || 'https://placehold.co/48x48?text=PRO'}
                            alt={m.NickName || 'pro'}
                            title={m.NickName || 'pro'}
                            className="w-7 h-7 rounded-full border object-cover"
                          />
                        ))}
                        {extra > 0 && (
                          <div className="w-7 h-7 rounded-full border bg-gray-100 text-[10px] flex items-center justify-center">
                            +{extra}
                          </div>
                        )}
                      </div>
                      <span className="text-xs text-gray-500">{team.length} collaborators</span>
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

