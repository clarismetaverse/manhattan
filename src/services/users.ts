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
  id: number;
  name?: string | null;
  handle?: string | null;
  avatar?: { url?: string } | null;
};

export async function searchUsers(q: string, limit = 8): Promise<UserLite[]> {
  const url = new URL(API + "/user_turbo");
  if (q) url.searchParams.set("q", q);
  url.searchParams.set("limit", String(limit));

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  if (!res.ok) throw new Error(await res.text());
  const data = await res.json();

  const list: UserLite[] = Array.isArray(data)
    ? data
    : Array.isArray((data as any).items)
    ? (data as any).items
    : [];

  if (q) {
    const ql = q.toLowerCase();
    return list
      .filter(u =>
        (u.name || "").toLowerCase().includes(ql) ||
        (u.handle || "").toLowerCase().includes(ql)
      )
      .slice(0, limit);
  }
  return list.slice(0, limit);
}
