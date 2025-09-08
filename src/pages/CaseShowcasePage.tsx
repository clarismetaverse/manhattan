import React, { useEffect, useState } from 'react';
import { ChevronLeft, BadgeCheck, MapPin, BarChart2, LinkIcon } from 'lucide-react';
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel';

// ---- Data Models ----
export interface KPI { key: string; label: string; value?: string; isPrivate?: boolean }
export interface Brand { name: string; logoUrl: string }
export interface Collaborator { role: string; handle?: string }
export interface Rights { usage: string; duration?: string; whitelisting?: boolean }
export interface CaseMedia { type: 'image' | 'video'; url: string; caption?: string }

export interface CaseProject {
  id: string;
  title: string;
  coverUrl: string;
  brands: Brand[];
  role: string;
  location?: string;
  moodboardNote?: string;
  collaborators: Collaborator[];
  deliverables: string[];
  rights?: Rights;
  kpis: KPI[];
  summary?: string;
  tier?: 'Bronze' | 'Silver' | 'Gold';
  shootHighlights?: CaseMedia[];
  campaignAssets?: CaseMedia[];
}

// ---- Small UI helpers ----
const TierBadge: React.FC<{ tier?: CaseProject['tier'] }> = ({ tier }) => {
  if (!tier) return null;
  const colors: Record<NonNullable<CaseProject['tier']>, string> = {
    Bronze: 'bg-amber-200 text-amber-800',
    Silver: 'bg-gray-200 text-gray-800',
    Gold: 'bg-yellow-300 text-yellow-800'
  };
  return <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-medium ${colors[tier]}`}>{tier}</span>;
};

const BrandStack: React.FC<{ brands: Brand[] }> = ({ brands }) => (
  <div className="absolute bottom-3 left-3 flex -space-x-2">
    {brands.slice(0, 3).map((b, i) => (
      <img key={i} src={b.logoUrl} alt={b.name} className="w-10 h-10 rounded-md border" />
    ))}
  </div>
);

const Chip: React.FC<React.PropsWithChildren> = ({ children }) => (
  <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-neutral-800 dark:text-gray-100 text-gray-700 border rounded-md">
    {children}
  </span>
);

const KpiCell: React.FC<{ kpi: KPI }> = ({ kpi }) => (
  <div className="p-3 border rounded-lg text-center bg-gray-50 dark:bg-neutral-800">
    <div className="text-[11px] text-gray-600 dark:text-gray-300">{kpi.label}</div>
    <div className="text-sm font-semibold mt-1">
      {kpi.isPrivate ? 'Contact to view' : kpi.value}
    </div>
  </div>
);

// ---- Page component ----
const CaseShowcasePage: React.FC = () => {
  const search = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  const requestedId = search?.get('id') ?? 'p1';

  const [project, setProject] = useState<CaseProject | null>(null);

  useEffect(() => {
    // Mock data for demo purposes
    const mockProject: CaseProject = {
      id: requestedId,
      title: "Summer Beauty Campaign",
      coverUrl: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&h=400&fit=crop",
      brands: [
        { name: "Beauty Co", logoUrl: "https://images.unsplash.com/photo-1611462985358-60d3498e0364?w=80&h=80&fit=crop" }
      ],
      role: "Content Creator",
      location: "Los Angeles, CA",
      moodboardNote: "Bright, natural lighting with a focus on fresh, dewy skin and vibrant colors.",
      collaborators: [
        { role: "Photographer", handle: "@johnsmith" },
        { role: "Makeup Artist", handle: "@makeupbypro" }
      ],
      deliverables: ["5 Feed Posts", "10 Stories", "2 Reels"],
      rights: {
        usage: "Social Media Only",
        duration: "6 months",
        whitelisting: true
      },
      kpis: [
        { key: "reach", label: "Reach", value: "2.5M" },
        { key: "engagement", label: "Engagement", value: "8.5%" },
        { key: "clicks", label: "Link Clicks", value: "15K" },
        { key: "conversions", label: "Conversions", isPrivate: true }
      ],
      summary: "A vibrant summer campaign focusing on natural beauty and fresh, dewy makeup looks.",
      tier: "Gold",
      shootHighlights: [
        {
          type: "image",
          url: "https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=600&h=400&fit=crop",
          caption: "Natural lighting setup"
        },
        {
          type: "image", 
          url: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600&h=400&fit=crop",
          caption: "Final beauty shots"
        }
      ]
    };
    
    setProject(mockProject);
  }, [requestedId]);

  if (!project) return null;

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100">
      <header className="sticky top-0 z-30 bg-white/80 dark:bg-neutral-900/80 backdrop-blur border-b border-neutral-200 dark:border-neutral-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-3">
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-1 text-sm px-2 py-1 rounded-md hover:bg-gray-100 dark:hover:bg-neutral-800"
          >
            <ChevronLeft className="w-4 h-4" /> Back
          </button>
          <div className="flex items-center gap-2 ml-auto">
            {project.brands[0] && (
              <img src={project.brands[0].logoUrl} alt={project.brands[0].name} className="w-7 h-7 rounded-md border" />
            )}
            <div className="text-sm font-medium truncate max-w-[40ch]">{project.title}</div>
            <TierBadge tier={project.tier} />
          </div>
        </div>
      </header>

      <section className="relative">
        <img src={project.coverUrl} alt={project.title} className="w-full max-h-[60vh] object-cover" />
        <BrandStack brands={project.brands} />
        <div className="absolute top-3 right-3 bg-black/70 text-white text-[11px] px-2 py-1 rounded-md uppercase tracking-wide">
          Sponsored Campaign
        </div>
      </section>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
        {/* Title + meta */}
        <h1 className="text-2xl font-bold">{project.title}</h1>
        <div className="mt-1 text-xs text-gray-600 dark:text-gray-400 flex items-center gap-3">
          <BadgeCheck className="w-3 h-3" /> {project.role}
          {project.location && (
            <>
              <MapPin className="w-3 h-3" /> {project.location}
            </>
          )}
        </div>
        {project.moodboardNote && (
          <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">{project.moodboardNote}</p>
        )}

        {/* Collaborators */}
        <section className="mt-6">
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">Collaborators</h2>
          <div className="flex flex-wrap gap-2">
            {project.collaborators.map((c, i) => (
              <Chip key={i}>
                {c.role} {c.handle && `• ${c.handle}`}
              </Chip>
            ))}
          </div>
        </section>

        {/* Pictures */}
        {project.shootHighlights && project.shootHighlights.length > 0 && (
          <section className="mt-6 -mx-4 sm:mx-0">
            <h2 className="px-4 text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">Pictures</h2>
            {/* Mobile carousel */}
            <div className="sm:hidden">
              <Carousel className="w-full">
                <CarouselContent>
                  {project.shootHighlights.map((m, i) => (
                    <CarouselItem key={i} className="relative w-full h-72">
                      {m.type === 'image' ? (
                        <img src={m.url} className="absolute inset-0 w-full h-full object-cover" />
                      ) : (
                        <video src={m.url} className="absolute inset-0 w-full h-full object-cover" controls />
                      )}
                      {m.caption && (
                        <figcaption className="absolute bottom-4 left-4 right-4 text-xs bg-black/40 text-white px-3 py-2 rounded-md">
                          {m.caption}
                        </figcaption>
                      )}
                    </CarouselItem>
                  ))}
                </CarouselContent>
              </Carousel>
            </div>
            {/* Desktop grid */}
            <div className="hidden sm:grid sm:grid-cols-2 sm:gap-4">
              {project.shootHighlights.map((m, i) => (
                <figure key={i} className="relative w-full h-80 overflow-hidden rounded-md">
                  {m.type === 'image' ? (
                    <img src={m.url} className="absolute inset-0 w-full h-full object-cover" />
                  ) : (
                    <video src={m.url} className="absolute inset-0 w-full h-full object-cover" controls />
                  )}
                  {m.caption && (
                    <figcaption className="absolute bottom-2 left-2 right-2 text-xs bg-black/40 text-white px-2 py-1 rounded-md">
                      {m.caption}
                    </figcaption>
                  )}
                </figure>
              ))}
            </div>
          </section>
        )}

        {/* Deliverables */}
        <section className="mt-6">
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">Deliverables</h2>
          <div className="flex flex-wrap gap-2">
            {project.deliverables.map((d, i) => (
              <span
                key={i}
                className="text-[11px] px-2 py-1 bg-gray-100 dark:bg-neutral-800 border rounded-md"
              >
                {d}
              </span>
            ))}
          </div>
        </section>

        {/* Campaign KPIs */}
        <section className="mt-8 rounded-2xl border p-4 bg-white dark:bg-neutral-900">
          <h2 className="text-xs flex items-center gap-2 mb-3">
            <BarChart2 className="w-4 h-4" /> Campaign KPIs
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {project.kpis.map((k) => (
              <KpiCell key={k.key} kpi={k} />
            ))}
          </div>
          {project.rights && (
            <div className="mt-4 text-[11px] bg-gray-100 dark:bg-neutral-800 rounded-md px-2 py-1">
              {project.rights.usage}{' '}
              {project.rights.duration && `• ${project.rights.duration}`}{' '}
              {project.rights.whitelisting && '• Whitelisting'}
            </div>
          )}
          {project.summary && <p className="mt-4 text-sm">{project.summary}</p>}
          <div className="mt-4 flex flex-col sm:flex-row gap-2">
            <button className="flex-1 sm:flex-none px-3 py-2 text-sm border rounded-lg bg-white dark:bg-neutral-900 hover:bg-gray-50 dark:hover:bg-neutral-800 inline-flex items-center justify-center gap-2">
              <LinkIcon className="w-4 h-4" /> View case study
            </button>
            <button className="flex-1 sm:flex-none px-3 py-2 text-sm border rounded-lg bg-white dark:bg-neutral-900 hover:bg-gray-50 dark:hover:bg-neutral-800">
              Contact for insights
            </button>
          </div>
        </section>

        {/* Narrative Sections */}
        <section className="mt-6 space-y-4">
          {project.summary && (
            <details className="border rounded-md p-3 bg-white dark:bg-neutral-900">
              <summary className="cursor-pointer text-sm font-medium">Concept</summary>
              <p className="mt-2 text-sm">{project.summary}</p>
            </details>
          )}
          {project.moodboardNote && (
            <details className="border rounded-md p-3 bg-white dark:bg-neutral-900">
              <summary className="cursor-pointer text-sm font-medium">Process</summary>
              <p className="mt-2 text-sm">{project.moodboardNote}</p>
            </details>
          )}
          {project.collaborators.length > 0 && (
            <details className="border rounded-md p-3 bg-white dark:bg-neutral-900">
              <summary className="cursor-pointer text-sm font-medium">Credits</summary>
              <ul className="mt-2 text-sm list-disc ml-4 space-y-1">
                {project.collaborators.map((c, i) => (
                  <li key={i}>
                    {c.role} {c.handle && `• ${c.handle}`}
                  </li>
                ))}
              </ul>
            </details>
          )}
        </section>
      </main>
    </div>
  );
};

export default CaseShowcasePage;
