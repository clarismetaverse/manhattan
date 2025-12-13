import { useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, CalendarClock, CheckCircle2, MapPin } from "lucide-react";

export type BookingPreviewState = {
  date?: string;
  time?: string;
  meal?: string;
  venueId?: number | string;
  venueName?: string;
  offerId?: number | string;
  offerTitle?: string;
};

const fallbackChecklist = [
  "Double-check the selected date & time",
  "Review the venue details before heading out",
  "Plan your deliverables and content outline",
  "Arrive 10 minutes early to set up",
];

const BookingPreview = () => {
  const navigate = useNavigate();
  const { state } = useLocation() as { state: BookingPreviewState | null };
  const booking = state ?? {};

  const formattedDate = useMemo(() => {
    if (!booking.date) return "";
    const parsed = new Date(`${booking.date}T00:00:00`);
    return parsed.toLocaleDateString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }, [booking.date]);

  const hasCoreDetails = Boolean(booking.date && booking.time);

  const goBack = () => navigate(-1);

  const handleConfirm = () => {
    // Placeholder for actual confirm logic
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-zinc-950 to-black text-white">
      <div className="pointer-events-none fixed inset-0 opacity-60">
        <div className="absolute -left-20 top-0 h-64 w-64 rounded-full bg-rose-600/30 blur-3xl" />
        <div className="absolute right-[-100px] top-10 h-72 w-72 rounded-full bg-fuchsia-600/20 blur-3xl" />
        <div className="absolute bottom-[-120px] left-12 h-72 w-72 rounded-full bg-purple-700/20 blur-3xl" />
      </div>

      <div className="relative mx-auto flex min-h-screen w-full max-w-md flex-col px-4 pb-28 pt-6">
        <div className="mb-6 flex items-center gap-3">
          <button
            onClick={goBack}
            className="h-11 w-11 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl flex items-center justify-center text-white transition hover:bg-white/10 active:scale-95"
            aria-label="Go back"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex-1">
            <p className="text-xs uppercase tracking-[0.18em] text-zinc-400">Booking</p>
            <h1 className="text-lg font-semibold tracking-tight">Booking preview</h1>
          </div>
        </div>

        {!hasCoreDetails ? (
          <div className="mt-10 rounded-3xl border border-white/10 bg-white/5 p-6 text-center">
            <p className="text-base font-semibold">Missing booking details</p>
            <p className="mt-2 text-sm text-zinc-300">
              We couldn&apos;t find the date and time you selected. Please go back and pick a slot to continue.
            </p>
            <button
              onClick={goBack}
              className="mt-4 inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/15"
            >
              Go back
            </button>
          </div>
        ) : (
          <div className="flex flex-1 flex-col gap-4">
            <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] shadow-[0_20px_80px_-40px_rgba(236,72,153,0.5)]">
              <div className="absolute inset-0 bg-gradient-to-br from-white/[0.04] via-rose-500/10 to-purple-700/10" />
              <div className="relative p-5">
                <p className="text-sm text-zinc-400">Your selection</p>
                <h2 className="mt-1 text-xl font-semibold text-white">
                  {booking.venueName ?? "Upcoming booking"}
                </h2>
                {booking.offerTitle && (
                  <p className="mt-1 text-sm text-zinc-300">{booking.offerTitle}</p>
                )}

                <div className="mt-4 space-y-3">
                  <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                    <CalendarClock className="h-5 w-5 text-rose-300" />
                    <div>
                      <p className="text-xs uppercase tracking-wide text-zinc-400">Date & time</p>
                      <p className="text-sm font-semibold text-white">
                        {formattedDate} · {booking.time}
                      </p>
                    </div>
                  </div>

                  {booking.meal && (
                    <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                      <CheckCircle2 className="h-5 w-5 text-fuchsia-300" />
                      <div>
                        <p className="text-xs uppercase tracking-wide text-zinc-400">Service</p>
                        <p className="text-sm font-semibold text-white">{booking.meal}</p>
                      </div>
                    </div>
                  )}

                  {booking.venueName && (
                    <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                      <MapPin className="h-5 w-5 text-purple-300" />
                      <div>
                        <p className="text-xs uppercase tracking-wide text-zinc-400">Venue</p>
                        <p className="text-sm font-semibold text-white">{booking.venueName}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-xl">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-white">Before you confirm</h3>
                <span className="rounded-full bg-white/10 px-3 py-1 text-[11px] text-zinc-200">Checklist</span>
              </div>
              <div className="mt-3 space-y-2">
                {fallbackChecklist.map(item => (
                  <div
                    key={item}
                    className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 px-3 py-3 text-sm text-zinc-100"
                  >
                    <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-300" />
                    <span className="leading-snug text-zinc-200">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="fixed inset-x-0 bottom-0 z-50">
        <div className="pointer-events-none h-10 bg-gradient-to-t from-black to-transparent" />
        <div className="border-t border-white/10 bg-black/80 backdrop-blur-xl">
          <div className="mx-auto flex max-w-md items-center gap-3 px-4 py-3">
            <button
              onClick={handleConfirm}
              disabled={!hasCoreDetails}
              className={`flex-1 rounded-2xl px-4 py-3 text-sm font-semibold transition-all ${
                hasCoreDetails
                  ? "bg-gradient-to-r from-rose-600 via-fuchsia-600 to-purple-700 text-white shadow-[0_12px_30px_-14px_rgba(244,63,94,0.8)] hover:shadow-[0_16px_40px_-18px_rgba(244,63,94,0.9)]"
                  : "bg-white/10 text-zinc-400 cursor-not-allowed"
              }`}
            >
              Confirm booking
            </button>
          </div>
          <div className="pb-[env(safe-area-inset-bottom)]" />
        </div>
      </div>
    </div>
  );
};

export default BookingPreview;
