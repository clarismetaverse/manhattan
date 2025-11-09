import { request, type UserTurbo, type XanoImage } from "./xano";

export interface AuraProfileTileRecord {
  url?: string | null;
  type?: "photo" | "glass" | null;
  label?: string | null;
  badge?: string | number | null;
}

export interface AuraProfileRecord extends UserTurbo {
  credits?: number | null;
  subtitle?: string | null;
  ctaLabel?: string | null;
  tiles?: AuraProfileTileRecord[] | null;
  career?: string | null;
  personal?: string | null;
  cover?: XanoImage | null;
  Hero?: XanoImage | null;
  Cover?: XanoImage | null;
  gallery?: (XanoImage | null)[] | null;
  Work_Body?: (XanoImage | null)[] | null;
  Polas?: (XanoImage | null)[] | null;
  Polaroids?: (XanoImage | null)[] | null;
  AuraCredits?: number | null;
}

export async function fetchAuraProfile(id: string | number) {
  const identifier = String(id ?? "").trim();
  if (!identifier) {
    throw new Error("Missing aura profile identifier");
  }

  const encodedId = encodeURIComponent(identifier);
  return request<AuraProfileRecord>(`/user_turbo/${encodedId}`);
}

export async function fetchAuraSelf() {
  const raw = await request<any>(
    "https://xbut-eryu-hhsg.f2.xano.io/api:bwh6Xc5O/Muser"
  );

  // The endpoint may return `{ result1, membe }`. Normalize it to AuraProfileRecord shape.
  if (raw && typeof raw === "object") {
    const r1 = (raw as any).result1 ?? raw;
    const membe = (raw as any).membe ?? {};

    const mapped: AuraProfileRecord = {
      ...(r1 as Record<string, unknown>),
      // Prefer top-level image fields if present; otherwise, tiles/galleries below
      Profile_pic: (r1 as any)?.Profile_pic ?? undefined,
      cover: (r1 as any)?.cover ?? undefined,
      Cover: (r1 as any)?.Cover ?? undefined,
      Hero: (r1 as any)?.Hero ?? undefined,
      // Map pictures list so UI can build tiles/carousel
      gallery: Array.isArray(membe?.Pictures) ? (membe.Pictures as any[]) : undefined,
      // Map credits fallback from xp if available
      AuraCredits: typeof (r1 as any)?.xp === "number" ? (r1 as any).xp : undefined,
    } as AuraProfileRecord;

    return mapped;
  }

  return raw as AuraProfileRecord;
}
