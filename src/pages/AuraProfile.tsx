import type { ReactNode } from "react";

/**
 * Aura Profile — mobile-first card stack
 * TailwindCSS required (uses backdrop-blur, rounded-2xl, etc.)
 * Drop this component anywhere; swap props as needed.
 */

export interface AuraProfileProps {
  coverUrl: string;
  credits?: number;
  name: string;
  subtitle?: string;
  ctaLabel?: string;
  tiles: Array<{ url: string; type?: "photo" | "glass"; label?: string; badge?: string }>;
  bio: string;
  career: string;
  personal: string;
}

const Pill = ({ children }: { children: ReactNode }) => (
  <span className="inline-flex items-center gap-2 rounded-xl bg-amber-100/90 text-stone-900 px-3 py-1 text-[13px] font-medium shadow-sm">
    {children}
  </span>
);

const Dot = ({ className = "" }: { className?: string }) => (
  <span className={`inline-block size-2 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(242,212,166,0.9)] ${className}`} />
);

function SectionCard({ title, body }: { title: string; body: string }) {
  return (
    <section className="rounded-2xl border border-[#E3D3BB] bg-[#E9DEC9] p-5 shadow-[0_4px_10px_rgba(0,0,0,0.10)]">
      <h3 className="text-stone-900 text-xl font-semibold mb-3">{title}</h3>
      <p className="text-stone-700 leading-6 text-[14px]">{body}</p>
    </section>
  );
}

function MiniTile({
  url,
  type = "photo",
  label,
  badge,
}: {
  url: string;
  type?: "photo" | "glass";
  label?: string;
  badge?: string;
}) {
  return (
    <div className="relative h-24 w-20 rounded-xl overflow-hidden border border-[#E3D3BB] bg-[#E9DEC9] shadow-[0_4px_10px_rgba(0,0,0,0.08)]">
      <img src={url} alt={label ?? "tile"} className="absolute inset-0 size-full object-cover" />

      {type === "glass" ? (
        <div className="absolute inset-0 rounded-xl bg-white/15 backdrop-blur-xl border border-white/25" />
      ) : null}

      {badge ? (
        <div className="absolute left-2 top-2">
          <span className="inline-flex items-center justify-center rounded-full border border-white/30 bg-white/15 backdrop-blur-md px-2.5 py-1 text-[11px] text-white/90">
            {badge}
          </span>
        </div>
      ) : null}

      {label ? (
        <div className="absolute bottom-2 right-2">
          <span className="text-[11px] text-white/90">{label}</span>
        </div>
      ) : null}
    </div>
  );
}

function HeaderCard({
  coverUrl,
  credits = 0,
  name,
  subtitle,
  ctaLabel = "Polas",
}: {
  coverUrl: string;
  credits?: number;
  name: string;
  subtitle?: string;
  ctaLabel?: string;
}) {
  return (
    <header className="rounded-3xl bg-[#1E1A18] p-3 shadow-[0_6px_16px_rgba(0,0,0,0.40)] border border-[#2A2522]">
      <div className="relative overflow-hidden rounded-3xl">
        <img src={coverUrl} alt={name} className="h-80 w-full object-cover" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

        <div className="absolute left-4 bottom-6 flex items-center gap-3 text-[14px] text-white/90">
          <Dot />
          <span className="tracking-wide">
            Aura Credits <strong className="pl-1">{credits}</strong>
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 px-2 pt-4 pb-1">
        <div className="min-w-0">
          <h2 className="text-white text-[20px] font-semibold truncate">{name}</h2>
          {subtitle ? (
            <p className="text-white/60 text-[13px] italic mt-0.5 truncate">{subtitle}</p>
          ) : null}
        </div>
        <Pill>{ctaLabel}</Pill>
      </div>

      <div className="flex items-center gap-2 px-2 pb-3">
        <Dot className="bg-amber-600" />
        <span className="text-[13px] text-white/80">Imperial Selection</span>
      </div>
    </header>
  );
}

export function AuraProfile({
  coverUrl,
  credits = 350,
  name,
  subtitle = "Finding a new life in UAE",
  ctaLabel = "Polas",
  tiles,
  bio,
  career,
  personal,
}: AuraProfileProps) {
  return (
    <div className="min-h-screen w-full bg-[#E9DEC9] p-3">
      <div className="mx-auto max-w-sm space-y-3">
        <HeaderCard coverUrl={coverUrl} credits={credits} name={name} subtitle={subtitle} ctaLabel={ctaLabel} />

        <div className="rounded-2xl border border-[#E3D3BB] bg-[#E3D3BB]/50 p-3 flex items-center justify-between gap-3 shadow-[0_4px_10px_rgba(0,0,0,0.10)]">
          {tiles.slice(0, 3).map((tile, index) => (
            <MiniTile key={`${tile.url}-${index}`} url={tile.url} type={tile.type} label={tile.label} badge={tile.badge} />
          ))}
        </div>

        <SectionCard title="Bio" body={bio} />
        <SectionCard title="Career Projects" body={career} />
        <SectionCard title="Personal Projects" body={personal} />
      </div>
    </div>
  );
}

const sampleTiles = [
  {
    url: "https://images.unsplash.com/photo-1475180098004-ca77a66827be?auto=format&fit=crop&w=320&q=80",
    label: "Studio",
  },
  {
    url: "https://images.unsplash.com/photo-1499955085172-a104c9463ece?auto=format&fit=crop&w=320&q=80",
    type: "glass" as const,
    label: "Aura IV",
    badge: "5",
  },
  {
    url: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=320&q=80",
    label: "Set",
  },
];

const AuraProfilePage = () => (
  <AuraProfile
    coverUrl="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=900&q=80"
    name="Johanna Mika"
    credits={350}
    subtitle="Finding a new life in UAE"
    ctaLabel="Polas"
    tiles={sampleTiles}
    bio="I’m a solar, relatable personality with moderate ambition and interest to discover more of the world."
    career="Currently a student at the academy of journalism, I’d like to try some experience as TV anchor. I’m also exploring options in real estate."
    personal="I’m learning drawing and painting as self taught. I dream to make a family here in the UAE and move here."
  />
);

export default AuraProfilePage;

