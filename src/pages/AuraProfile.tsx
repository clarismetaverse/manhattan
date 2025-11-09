import { useMemo, useState, type ReactNode } from "react";
import { Helmet } from "react-helmet-async";

import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import { AuraCarousel } from "@/components/AuraCarousel";
import { fetchAuraSelf, type AuraProfileRecord } from "@/services/aura";

/**
 * Aura Profile — mobile-first card stack
 * TailwindCSS required (uses backdrop-blur, rounded-2xl, etc.)
 * Drop this component anywhere; swap props as needed.
 */

export type AuraProfileTile = {
  url: string;
  type?: "photo" | "glass";
  label?: string;
  badge?: string;
};

export interface AuraProfileProps {
  coverUrl: string;
  credits?: number;
  name: string;
  subtitle?: string;
  ctaLabel?: string;
  tiles: AuraProfileTile[];
  pictures: string[];
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
  onClick,
}: {
  url: string;
  type?: "photo" | "glass";
  label?: string;
  badge?: string;
  onClick?: () => void;
}) {
  const baseClassName =
    "relative h-24 w-20 overflow-hidden rounded-xl border border-[#E3D3BB] bg-[#E9DEC9] shadow-[0_4px_10px_rgba(0,0,0,0.08)]";

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={`${baseClassName} cursor-pointer transition hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-300`}
        aria-label={label ? `View ${label} photo` : "View profile photo"}
      >
        <img
          src={url}
          alt={label ? `${label} preview` : "Aura gallery tile"}
          className="absolute inset-0 size-full object-cover"
          loading="lazy"
        />

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
      </button>
    );
  }

  return (
    <div className={baseClassName}>
      <img
        src={url}
        alt={label ? `${label} preview` : "Aura gallery tile"}
        className="absolute inset-0 size-full object-cover"
        loading="lazy"
      />

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
  onPrimaryImageClick,
}: {
  coverUrl: string;
  credits?: number;
  name: string;
  subtitle?: string;
  ctaLabel?: string;
  onPrimaryImageClick?: () => void;
}) {
  const isClickable = typeof onPrimaryImageClick === "function";

  return (
    <header className="rounded-3xl bg-[#1E1A18] p-3 shadow-[0_6px_16px_rgba(0,0,0,0.40)] border border-[#2A2522]">
      {isClickable ? (
        <button
          type="button"
          onClick={onPrimaryImageClick}
          className="group relative block h-[26rem] w-full overflow-hidden rounded-3xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-200"
          aria-label="Open profile photos"
        >
          <img
            src={coverUrl}
            alt={name}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

          <div className="absolute left-4 bottom-6 flex items-center gap-3 text-[14px] text-white/90">
            <Dot />
            <span className="tracking-wide">
              Aura Credits <strong className="pl-1">{credits}</strong>
            </span>
          </div>
        </button>
      ) : (
        <div className="relative overflow-hidden rounded-3xl">
          <img src={coverUrl} alt={name} className="h-[26rem] w-full object-cover" />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

          <div className="absolute left-4 bottom-6 flex items-center gap-3 text-[14px] text-white/90">
            <Dot />
            <span className="tracking-wide">
              Aura Credits <strong className="pl-1">{credits}</strong>
            </span>
          </div>
        </div>
      )}

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
  pictures,
  bio,
  career,
  personal,
  onOpenCarousel,
}: AuraProfileProps & { onOpenCarousel?: (index: number) => void }) {
  const pictureIndexByUrl = useMemo(() => {
    const map = new Map<string, number>();
    pictures.forEach((url, idx) => {
      if (!map.has(url)) map.set(url, idx);
    });
    return map;
  }, [pictures]);

  const canOpenCarousel = Boolean(onOpenCarousel && pictures.length);

  const openCarouselAt = (url: string | undefined) => {
    if (!canOpenCarousel || !onOpenCarousel) return;
    if (!url) {
      onOpenCarousel(0);
      return;
    }
    const index = pictureIndexByUrl.get(url) ?? 0;
    onOpenCarousel(index);
  };

  const coverIndex = pictureIndexByUrl.get(coverUrl) ?? 0;

  return (
    <div className="min-h-screen w-full bg-[#E9DEC9] p-3">
      <Helmet>
        <title>{`${name} · Aura Profile`}</title>
        <meta name="description" content={`Aura profile for ${name}. Explore credits, work highlights, and personal projects.`} />
        <link rel="canonical" href={window.location.href} />
      </Helmet>
      <div className="mx-auto max-w-sm space-y-3">
        <HeaderCard
          coverUrl={coverUrl}
          credits={credits}
          name={name}
          subtitle={subtitle}
          ctaLabel={ctaLabel}
          onPrimaryImageClick={canOpenCarousel ? () => openCarouselAt(pictures[coverIndex] ?? coverUrl) : undefined}
        />

        <div className="rounded-2xl border border-[#E3D3BB] bg-[#E3D3BB]/50 p-3 flex items-center justify-between gap-3 shadow-[0_4px_10px_rgba(0,0,0,0.10)]">
          {tiles.slice(0, 3).map((tile, index) => (
            <MiniTile
              key={`${tile.url}-${index}`}
              url={tile.url}
              type={tile.type}
              label={tile.label}
              badge={tile.badge}
              onClick={canOpenCarousel ? () => openCarouselAt(tile.url) : undefined}
            />
          ))}
        </div>

        <SectionCard title="Bio" body={bio} />
        <SectionCard title="Career Projects" body={career} />
        <SectionCard title="Personal Projects" body={personal} />
      </div>
    </div>
  );
}

