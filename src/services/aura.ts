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
  return request<AuraProfileRecord>("https://xbut-eryu-hhsg.f2.xano.io/api:bwh6Xc5O/Muser");
}
