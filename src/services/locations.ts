const API = "https://xbut-eryu-hhsg.f2.xano.io/api:vGd6XDW3";

function getToken() {
  return (
    localStorage.getItem("user_turbo_id_token") ||
    localStorage.getItem("user_turbo_token") ||
    localStorage.getItem("auth_token") ||
    ""
  );
}

export type PlaceLite = {
  id: number | string;
  name: string;
  thumb?: string | null;
};

export async function searchPlaces(q: string): Promise<PlaceLite[]> {
  const term = (q || "").trim();
  if (term.length < 2) {
    console.debug("[searchPlaces] skip (too short):", term);
    return [];
  }

  const url = `${API}/search/location`;
  const token = getToken();
  console.debug("[searchPlaces] firing →", { url, term, hasToken: !!token });

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ q: term }),
    });
    console.debug("[searchPlaces] status:", res.status);

    if (!res.ok) {
      const text = await res.text().catch(() => res.statusText);
      throw new Error(`${res.status} ${text}`);
    }

    const data = await res.json();
    console.debug("[searchPlaces] data:", Array.isArray(data) ? data.length : data);

    return (Array.isArray(data) ? data : [])
      .map((r: any, i: number) => ({
        id: r?.id ?? i,
        name: r?.name ?? r?.Name ?? "",
        thumb: r?.Cover?.url ?? null,
      }))
      .filter((x) => x.name);
  } catch (err) {
    console.error("[searchPlaces] ERROR:", err);
    return [];
  }
}
