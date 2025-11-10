import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

interface Booking { id: number; [k: string]: any }

export default function BookingDetails() {
  const { id } = useParams<{ id: string }>();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    (async () => {
      try {
        const res = await fetch("https://xbut-eryu-hhsg.f2.xano.io/api:vGd6XDW3/get_bookings/Upgrade", { signal: controller.signal });
        if (!res.ok) throw new Error(`Unexpected response: ${res.status}`);
        const data = (await res.json()) as Booking[];
        const found = (Array.isArray(data) ? data : []).find(b => String(b?.id) === String(id));
        setBooking(found ?? null);
      } catch (e: any) {
        if (e?.name !== "AbortError") {
          console.error(e);
          setError("Unable to load booking.");
        }
      } finally {
        setLoading(false);
      }
    })();
    return () => controller.abort();
  }, [id]);

  if (loading) return <div className="min-h-screen bg-[#0A0B0C] p-6 text-[#E9ECEB]">Loading…</div>;
  if (error) return <div className="min-h-screen bg-[#0A0B0C] p-6 text-[#E9ECEB]">{error}</div>;
  if (!booking) return <div className="min-h-screen bg-[#0A0B0C] p-6 text-[#E9ECEB]">Booking not found.</div>;

  return (
    <div className="min-h-screen bg-[#0A0B0C] p-6 text-[#E9ECEB]">
      <div className="mx-auto w-full max-w-4xl">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-light">Booking #{booking.id}</h1>
          <Link to="/memberspass/bookings" className="text-sm text-white/80 underline">
            Back to bookings
          </Link>
        </div>
        <pre className="overflow-auto rounded-xl border border-white/10 bg-black/40 p-4 text-xs text-white/80">
          {JSON.stringify(booking, null, 2)}
        </pre>
      </div>
    </div>
  );
}
