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
const TOKEN = import.meta.env.VITE_XANO_TOKEN as string;

export interface XanoError extends Error {
  status?: number;
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    ...options,
    headers: {
      ...(options.headers || {}),
      Authorization: `Bearer ${TOKEN}`,
    },
  });
  if (!res.ok) {
    const err = new Error(res.statusText) as XanoError;
    err.status = res.status;
    throw err;
  }
  return res.json() as Promise<T>;
}

export interface UserTurbo {
  id?: number;
  name?: string;
  Profile_pic?: XanoImage | null;
  City?: string;
  countryCode?: string;
  bio?: string;
}

export function fetchUserTurbo() {
  return request<UserTurbo>("/user_turbo");
}

// Returns a list of portfolio items for the authenticated user
export function fetchPortfolio() {
  return request<PortfolioItem[]>("/portfolio");
}

