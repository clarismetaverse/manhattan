/**
 * Booking preview — Apple White variant
 *
 * - Keeps the same navigation/state contract
 * - Adds scroll-to-bottom gating (prevents accidental confirms)
 * - Uses clean “Bianca Apple” styling: #F5F5F7 background, white cards, subtle borders/shadows
 */

import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, CalendarClock, CheckCircle2, MapPin } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

export type BookingPreviewState = {
  venueName?: string;
  offerTitle?: string;
  date?: string;
  time?: string;
  meal?: string;
  venueId?: number | string;
  offerId?: number | string;
};

const fallbackChecklist = [
  "Double-check the selected date & time",
  "Review the venue details before heading out",
  "Make sure your content plan feels authentic",
];

const BookingPreview = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const booking = (location.state ?? {}) as BookingPreviewState;
  const hasCoreDetails = Boolean(booking.date && booking.time);

  // Scroll gating (prevents accidental confirm taps)
  const [scrolledToBottom, setScrolledToBottom] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const threshold = 14;
      const atBottom =
        window.innerHeight + window.scrollY >=
        (document.documentElement.scrollHeight || document.body.scrollHeight) -
          threshold;
      setScrolledToBottom(atBottom);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const formattedDate = useMemo(() => {
    if (!booking.date) return "";
    // If it’s already a human string, we keep it. If it looks like ISO, we keep it safe.
    if (/^\d{4}-\d{2}-\d{2}$/.test(booking.date)) return booking.date;
    return booking.date;
  }, [booking.date]);

  const goBack = () => navigate(-1);

  const handleConfirm = () => {
    if (!hasCoreDetails || !scrolledToBottom) return;
    navigate("/booking/preview/confirm", { state: booking });
  };

  const canConfirm = hasCoreDetails && scrolledToBottom;

  return (
    <div className="min-h-screen bg-[#F5F5F7] text-black">
      {/* Top bar */}
      <div className="sticky top-0 z-30 bg-[#F5F5F7]/80 backdrop-blur">
        <div className="mx-auto flex w-full max-w-md items-center gap-3 px-4 pb-3 pt-4">
          <button
            onClick={goBack}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-black/10 bg-white shadow-[0_8px_20px_rgba(0,0,0,0.06)] active:scale-[0.98]"
            aria-label="Go back"
          >
            <ArrowLeft className="h-4 w-4 text-black/70" />
          </button>

          <div className="flex-1">
            <p className="text-[11px] font-medium tracking-[0.16em] text-black/50">
              BOOKING
            </p>
            <h1 className="mt-0.5 text-[18px] font-semibold tracking-tight">
              Booking preview
            </h1>
          </div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-md px-4 pb-32">
        {!hasCoreDetails ? (
          <div className="mt-6 rounded-[28px] border border-black/10 bg-white p-6 text-center shadow-[0_18px_50px_rgba(0,0,0,0.06)]">
            <p className="text-base font-semibold">Missing booking details</p>
            <p className="mt-2 text-sm text-black/60">
              We couldn&apos;t find the date and time you selected. Please go
              back and pick a slot to continue.
            </p>
            <button
              onClick={goBack}
              className="mt-4 inline-flex items-center justify-center rounded-2xl border border-black/10 bg-[#FBFBFC] px-4 py-2 text-sm font-medium text-black shadow-[0_10px_24px_rgba(0,0,0,0.06)] active:scale-[0.99]"
            >
              Go back
            </button>
          </div>
        ) : (
          <div className="mt-4 flex flex-col gap-4">
            {/* Summary */}
            <motion.div
              initial={{ opacity: 0, y: 10, filter: "blur(6px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{
                type: "spring",
                stiffness: 240,
                damping: 26,
                mass: 0.9,
              }}
              className="overflow-hidden rounded-[28px] border border-black/10 bg-white shadow-[0_18px_50px_rgba(0,0,0,0.08)]"
            >
              <div className="p-5">
                <p className="text-[12px] text-black/55">Your selection</p>
                <h2 className="mt-1 text-[22px] font-semibold leading-tight">
                  {booking.venueName ?? "Upcoming booking"}
                </h2>
                {booking.offerTitle && (
                  <p className="mt-1 text-sm text-black/60">
                    {booking.offerTitle}
                  </p>
                )}

                <div className="mt-4 space-y-3">
                  <div className="flex items-center gap-3 rounded-2xl border border-black/10 bg-[#FBFBFC] px-4 py-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-black/[0.04]">
                      <CalendarClock className="h-4 w-4 text-black/60" />
                    </div>
                    <div>
                      <p className="text-[11px] font-medium tracking-[0.16em] text-black/45">
                        DATE &amp; TIME
                      </p>
                      <p className="mt-0.5 text-[14px] font-semibold">
                        {formattedDate} · {booking.time}
                      </p>
                    </div>
                  </div>

                  {booking.meal && (
                    <div className="flex items-center gap-3 rounded-2xl border border-black/10 bg-[#FBFBFC] px-4 py-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-black/[0.04]">
                        <CheckCircle2 className="h-4 w-4 text-black/60" />
                      </div>
                      <div>
                        <p className="text-[11px] font-medium tracking-[0.16em] text-black/45">
                          SERVICE
                        </p>
                        <p className="mt-0.5 text-[14px] font-semibold">
                          {booking.meal}
                        </p>
                      </div>
                    </div>
                  )}

                  {booking.venueName && (
                    <div className="flex items-center gap-3 rounded-2xl border border-black/10 bg-[#FBFBFC] px-4 py-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-black/[0.04]">
                        <MapPin className="h-4 w-4 text-black/60" />
                      </div>
                      <div>
                        <p className="text-[11px] font-medium tracking-[0.16em] text-black/45">
                          VENUE
                        </p>
                        <p className="mt-0.5 text-[14px] font-semibold">
                          {booking.venueName}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Checklist */}
            <motion.div
              initial={{ opacity: 0, y: 12, filter: "blur(6px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{
                type: "spring",
                stiffness: 240,
                damping: 26,
                mass: 0.9,
                delay: 0.05,
              }}
              className="rounded-[28px] border border-black/10 bg-white p-5 shadow-[0_18px_50px_rgba(0,0,0,0.06)]"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-[15px] font-semibold">Before you confirm</h3>
                <span className="rounded-full border border-black/10 bg-[#FBFBFC] px-3 py-1 text-[11px] font-medium text-black/70">
                  Checklist
                </span>
              </div>

              <div className="mt-3 space-y-2">
                {fallbackChecklist.map((item) => (
                  <div
                    key={item}
                    className="flex items-start gap-3 rounded-2xl border border-black/10 bg-[#FBFBFC] px-4 py-3 text-[14px] text-black/80"
                  >
                    <CheckCircle2 className="mt-0.5 h-5 w-5 text-black/60" />
                    <span className="leading-snug">{item}</span>
                  </div>
                ))}
              </div>

              {!scrolledToBottom && (
                <div className="mt-4 rounded-2xl border border-black/10 bg-white px-4 py-3 text-[13px] text-black/60">
                  Scroll to the bottom to unlock {" "}
                  <span className="font-semibold text-black">Confirm</span>.
                </div>
              )}
            </motion.div>

            {/* Spacer so user can actually reach “bottom” */}
            <div className="h-10" />
          </div>
        )}
      </div>

      {/* Bottom CTA */}
      <div className="fixed inset-x-0 bottom-0 z-50">
        <div className="border-t border-black/10 bg-[#F5F5F7]/85 backdrop-blur">
          <div className="mx-auto flex max-w-md items-center gap-3 px-4 py-3">
            <button
              onClick={handleConfirm}
              disabled={!canConfirm}
              className={[
                "flex-1 rounded-2xl px-4 py-3 text-sm font-semibold transition-all",
                "shadow-[0_16px_40px_rgba(0,0,0,0.12)]",
                canConfirm
                  ? "bg-black text-white active:scale-[0.99]"
                  : "bg-black/15 text-black/40 cursor-not-allowed",
              ].join(" ")}
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
