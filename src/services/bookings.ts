export type ApiBooking = {
  id: number;
  user_turbo_id: number;
  BookingDay: string;
  ApprovalStatus?: boolean;
  Approved?: boolean;
  Rejectedstatus?: boolean;
  MinuteStart?: string | number | null;
  HourStart?: string | number | null;
  HourEnd?: string | number | null;
  MinuteEnd?: string | number | null;
  _restaurant_turbo?: {
    Name?: string;
    Instagram?: string;
    Maps_Link?: string;
    Adress?: string;
    Cover?: { url?: string };
    _cities?: { CityName?: string };
  };
  _offers_turbo?: {
    Offer_Name?: string;
    approveByOwner?: boolean;
    Offer_Cover?: { url?: string };
  };
  _actions_turbo?: { Action_Name?: string; Action_icon?: { url?: string } };
  user_turbo?: { id?: number; name?: string; NickName?: string };
};

export interface TicketItem {
  id: string;
  venue: string;
  address: string;
  datetime: string;
  status: "approved" | "pending" | "declined";
  hostHandle: string;
  hostAvatar?: string;
  notes?: string;
}

function toHandle(input?: string): string {
  if (!input) return "";
  if (input.startsWith("@")) return input;
  try {
    const u = new URL(input);
    const seg = u.pathname.split("/").filter(Boolean)[0];
    if (seg) return "@" + seg;
  } catch {}
  return "";
}

function pad2(v: string | number | null | undefined) {
  const n = Number(v ?? 0);
  return String(n).padStart(2, "0");
}

function combineLocalISO(day: string, h?: string | number | null, m?: string | number | null) {
  return `${day}T${pad2(h)}:${pad2(m)}:00`;
}

function statusFrom(b: ApiBooking): "approved" | "pending" | "declined" {
  if (b.Approved === true) return "approved";
  if (b.Rejectedstatus === true) return "declined";
  if (b.ApprovalStatus === true) return "pending";
  return "pending";
}

export function mapBooking(b: ApiBooking): TicketItem {
  const venue =
    b._restaurant_turbo?.Name ||
    b._offers_turbo?.Offer_Name ||
    "Venue";

  const address =
    b._restaurant_turbo?.Adress ||
    b._restaurant_turbo?._cities?.CityName ||
    "";

  const cover =
    b._restaurant_turbo?.Cover?.url ||
    b._offers_turbo?.Offer_Cover?.url;

  const datetimeISO = combineLocalISO(b.BookingDay, b.HourStart, b.MinuteStart);

  return {
    id: String(b.id),
    venue,
    address,
    datetime: datetimeISO,
    status: statusFrom(b),
    hostHandle: toHandle(b._restaurant_turbo?.Instagram),
    hostAvatar: cover,
    notes: b._actions_turbo?.Action_Name || undefined,
  };
}

export async function fetchBookings(): Promise<TicketItem[]> {
  const token = localStorage.getItem('auth_token');
  const res = await fetch(
    "https://xbut-eryu-hhsg.f2.xano.io/api:vGd6XDW3/get_bookings/Upgrade",
    {
      credentials: "include",
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
      },
    }
  );
  if (!res.ok) throw new Error(`Bookings fetch failed: ${res.status}`);
  const json: ApiBooking[] = await res.json();
  return (json ?? []).map(mapBooking);
}
