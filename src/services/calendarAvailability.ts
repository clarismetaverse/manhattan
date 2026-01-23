import { request } from "./xano";

const RAW_DATA_URL = "https://xbut-eryu-hhsg.f2.xano.io/api:vGd6XDW3/calendar/raw/Data";
const MICROSERVICE_URL = "https://calendar-microservice.vercel.app/api/calendar";

export type CalendarBooking = {
  timestamp: number;
  status?: string;
  timeslot_id: number;
};

export type CalendarOfferTimeslot = {
  timeslot_id: number;
  active?: boolean;
};

export type CalendarRawData = {
  book?: CalendarBooking[];
  offer_timeslot?: CalendarOfferTimeslot[];
};

export type CalendarAvailableDay = {
  date: string;
  available: boolean;
  remaining_slots?: number;
};

export type CalendarAvailabilityPayload = {
  offer_id: number;
  from: number;
  to: number;
  book: Array<{ timestamp: number; status: string; timeslot_id: number }>;
  offer_timeslot: Array<{ timeslot_id: number; active: boolean }>;
};

export async function fetchCalendarRawData(offerId: number, fromMs: number, toMs: number) {
  const payload = {
    offer_id: offerId,
    from: fromMs,
    to: toMs,
  };

  const data = await request<CalendarRawData>(RAW_DATA_URL, {
    method: "POST",
    body: JSON.stringify(payload),
  });

  return {
    book: data.book ?? [],
    offer_timeslot: data.offer_timeslot ?? [],
  };
}

export async function fetchAvailableDaysFromMicroservice(payload: CalendarAvailabilityPayload) {
  const response = await fetch(MICROSERVICE_URL, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Calendar microservice error: ${response.status}`);
  }

  const data = (await response.json()) as { available_days?: CalendarAvailableDay[] };
  return data.available_days ?? [];
}

export async function getMonthAvailability(offerId: number, year: number, monthIndex0: number) {
  const from = new Date(year, monthIndex0, 1, 0, 0, 0, 0);
  const to = new Date(year, monthIndex0 + 1, 0, 23, 59, 59, 999);
  const fromMs = from.getTime();
  const toMs = to.getTime();

  const raw = await fetchCalendarRawData(offerId, fromMs, toMs);
  const payload: CalendarAvailabilityPayload = {
    offer_id: offerId,
    from: fromMs,
    to: toMs,
    book: raw.book.map(booking => ({
      timestamp: booking.timestamp,
      status: String(booking.status ?? "").toUpperCase(),
      timeslot_id: booking.timeslot_id,
    })),
    offer_timeslot: raw.offer_timeslot.map(timeslot => ({
      timeslot_id: timeslot.timeslot_id,
      active: Boolean(timeslot.active),
    })),
  };

  return fetchAvailableDaysFromMicroservice(payload);
}
