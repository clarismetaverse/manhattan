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
  status?: number;
  [key: string]: unknown;
}

const API = (import.meta.env.VITE_XANO_API || '').replace(/\/$/, '');
const TOKEN = import.meta.env.VITE_XANO_TOKEN as string;

export async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  if (!API) {
    const err = new Error(
      'Xano API base URL is not set (VITE_XANO_API).'
    ) as XanoError;
    err.status = 0;
    throw err;
  }

  const p = path.startsWith('/') ? path : `/${path}`;
  const url = `${API}${p}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      ...(options.headers || {}),
      Authorization: `Bearer ${TOKEN}`,
      Accept: 'application/json',
    },
  });

  if (!res.ok) {
    const err = new Error(res.statusText) as XanoError;
    err.status = res.status;
    throw err;
  }

  const ct = res.headers.get('content-type') || '';
  const text = await res.text();

  if (!ct.includes('application/json')) {
    const err = new Error(
      `Expected JSON from ${url}. Status ${res.status}. Content-Type: ${ct}. Body: ${text.slice(0,100)}…`
    ) as XanoError;
    err.status = res.status;
    throw err;
  }

  return JSON.parse(text) as T;
}

export function fetchUserTurbo() {
  return request<UserTurbo>("/user_turbo");
}

// Returns a list of portfolio items for the authenticated user
export function fetchPortfolio() {
  return request<PortfolioItem[]>("/portfolio");
}
