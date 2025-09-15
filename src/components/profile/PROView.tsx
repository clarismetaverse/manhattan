import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { fetchPortfolio, type PortfolioItem, XanoError } from '@/services/xano';
import { Pin, Briefcase } from 'lucide-react';
import { CardShellWithInsetTab, insetTabPresets } from './CardShellWithInsetTab';

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
                className="rounded-2xl"
                tabPosition={insetTabPresets.left.tabPosition}
                tabWidth={insetTabPresets.left.tabWidth}
                tabDepth={insetTabPresets.left.tabDepth}
                tabRoundness={insetTabPresets.left.tabRoundness}
                tabSlot={
                  <div className="h-9 w-28 rounded-full bg-slate-500/60" aria-hidden="true" />
                }
                innerClassName="h-full animate-pulse"
                backgroundClassName="bg-slate-800"
              >
                <div className="flex h-full flex-col">
                  <div className="h-40 w-full bg-slate-700/60 sm:h-56" />
                  <div className="flex-1 px-5 pb-6 pt-4">
                    <div className="h-3 w-1/2 rounded-full bg-slate-600/70" />
                    <div className="mt-3 h-3 w-3/4 rounded-full bg-slate-600/60" />
                    <div className="mt-3 h-3 w-2/3 rounded-full bg-slate-600/50" />
                  </div>
                </div>
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
              const deliverables = p.Deliverables?.trim();
              const about = p.About?.trim();

              return (
                <CardShellWithInsetTab
                  key={p.id}
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
                  className="group relative cursor-pointer rounded-2xl transition-shadow duration-200 hover:shadow-[0_24px_60px_-35px_rgba(99,102,241,0.75)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/70"
                  innerClassName="h-full"
                  tabPosition={insetTabPresets.left.tabPosition}
                  tabWidth={insetTabPresets.left.tabWidth}
                  tabDepth={insetTabPresets.left.tabDepth}
                  tabRoundness={insetTabPresets.left.tabRoundness}
                  tabSlot={
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                      }}
                      className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-violet-500 via-fuchsia-500 to-blue-500 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-fuchsia-500/30 transition duration-200 hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                    >
                      Hire
                    </button>
                  }
                >
                  <div className="flex h-full flex-col">
                    <div className="relative">
                      <img
                        src={cover}
                        alt={title}
                        className="h-40 w-full object-cover sm:h-56"
                        loading="lazy"
                      />

                      <div className="absolute bottom-4 left-4 flex items-center gap-3 rounded-full bg-black/45 px-3 py-1.5 backdrop-blur-sm">
                        {brands.length > 0 ? (
                          <img
                            src={brands[0] as string}
                            alt={`${brandName} logo`}
                            className="h-9 w-9 flex-shrink-0 rounded-full border border-white/60 object-cover"
                          />
                        ) : (
                          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border border-white/60 bg-white/80 text-[10px] font-semibold tracking-widest text-slate-600">
                            LOGO
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-white drop-shadow-sm">
                            {p.Name || 'Untitled Project'}
                          </p>
                          <p className="text-xs text-slate-200/80">
                            {brandName}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-1 flex-col justify-end px-5 pb-6 pt-4 text-sm text-slate-200/80">
                      {deliverables ? (
                        <>
                          <span className="text-xs uppercase tracking-[0.24em] text-indigo-200/70">
                            Deliverables
                          </span>
                          <p className="mt-2 font-medium text-slate-100">
                            {deliverables}
                          </p>
                        </>
                      ) : (
                        <p className="font-medium text-slate-100">
                          View the full case study
                        </p>
                      )}
                      {about ? (
                        <p className="mt-3 line-clamp-2 text-sm text-slate-300/80">
                          {about}
                        </p>
                      ) : null}
                    </div>
                  </div>
                </CardShellWithInsetTab>
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

