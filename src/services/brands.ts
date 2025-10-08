export type BrandLite = {
  id: number;
  BrandName: string;
  LogoBrand?: { url?: string } | null;
};

export function getToken(): string {
  try {
    if (typeof window !== "undefined") {
      return (
        localStorage.getItem("user_turbo_id_token") ||
        localStorage.getItem("user_turbo_token") ||
        localStorage.getItem("auth_token") ||
        ""
      );
    }
  } catch (error) {
    console.warn("Unable to read auth token from storage", error);
  }
  return "";
}

const BRAND_ENDPOINT = "https://xbut-eryu-hhsg.f2.xano.io/api:vGd6XDW3/brand";

function normalizeBrands(items: unknown[]): BrandLite[] {
  return items
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const { id, BrandName, LogoBrand } = item as {
        id?: unknown;
        BrandName?: unknown;
        LogoBrand?: unknown;
      };

      const numericId = typeof id === "number" ? id : Number(id);
      const name = typeof BrandName === "string" ? BrandName : "";
      let logo: BrandLite["LogoBrand"] = null;
      if (LogoBrand && typeof LogoBrand === "object") {
        const url = (LogoBrand as { url?: unknown }).url;
        logo = typeof url === "string" ? { url } : null;
      }

      if (!Number.isFinite(numericId) || !name) {
        return null;
      }

      return {
        id: numericId,
        BrandName: name,
        LogoBrand: logo,
      } satisfies BrandLite;
    })
    .filter((item): item is BrandLite => Boolean(item));
}

export async function searchBrands(q: string, limit = 8): Promise<BrandLite[]> {
  const query = q.trim();
  if (!query) {
    return [];
  }

  const params = new URLSearchParams();
  params.set("q", query);
  if (limit) {
    params.set("limit", String(limit));
  }

  const headers: HeadersInit = { Accept: "application/json" };
  const token = getToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${BRAND_ENDPOINT}?${params.toString()}`, {
      method: "GET",
      headers,
    });

    if (!response.ok) {
      console.error("Brand search failed", response.status, response.statusText);
      return [];
    }

    const data = await response.json();
    const list = Array.isArray(data)
      ? data
      : data && typeof data === "object" && "items" in data && Array.isArray((data as { items: unknown[] }).items)
      ? (data as { items: unknown[] }).items
      : [];

    const normalized = normalizeBrands(list);

    if (!query) {
      return normalized;
    }

    const lowered = query.toLowerCase();
    return normalized.filter((brand) => brand.BrandName.toLowerCase().includes(lowered)).slice(0, limit);
  } catch (error) {
    console.error("Brand search error", error);
    return [];
  }
}
