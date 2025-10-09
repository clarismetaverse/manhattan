const API = "https://xbut-eryu-hhsg.f2.xano.io/api:vGd6XDW3";

function getToken() {
  return (
    localStorage.getItem("user_turbo_id_token") ||
    localStorage.getItem("user_turbo_token") ||
    localStorage.getItem("auth_token") ||
    ""
  );
}

export type PlaceLite = { id: number | string; name: string; thumb?: string | null };

export async function searchPlaces(q: string): Promise<PlaceLite[]> {
  const term = (q || "").trim();
  if (term.length < 2) return [];

  const res = await fetch(`${API}/search/location`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify({ q: term }),
  });

  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  const data = await res.json();

  // Normalize: prefer .name, fallback to .Name; cover image under .Cover.url
  return (Array.isArray(data) ? data : [])
    .map((r: any, i: number) => ({
      id: r?.id ?? i,
      name: r?.name ?? r?.Name ?? "",
      thumb: r?.Cover?.url ?? null,
    }))
    .filter(x => x.name);
}
