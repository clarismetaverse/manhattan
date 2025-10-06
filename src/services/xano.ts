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
  Profession?: string;
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
  Name?: string;
  About?: string;
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

const API = (import.meta.env.VITE_XANO_API || "https://xbut-eryu-hhsg.f2.xano.io/api:vGd6XDW3").replace(/\/$/, "");
const UPLOAD_PATH = import.meta.env.VITE_XANO_UPLOAD_PATH || "/upload";

function authHeadersForUpload(): Headers {
  const headers = new Headers();

  if (!headers.has("Authorization")) {
    let token = "";
    try {
      if (typeof window !== "undefined") {
        token = localStorage.getItem("auth_token") || "";
      }
    } catch {
      // ignore errors accessing localStorage
    }
    if (!token) {
      token = import.meta.env.VITE_XANO_TOKEN || "";
    }
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
  }

  return headers;
}

if (!API) {
  console.error("⚠️ Xano API URL missing");
  throw new Error("Missing Xano API URL");
}

export async function request<T>(path: string, options: RequestInit = {}) {
  // Build headers dynamically so we attach the logged-in auth token when available
  const headers = new Headers({
    Accept: "application/json",
    "Content-Type": "application/json",
  });
  if (options.headers) {
    const opt = new Headers(options.headers as HeadersInit);
    opt.forEach((value, key) => headers.set(key, value));
  }

  // If caller didn't provide Authorization, try localStorage token first, then env token
  if (!headers.has("Authorization")) {
    let token = "";
    try {
      if (typeof window !== "undefined") {
        token = localStorage.getItem("auth_token") || "";
      }
    } catch {
      // ignore errors accessing localStorage
    }
    if (!token) {
      token = import.meta.env.VITE_XANO_TOKEN || "";
    }
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
  }

  const res = await fetch(`${API}${path}`, {
    ...options,
    headers,
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
export async function fetchPortfolio() {
  const data = await request<PortfolioItem[] | PortfolioItem>("/portfolio");
  return Array.isArray(data) ? data : data ? [data as PortfolioItem] : [];
}

export async function uploadFileToXano(file: File) {
  const url = `${API}${UPLOAD_PATH}`;
  const form = new FormData();
  form.append("file", file);

  const headers = authHeadersForUpload();

  const res = await fetch(url, { method: "POST", body: form, headers });
  if (!res.ok) {
    const msg = await res.text().catch(() => res.statusText);
    throw Object.assign(new Error(`Upload error ${res.status}: ${msg}`), { status: res.status });
  }
  return res.json() as Promise<{ url: string } & Record<string, any>>;
}

export async function uploadFilesToXano(files: File[]) {
  const results = [];
  for (const f of files) {
    const r = await uploadFileToXano(f);
    results.push(r);
  }
  return results;
}
