const API = "https://xbut-eryu-hhsg.f2.xano.io/api:vGd6XDW3";

function getToken() {
  return (
    localStorage.getItem("user_turbo_id_token") ||
    localStorage.getItem("user_turbo_token") ||
    localStorage.getItem("auth_token") ||
    ""
  );
}

export type UserLite = {
  id: string | number;
  name?: string | null;
  handle?: string | null;
  avatar?: { url?: string } | null;
};

function igHandle(url?: string | null) {
  if (!url) return null;
  try {
    const u = new URL(url);
    const seg = u.pathname.split("/").filter(Boolean)[0];
    return seg ? `@${seg}` : null;
  } catch {
    return null;
  }
}

function makeSyntheticId(item: any, index: number) {
  return (
    item?.id ??
    item?.IG_account ??
    item?.Tiktok_account ??
    `${(item?.name || "user").toLowerCase()}-${index}`
  );
}

export async function searchUsers(q: string): Promise<UserLite[]> {
  const term = (q || "").trim();
  if (term.length < 2) return [];

  const res = await fetch(`${API}/user_turbo`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getToken()}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ q: term }),
  });

  if (!res.ok) {
    const msg = await res.text().catch(() => res.statusText);
    throw new Error(msg || "Xano user search failed");
  }

  const data = (await res.json()) as any[];

  return (Array.isArray(data) ? data : []).map((item, i) => ({
    id: makeSyntheticId(item, i),
    name: item?.name ?? null,
    handle: igHandle(item?.IG_account),
    avatar: item?.Profile_pic ? { url: item.Profile_pic.url } : null,
  }));
}
