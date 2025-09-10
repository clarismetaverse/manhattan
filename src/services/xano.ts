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

const API = import.meta.env.VITE_XANO_API as string;
const TOKEN = import.meta.env.VITE_XANO_TOKEN as string;

export async function request<T>(path: string, options: RequestInit = {}) {
  const res = await fetch(`${API}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${TOKEN}`,
      ...(options.headers || {}),
    },
  });

  if (!res.ok) {
    let msg = res.statusText;
    try {
      const data = (await res.json()) as XanoError;
      msg = data?.message || msg;
    } catch {
      // ignore json parse errors
    }
    throw new Error(msg);
  }

  return res.json() as Promise<T>;
}

export function fetchUserTurbo() {
  return request<UserTurbo>("/user_turbo");
}

// Returns a list of portfolio items for the authenticated user
export function fetchPortfolio() {
  return request<PortfolioItem[]>("/portfolio");
}
