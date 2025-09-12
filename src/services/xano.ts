/**
 * Configure VITE_XANO_API and VITE_XANO_TOKEN in:
 * - Local: .env.local
 * - Lovable: Publish → Build Settings → Environment Variables
 */

export interface XanoImage {
  url?: string;
  name?: string;
  mime?: string;
  size?: number;
  meta?: { width?: number; height?: number };
}

export interface PortfolioBrand {
  id: number;
  BrandName?: string;
  LogoBrand?: XanoImage | null;
}

export interface PortfolioTeamMember {
  id: number;
  NickName?: string;
  Profile_pic?: XanoImage | null;
}

export interface PortfolioItem {
  id: number;
  production_id?: number;
  user_turbo_id?: number;
  Team?: PortfolioTeamMember[];
  Shooting_Location?: number | string;
  Deliverables?: string | null;
  Brand?: PortfolioBrand[];
  Cover?: XanoImage | null;
  Hero?: XanoImage | null;
  Work_Body?: XanoImage[];
  KPI?: Record<string, unknown>[];
  created_at?: number;
}

export interface UserTurbo {
  id: number;
  name?: string;
  Profile_pic?: XanoImage | null;
  City?: string;
  countryCode?: string;
  bio?: string;
}

export interface XanoError {
  message?: string;
  [key: string]: unknown;
}

const API = (import.meta.env.VITE_XANO_API || "").replace(/\/$/, "");
const TOKEN = import.meta.env.VITE_XANO_TOKEN || "";

if (!API || !TOKEN) {
  console.error(
    "⚠️ Xano config missing: please set VITE_XANO_API and VITE_XANO_TOKEN",
  );
  throw new Error("Missing Xano configuration");
}

export async function request<T>(path: string, options: RequestInit = {}) {
  const res = await fetch(`${API}${path}`, {
    ...options,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${TOKEN}`,
      ...(options.headers || {}),
    },
  });

  const contentType = res.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    const text = await res.text();
    console.error(text.slice(0, 100));
    throw new Error("Invalid response from Xano, expected JSON");
  }

  const data = (await res.json()) as unknown;

  if (!res.ok) {
    const msg = (data as XanoError)?.message || res.statusText;
    throw new Error(msg);
  }

  return data as T;
}

export function fetchUserTurbo() {
  return request<UserTurbo>("/user_turbo");
}

// Returns a list of portfolio items for the authenticated user
export function fetchPortfolio() {
  return request<PortfolioItem[]>("/portfolio");
}