const fallbackCoverUrl = "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=900&q=80";

const sampleTiles: AuraProfileTile[] = [
  {
    url: "https://images.unsplash.com/photo-1475180098004-ca77a66827be?auto=format&fit=crop&w=320&q=80",
    label: "Studio",
  },
  {
    url: "https://images.unsplash.com/photo-1499955085172-a104c9463ece?auto=format&fit=crop&w=320&q=80",
    type: "glass",
    label: "Aura IV",
    badge: "5",
  },
  {
    url: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=320&q=80",
    label: "Set",
  },
];

type TileCandidate = Partial<AuraProfileTile> & { url?: string | null | undefined };

const fallbackTiles: AuraProfileTile[] = sampleTiles;

const fallbackProfile: AuraProfileProps = {
  coverUrl: fallbackCoverUrl,
  name: "Johanna Mika",
  credits: 350,
  subtitle: "Finding a new life in UAE",
  ctaLabel: "Polas",
  tiles: fallbackTiles,
  pictures: Array.from(new Set([fallbackCoverUrl, ...sampleTiles.map((tile) => tile.url)])),
  bio: "I’m a solar, relatable personality with moderate ambition and interest to discover more of the world.",
  career:
    "Currently a student at the academy of journalism, I’d like to try some experience as TV anchor. I’m also exploring options in real estate.",
  personal: "I’m learning drawing and painting as self taught. I dream to make a family here in the UAE and move here.",
};

function toHandle(url?: string | null) {
  if (!url) return undefined;
  try {
    const value = new URL(url);
    const segments = value.pathname.split("/").filter(Boolean);
    if (segments[0]) return `@${segments[0]}`;
  } catch {
    if (url.startsWith("@")) return url;
  }
  return undefined;
}

function firstNonEmptyString(values: Array<unknown>) {
  for (const value of values) {
    if (typeof value === "string") {
      const trimmed = value.trim();
      if (trimmed) return trimmed;
    }
  }
  return undefined;
}

function firstValidNumber(values: Array<unknown>) {
  for (const value of values) {
    const num = typeof value === "number" ? value : Number(value);
    if (Number.isFinite(num)) return num;
  }
  return undefined;
}

function getImageUrl(input: unknown): string | undefined {
  if (!input) return undefined;
  if (typeof input === "string") return input;
  if (typeof input === "object" && "url" in (input as Record<string, unknown>)) {
    const maybe = (input as Record<string, unknown>).url;
    return typeof maybe === "string" && maybe ? maybe : undefined;
  }
  return undefined;
}

function normalizeTile(candidate: unknown): TileCandidate | undefined {
  if (!candidate || typeof candidate !== "object") return undefined;
  const record = candidate as Record<string, unknown>;
  const url = getImageUrl(record) ?? getImageUrl(record.image);
  if (!url) return undefined;

  const type = record.type === "glass" ? "glass" : record.type === "photo" ? "photo" : undefined;
  const label = typeof record.label === "string" ? record.label : undefined;
  const badgeRaw = record.badge;
  let badge: string | undefined;
  if (typeof badgeRaw === "number" && Number.isFinite(badgeRaw)) badge = String(badgeRaw);
  else if (typeof badgeRaw === "string" && badgeRaw.trim()) badge = badgeRaw.trim();

  return { url, type, label, badge };
}

function collectPictures(record: AuraProfileRecord | null | undefined): string[] {
  if (!record) return [];

  const urls: string[] = [];
  const seen = new Set<string>();
  const add = (value?: string) => {
    if (!value || seen.has(value)) return;
    urls.push(value);
    seen.add(value);
  };

  const recordMap = record as unknown as Record<string, unknown>;

  add(getImageUrl(record.cover));
  add(getImageUrl(record.Hero));
  add(getImageUrl(record.Cover));
  add(getImageUrl(recordMap.Profile_pic));

  if (Array.isArray(record?.tiles)) {
    for (const item of record.tiles) {
      const normalized = normalizeTile(item);
      if (normalized?.url) add(normalized.url);
    }
  }

  const galleryLike: unknown[] = [record?.gallery, record?.Work_Body, record?.Polas, record?.Polaroids]
    .filter(Array.isArray)
    .flat() as unknown[];

  for (const item of galleryLike) {
    add(getImageUrl(item));
  }

  return urls;
}

