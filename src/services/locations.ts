const API = "https://xbut-eryu-hhsg.f2.xano.io/api:vGd6XDW3";

function getToken() {
  return (
    localStorage.getItem("user_turbo_id_token") ||
    localStorage.getItem("user_turbo_token") ||
    localStorage.getItem("auth_token") ||
    ""
  );
}

// Minimal shape the selector needs
export type LocationLite = {
  id: number | string;
  name: string;       // e.g., "Los Angeles"
  region?: string | null;   // e.g., "CA"
  country?: string | null;  // e.g., "USA" or "Italy"
};

// Try POST /search/location { q }, fallback to GET /location?q=
export async function searchLocations(q: string, limit = 8): Promise<LocationLite[]> {
  const term = (q || "").trim();
  if (term.length < 2) return [];

  const token = getToken();

  // Preferred: POST /search/location
  try {
    const res = await fetch(`${API}/search/location`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ q: term, limit }),
    });
    if (res.ok) {
      const data = await res.json();
      const arr = Array.isArray(data) ? data : (Array.isArray(data?.items) ? data.items : []);
      return arr.map((x: any, i: number) => ({
        id: x?.id ?? `${(x?.name || "loc").toLowerCase()}-${i}`,
        name: String(x?.name ?? x?.city ?? x?.label ?? ""),
        region: x?.region ?? x?.state ?? null,
        country: x?.country ?? null,
      })).filter(l => l.name);
    }
  } catch (_) { /* fall through to GET */ }

  // Fallback: GET /location?q=&limit=
  const url = new URL(`${API}/location`);
  url.searchParams.set("q", term);
  url.searchParams.set("limit", String(limit));
  const res2 = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
  });
  if (!res2.ok) throw new Error(await res2.text().catch(() => res2.statusText));
  const data2 = await res2.json();
  const list = Array.isArray(data2) ? data2 : (Array.isArray(data2?.items) ? data2.items : []);
  // client-side narrowing if backend ignores ?q
  const narrowed = list.filter((x: any) => {
    const s = (x?.name || x?.city || x?.label || "").toLowerCase();
    return s.includes(term.toLowerCase());
  });
  return narrowed.slice(0, limit).map((x: any, i: number) => ({
    id: x?.id ?? `${(x?.name || "loc").toLowerCase()}-${i}`,
    name: String(x?.name ?? x?.city ?? x?.label ?? ""),
    region: x?.region ?? x?.state ?? null,
    country: x?.country ?? null,
  })).filter(l => l.name);
}
