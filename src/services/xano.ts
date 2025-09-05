export interface XanoImage {
  url?: string;
  name?: string;
  mime?: string;
  size?: number;
  meta?: { width?: number; height?: number };
}

export interface UserTurbo {
  id: number;
  name: string;
  IG_account?: string | null;
  Tiktok_account?: string | null;
  xp?: number;
  City?: string | null;
  countryCode?: string | null;
  IG?: boolean;
  TikTok?: boolean;
  InstagramApprovation?: boolean;
  Tiktokapprovation?: boolean;
  InstagramRejection?: boolean;
  TiktokRejection?: boolean;
  bio?: string | null;
  promocode?: string | null;
  Profile_pic?: XanoImage | null;
}

const API = import.meta.env.VITE_XANO_API as string;
const TOKEN = import.meta.env.VITE_XANO_TOKEN as string;
export class XanoError extends Error {
  status?: number;
  constructor(message: string, status?: number) {
    super(message);
    this.name = "XanoError";
    this.status = status;
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${TOKEN}`,
      ...(init.headers || {}),
    },
  });
  // Handle common failure statuses early
  if (res.status === 429) {
    throw new XanoError("Rate limit hit. Please wait a moment and try again.", 429);
  }
  if (res.status === 401 || res.status === 403) {
    throw new XanoError("Unauthorized. Check your API token or session.", res.status);
  }
  if (!res.ok) {
    // Try to read text for diagnostics
    const txt = await res.text().catch(() => "");
    throw new XanoError(`Xano ${res.status}: ${txt || res.statusText}`, res.status);
  }
  // Some error pages are HTML; only parse JSON when the content-type is json
  const ctype = res.headers.get("content-type") || "";
  if (!ctype.toLowerCase().includes("application/json")) {
    const txt = await res.text().catch(() => "");
    throw new XanoError(
      `Unexpected response format (expected JSON). Status ${res.status}.`,
      res.status
    );
  }
  return (await res.json()) as T;
}

export function fetchUserTurbo() {
  return request<UserTurbo>("/user_turbo");
}
