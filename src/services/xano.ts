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

export const API = "https://xbut-eryu-hhsg.f2.xano.io/api:vGd6XDW3";

const UPLOAD_PATH = "/upload";

function authHeaders() {
  const h = new Headers();
  try {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("user_turbo_token");
      if (token) h.set("Authorization", `Bearer ${token}`);
    }
  } catch {
    // ignore access issues (e.g. server-side)
  }
  return h;
}

export async function request<T>(path: string, options: RequestInit = {}) {
  const headers = {
    Accept: "application/json",
    "Content-Type": "application/json",
    ...Object.fromEntries(authHeaders().entries()),
    ...(options.headers || {}),
  } as HeadersInit;

  const res = await fetch(`${API}${path}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    throw new Error(`${res.status} ${res.statusText}`);
  }

  return res.json() as Promise<T>;
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
  const ALLOWED = ["image/jpeg", "image/png", "image/webp"];
  let finalFile = file;

  if (!ALLOWED.includes(file.type)) {
    const lower = file.name.toLowerCase();
    if (file.type === "image/heic" || lower.endsWith(".heic")) {
      finalFile = await convertHeicToJpeg(file);
    } else {
      throw new Error("Unsupported format. Please upload JPG, PNG or WebP.");
    }
  }

  const form = new FormData();
  form.append("file", finalFile);

  const res = await fetch(`${API}${UPLOAD_PATH}`, {
    method: "POST",
    body: form,
    headers: authHeaders(),
  });

  if (!res.ok) {
    const msg = await res.text().catch(() => "");
    throw new Error(`Upload error ${res.status}: ${msg}`);
  }

  return res.json() as Promise<{ url: string }>;
}

export async function uploadFilesToXano(files: File[]) {
  const results = [];
  for (const f of files) results.push(await uploadFileToXano(f));
  return results;
}

async function convertHeicToJpeg(file: File): Promise<File> {
  const blob = await file.arrayBuffer();
  const imageBitmap = await createImageBitmap(new Blob([blob]));
  const canvas = document.createElement("canvas");
  canvas.width = imageBitmap.width;
  canvas.height = imageBitmap.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported");
  ctx.drawImage(imageBitmap, 0, 0);
  const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
  const bin = atob(dataUrl.split(",")[1]);
  const arr = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
  return new File([arr], file.name.replace(/\.heic$/i, ".jpg"), { type: "image/jpeg" });
}
