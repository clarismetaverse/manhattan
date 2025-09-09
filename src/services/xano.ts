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

const API = import.meta.env.VITE_XANO_API as string;
let TOKEN = import.meta.env.VITE_XANO_TOKEN as string;

/** Allow overriding the token at runtime (e.g., from AuthContext) */
export function setXanoToken(token: string) {
  TOKEN = token;
}

export class XanoError extends Error {
  status?: number;
  constructor(message: string, status?: number) {
    super(message);
    this.name = "XanoError";
    this.status = status;
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    ...options,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${TOKEN}`,
      ...(options.headers || {}),
    },
  });
  // Friendly handling of common statuses
  if (res.status === 429) throw new XanoError("Rate limit hit. Try again shortly.", 429);
  if (res.status === 401 || res.status === 403) throw new XanoError("Unauthorized. Check API token.", res.status);
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new XanoError(`Xano ${res.status}: ${text || res.statusText}`, res.status);
  }
  const ctype = (res.headers.get("content-type") || "").toLowerCase();
  if (!ctype.includes("application/json")) {
    const text = await res.text().catch(() => "");
    throw new XanoError(`Unexpected response format (expected JSON). Status ${res.status}.`, res.status);
  }
  return (await res.json()) as T;
}

export interface UserTurbo {
  id?: number;
  name?: string;
  Profile_pic?: XanoImage | null;
  City?: string;
  countryCode?: string;
  bio?: string;
  IG_account?: string | null;
  Tiktok_account?: string | null;
  InstagramApprovation?: boolean;
  Tiktokapprovation?: boolean;
}

export function fetchUserTurbo() {
  return request<UserTurbo>("/user_turbo");
}

// Returns a list of portfolio items for the authenticated user
export function fetchPortfolio() {
  return request<PortfolioItem[] | PortfolioItem>("/portfolio").then((r) =>
    Array.isArray(r) ? r : r ? [r] : []
  );
}

