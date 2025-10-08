const API = "https://xbut-eryu-hhsg.f2.xano.io/api:vGd6XDW3";

function getToken() {
  return (
    localStorage.getItem("user_turbo_id_token") ||
    localStorage.getItem("user_turbo_token") ||
    localStorage.getItem("auth_token") ||
    ""
  );
}

export type LocationLite = {
  id: number | string;
  name: string;
  region?: string | null;
  country?: string | null;
};

export async function searchLocations(q: string): Promise<LocationLite[]> {
  const term = (q || "").trim();
  if (term.length < 2) {
    console.debug("[searchLocations] skip (too short):", term);
    return [];
  }

  const url = `${API}/search/location`;
  const token = getToken();
  console.debug("[searchLocations] firing →", { url, term, hasToken: !!token });

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

    console.debug("[searchLocations] status:", res.status);

    if (!res.ok) {
      const text = await res.text().catch(() => res.statusText);
      throw new Error(`${res.status} ${text}`);
    }

    const data = await res.json();
    console.debug("[searchLocations] ok, items:", Array.isArray(data) ? data.length : data);

    return (Array.isArray(data) ? data : []).map((x: any, i: number) => ({
      id: x?.id ?? `${(x?.name || "loc").toLowerCase()}-${i}`,
      name: String(x?.name ?? x?.city ?? x?.label ?? ""),
      region: x?.region ?? x?.state ?? null,
      country: x?.country ?? null,
    })).filter((l) => l.name);
  } catch (err) {
    console.error("[searchLocations] ERROR:", err);
    return [];
  }
}
