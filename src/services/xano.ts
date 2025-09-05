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


async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${TOKEN}`,
      ...(init.headers || {}),
    },
  });

  }
  return (await res.json()) as T;
}

export function fetchUserTurbo() {
  return request<UserTurbo>("/user_turbo");
}
