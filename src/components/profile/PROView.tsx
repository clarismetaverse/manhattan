import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { fetchPortfolio, type PortfolioItem, XanoError } from '@/services/xano';
import { Pin, Briefcase } from 'lucide-react';
import { CardShellWithInsetTab, insetTabPresets } from '@/components/profile/CardShellWithInsetTab';

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
              <CardShellWithInsetTab
                key={i}
                innerClassName="aspect-[16/10]"
                tabWidth={180}
                tabDepth={44}
                tabRoundness={0.7}
                tabSlot={null}
                className="rounded-xl"
              >
                <div className="h-full w-full animate-pulse bg-gray-200" />
              </CardShellWithInsetTab>
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
          <>
            {Array.isArray(portfolio) && portfolio.length ? (
              <div className="grid gap-4">
                {portfolio.map((p) => {
                  const cover =
                    p.Cover?.url ||
                    p.Hero?.url ||
                    p.Work_Body?.[0]?.url ||
                    'https://placehold.co/800x500?text=No+Cover';
                  const brands = (p.Brand || [])
                    .map((b) => b.LogoBrand?.url)
                    .filter(Boolean) as string[];
                  const brandName =
                    (p.Brand && p.Brand[0]?.BrandName) || 'Untitled Project';
                  const title = `${brandName}${p.Deliverables ? ' — ' + p.Deliverables : ''}`;

                  return (
                    <CardShellWithInsetTab
                      key={p.id}
                      tabPosition={insetTabPresets.left.tabPosition}
                      tabWidth={insetTabPresets.left.tabWidth}
                      tabDepth={insetTabPresets.left.tabDepth}
                      tabRoundness={insetTabPresets.left.tabRoundness}
                      className="relative cursor-pointer rounded-xl shadow transition-shadow hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-400"
                      innerClassName="aspect-[16/10]"
                      onClick={() => navigate(`/case/${p.id}`)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault();
                          navigate(`/case/${p.id}`);
                        }
                      }}
                      role="button"
                      tabIndex={0}
                      aria-label={`View project ${p.Name || brandName}`}
                      tabSlot={
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            /* open hire flow */
                          }}
                          className="rounded-full bg-gradient-to-r from-purple-500 to-blue-600 px-5 py-2 font-semibold text-white shadow-inner hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-400"
                          aria-label={`Hire for ${brandName}`}
                        >
                          Hire
                        </button>
                      }
                    >
                      <div className="relative h-full w-full">
                        <img
                          src={cover}
                          alt={title}
                          className="absolute inset-0 h-full w-full object-cover"
                          loading="lazy"
                        />

                        <div className="absolute bottom-3 left-3 flex max-w-[70%] items-center gap-2 rounded-full bg-black/40 px-3 py-1.5 backdrop-blur-sm">
                          {brands.length ? (
                            <img
                              src={brands[0] as string}
                              alt={`${brandName} logo`}
                              className="h-8 w-8 rounded-full border border-white/60 object-cover"
                            />
                          ) : (
                            <div className="flex h-8 w-8 items-center justify-center rounded-full border border-white/60 bg-white/70 text-[10px] text-gray-700">
                              LOGO
                            </div>
                          )}
                          <div className="min-w-0">
                            <div className="truncate text-sm font-semibold text-white">
                              {title}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardShellWithInsetTab>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-xl border border-gray-200 p-4 text-sm text-gray-600">
                No projects yet. Add your first editorial/marketing project from the studio.
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}

