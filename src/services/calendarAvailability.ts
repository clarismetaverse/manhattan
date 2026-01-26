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

export type RawCalendarResponse = {
  book: RawBooking[];
  offer_timeslot: RawOfferTimeslot[];
};

type CalendarAvailabilityDay = {
  date: string;
  available: boolean;
  remaining_slots?: number;
};

type CalendarAvailabilityResponse = {
  available_days?: CalendarAvailabilityDay[];
};

export type MicroservicePayload = {
  offer_id: number;
  from: number;
  to: number;
  book: RawBooking[];
  offer_timeslot: { timeslot_id: number; active: boolean }[];
};

export const fetchCalendarRawData = async (
  offerId: number,
  from: number,
  to: number,
  signal?: AbortSignal
): Promise<RawCalendarResponse> => {
  const response = await fetch(RAW_CALENDAR_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ offer_id: offerId, from, to }),
    signal,
  });

  if (!response.ok) {
    throw new Error('Failed to fetch raw calendar data');
  }

  const data = await response.json();
  return {
    book: Array.isArray(data.book) ? data.book : [],
    offer_timeslot: Array.isArray(data.offer_timeslot) ? data.offer_timeslot : [],
  };
};

export const fetchAvailableDaysFromMicroservice = async (
  payload: MicroservicePayload,
  signal?: AbortSignal
): Promise<CalendarAvailabilityDay[]> => {
  const response = await fetch(CALENDAR_MICROSERVICE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    signal,
  });

  if (!response.ok) {
    throw new Error('Failed to fetch calendar availability');
  }

  const data = (await response.json()) as CalendarAvailabilityResponse;
  return data.available_days ?? [];
};

const normalizeStatus = (status: string) => status.toUpperCase();

export const getOfferAvailableDays = async (
  offerId: number,
  from: number,
  to: number,
  signal?: AbortSignal
): Promise<Set<string>> => {
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

  const book = Array.isArray(rawData.book)
    ? rawData.book.map((entry) => ({
        ...entry,
        status: typeof entry.status === 'string' ? normalizeStatus(entry.status) : entry.status,
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
      offer_id: offerId,
      from,
      to,
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
