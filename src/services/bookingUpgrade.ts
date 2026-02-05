const BOOKING_UPGRADE_URL =
  "https://xbut-eryu-hhsg.f2.xano.io/api:vGd6XDW3/booking_upgrade";

export type BookingUpgradeSlotLimit = {
  Type: string;
  Limit: number;
};

export type BookingUpgradePayload = {
  weekdaysturbo_id?: number;
  timeslot_id?: number;
  SlotLimit?: BookingUpgradeSlotLimit;
  Booking_id_fk?: number;
  date?: string | null;
  status?: string | null;
  offer_upgrade_id?: number;
  timestamp?: number;
};

export type BookingUpgradeResponse = {
  id: number;
  created_at?: number;
  updated_at?: number;
  offer_upgrade_id?: number;
  timeslot_id?: number;
  weekdaysturbo_id?: number;
  Booking_id_fk?: number;
  date?: string | null;
  status?: string | null;
  timestamp?: number;
  SlotLimit?: BookingUpgradeSlotLimit;
  [key: string]: unknown;
};

const getWeekdayTurboId = (date: string) => {
  const utcDay = new Date(`${date}T00:00:00Z`).getUTCDay();
  return utcDay === 0 ? 7 : utcDay;
};

const getTimestampFromDate = (date: string) => {
  const timestamp = Date.parse(`${date}T00:00:00Z`);
  if (Number.isNaN(timestamp)) {
    throw new Error(`Invalid date provided: ${date}`);
  }
  return timestamp;
};

export async function createBookingUpgrade(
  payload: BookingUpgradePayload
): Promise<BookingUpgradeResponse> {
  if (!payload) {
    throw new Error("Booking upgrade payload is required.");
  }

  const errors: string[] = [];
  const offerUpgradeId = payload.offer_upgrade_id;
  const timeslotId = payload.timeslot_id;
  const hasDate = typeof payload.date === "string" && payload.date.length > 0;
  const hasTimestamp = Number.isFinite(payload.timestamp);

  if (!Number.isFinite(offerUpgradeId)) {
    errors.push("offer_upgrade_id is required.");
  }
  if (!Number.isFinite(timeslotId)) {
    errors.push("timeslot_id is required.");
  }
  if (!hasDate && !hasTimestamp) {
    errors.push("date or timestamp is required.");
  }

  let timestamp = payload.timestamp;
  if (hasDate && !hasTimestamp) {
    timestamp = getTimestampFromDate(payload.date as string);
  }

  let weekdaysturboId = payload.weekdaysturbo_id;
  if (!Number.isFinite(weekdaysturboId)) {
    if (hasDate) {
      weekdaysturboId = getWeekdayTurboId(payload.date as string);
    } else {
      errors.push("weekdaysturbo_id is required when date is not provided.");
    }
  }

  if (errors.length > 0) {
    throw new Error(`Invalid booking upgrade payload: ${errors.join(" ")}`);
  }

  const normalizedPayload: BookingUpgradePayload = {
    ...payload,
    offer_upgrade_id: offerUpgradeId,
    timeslot_id: timeslotId,
    timestamp,
    weekdaysturbo_id: weekdaysturboId,
    status: payload.status ?? "PENDING",
    SlotLimit: payload.SlotLimit ?? { Type: "", Limit: 0 },
  };

  const response = await fetch(BOOKING_UPGRADE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(normalizedPayload),
  });

  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    const text = await response.text();
    if (!response.ok) {
      throw new Error(text || `Booking upgrade request failed with status ${response.status}.`);
    }
    throw new Error("Invalid response from booking upgrade endpoint; expected JSON.");
  }

  const data = (await response.json()) as BookingUpgradeResponse & { message?: string };

  if (!response.ok) {
    const message =
      typeof data?.message === "string"
        ? data.message
        : `Booking upgrade request failed with status ${response.status}.`;
    throw new Error(message);
  }

  return data;
}