function collectTiles(record: AuraProfileRecord | null | undefined): AuraProfileTile[] {
  const tiles: AuraProfileTile[] = [];
  const seen = new Set<string>();

  const push = (candidate?: TileCandidate) => {
    const url = candidate?.url;
    if (!url || seen.has(url)) return;
    tiles.push({
      url,
      type: candidate?.type === "glass" ? "glass" : "photo",
      label: candidate?.label,
      badge: candidate?.badge,
    });
    seen.add(url);
  };

  const sources: TileCandidate[] = [];

  if (Array.isArray(record?.tiles)) {
    for (const item of record.tiles) {
      const normalized = normalizeTile(item);
      if (normalized) sources.push(normalized);
    }
  }

  const galleryLike: unknown[] = [record?.gallery, record?.Work_Body, record?.Polas, record?.Polaroids]
    .filter(Array.isArray)
    .flat() as unknown[];

  for (const item of galleryLike) {
    const url = getImageUrl(item);
    if (url) sources.push({ url });
  }

  if ((record as any)?.Profile_pic?.url) {
    sources.push({ url: (record as any).Profile_pic.url });
  }

  for (const candidate of sources) {
    push(candidate);
  }

  if (tiles.length < 3) {
    for (const fallback of fallbackTiles) {
      push(fallback);
      if (tiles.length >= 3) break;
    }
  }

  return tiles.slice(0, 3);
}

function mapAuraProfile(record: AuraProfileRecord | null | undefined): AuraProfileProps {
  if (!record) return fallbackProfile;

  const recordMap = record as unknown as Record<string, unknown>;

  const coverUrl =
    getImageUrl(record.cover) ||
    getImageUrl(record.Hero) ||
    getImageUrl(record.Cover) ||
    getImageUrl(recordMap.Profile_pic) ||
    fallbackProfile.coverUrl;

  const credits =
    firstValidNumber([record.credits, record.AuraCredits]) ?? fallbackProfile.credits ?? 0;

  const subtitle =
    firstNonEmptyString([
      toHandle(recordMap.IG_account as string | undefined),
      (recordMap.City && recordMap.countryCode)
        ? `${String(recordMap.City)}, ${String(recordMap.countryCode)}`
        : undefined,
      recordMap.City as string | undefined,
      recordMap.countryCode as string | undefined,
      recordMap.Profession as string | undefined,
    ]) ?? fallbackProfile.subtitle;

  const bio = firstNonEmptyString([recordMap.bio, recordMap.Bio] as unknown[]) ?? fallbackProfile.bio;

  const career =
    firstNonEmptyString([recordMap.career, recordMap.CareerProjects, recordMap.Career]) ?? fallbackProfile.career;

  const personal =
    firstNonEmptyString([recordMap.personal, recordMap.PersonalProjects, recordMap.Personal]) ?? fallbackProfile.personal;

  const ctaLabel = firstNonEmptyString([recordMap.ctaLabel]) ?? fallbackProfile.ctaLabel;

  const rawPictures = collectPictures(record);
  const pictures = (() => {
    const ordered = coverUrl
      ? [coverUrl, ...rawPictures.filter((url) => url !== coverUrl)]
      : rawPictures;
    return ordered.length ? ordered : fallbackProfile.pictures;
  })();

  return {
    coverUrl,
    credits,
    name: firstNonEmptyString([record.name, recordMap.NickName]) ?? fallbackProfile.name,
    subtitle,
    ctaLabel,
    tiles: collectTiles(record),
    pictures,
    bio,
    career,
    personal,
  };
}

const AuraProfilePage = () => {
  const [showCarousel, setShowCarousel] = useState(false);
  const [index, setIndex] = useState(0);

  const { data, isLoading, isError } = useQuery<AuraProfileProps, Error>({
    queryKey: ["aura-profile"],
    queryFn: async () => mapAuraProfile(await fetchAuraSelf()),
    staleTime: 5 * 60 * 1000,
  });

  const profile = useMemo(() => {
    if (data) return data;
    return fallbackProfile;
  }, [data]);

  const handleOpenCarousel = (startIndex: number) => {
    if (!profile.pictures.length) return;
    setIndex(startIndex);
    setShowCarousel(true);
  };

  if (isLoading && !data) {
    return (
      <div className="min-h-screen w-full bg-[#E9DEC9] flex items-center justify-center">
        <div className="flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 text-sm text-stone-700 shadow-lg">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Loading aura profile…</span>
        </div>
      </div>
    );
  }

  return (
    <>
      <AuraProfile {...profile} onOpenCarousel={handleOpenCarousel} />
      {isError ? (
        <div className="pointer-events-none fixed inset-x-0 bottom-4 flex justify-center px-4">
          <div className="pointer-events-auto rounded-full bg-stone-900/90 px-4 py-2 text-xs text-stone-100 shadow-lg">
            Unable to load aura profile. Showing preview data.
          </div>
        </div>
      ) : null}
      <AnimatePresence>
        {showCarousel && profile.pictures.length > 0 ? (
          <AuraCarousel
            pics={profile.pictures}
            index={index}
            setIndex={setIndex}
            onClose={() => setShowCarousel(false)}
          />
        ) : null}
      </AnimatePresence>
    </>
  );
};

export default AuraProfilePage;

