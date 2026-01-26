const RAW_CALENDAR_URL = 'https://xbut-eryu-hhsg.f2.xano.io/api:vGd6XDW3/calendar/raw/Data';
const CALENDAR_MICROSERVICE_URL = 'https://calendar-microservice.vercel.app/api/calendar';

type RawBooking = {
  timestamp: number;
  status: string;
  timeslot_id: number;
};

type RawOfferTimeslot = {
  timeslot_id: number;
  active: boolean;
};

type RawCalendarResponse = {
  book?: RawBooking[];
  offer_timeslot?: Array<RawOfferTimeslot & { [key: string]: unknown }>;
  from?: number;
  to?: number;
};

type CalendarAvailabilityResponse = {
  available_days?: Array<{ date: string; available: boolean }>;
};

const normalizeStatus = (status: string) => status.toUpperCase();

type FetchMonthAvailabilityParams = {
  offerId: number;
  from: number;
  to: number;
  signal?: AbortSignal;
};

const getTimestamp = (value: unknown, fallback: number) =>
  typeof value === 'number' && Number.isFinite(value) ? value : fallback;

export const fetchMonthAvailability = async ({
  offerId,
  from,
  to,
  signal,
}: FetchMonthAvailabilityParams): Promise<Set<string>> => {
  const rawResponse = await fetch(RAW_CALENDAR_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      offer_id: offerId,
      from,
      to,
    }),
    signal,
  });

  if (!rawResponse.ok) {
    throw new Error('Failed to fetch raw calendar data');
  }

  const rawData = (await rawResponse.json()) as RawCalendarResponse;

  const payloadFrom = getTimestamp(rawData.from, from);
  const payloadTo = getTimestamp(rawData.to, to);

  const book = Array.isArray(rawData.book)
    ? rawData.book.map((entry) => ({
        timestamp: entry.timestamp,
        status: typeof entry.status === 'string' ? normalizeStatus(entry.status) : entry.status,
        timeslot_id: entry.timeslot_id,
      }))
    : [];

  const offerTimeslot = Array.isArray(rawData.offer_timeslot)
    ? rawData.offer_timeslot.map((entry) => ({
        timeslot_id: entry.timeslot_id,
        active: Boolean(entry.active),
      }))
    : [];

  const availabilityResponse = await fetch(CALENDAR_MICROSERVICE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: payloadFrom,
      to: payloadTo,
      book,
      offer_timeslot: offerTimeslot,
    }),
    signal,
  });

  if (!availabilityResponse.ok) {
    throw new Error('Failed to fetch calendar availability');
  }

  const availabilityData = (await availabilityResponse.json()) as CalendarAvailabilityResponse;
  const availableDays = new Set<string>();

  availabilityData.available_days?.forEach((day) => {
    if (day.available) {
      availableDays.add(day.date);
    }
  });

  return availableDays;
};
