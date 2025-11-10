import React from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Calendar,
  Clock,
  MapPin,
  ShieldCheck,
  Shirt,
  MessageCircle,
  CheckCircle2,
  Clock3,
  XCircle,
  Loader2,
} from "lucide-react";
import { fetchBookings, type TicketItem } from "@/services/bookings";

const colors = {
  bg: "#E9DEC9",
  stroke: "#E3D3BB",
  text: {
    primary: "text-stone-900",
    secondary: "text-stone-700",
    subtle: "text-stone-500",
  },
};

const statusDefs: Record<
  TicketItem["status"],
  { label: string; chip: string; icon: React.ReactNode }
> = {
  approved: {
    label: "APPROVED",
    icon: <CheckCircle2 className="h-4 w-4" />,
    chip: "bg-emerald-600/10 text-emerald-700 ring-1 ring-emerald-600/30",
  },
  pending: {
    label: "PENDING",
    icon: <Clock3 className="h-4 w-4" />,
    chip: "bg-amber-500/10 text-amber-700 ring-1 ring-amber-500/30",
  },
  declined: {
    label: "DECLINED",
    icon: <XCircle className="h-4 w-4" />,
    chip: "bg-rose-500/10 text-rose-700 ring-1 ring-rose-500/30",
  },
};

function HostPill({ avatar, handle }: { avatar?: string; handle: string }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full bg-white/70 backdrop-blur-sm px-3 py-1 text-xs text-stone-700 ring-1 ring-[#E3D3BB]">
      <span className="inline-flex h-5 w-5 items-center justify-center overflow-hidden rounded-full ring-1 ring-[#E3D3BB]">
        {avatar ? (
          <img src={avatar} alt={handle} className="h-full w-full object-cover" />
        ) : (
          <span className="text-[10px]">👤</span>
        )}
      </span>
      <span className="opacity-70">HOST</span>
      <span className="font-medium">{handle}</span>
    </div>
  );
}

export function TicketCard({ item }: { item: TicketItem }) {
  const d = new Date(item.datetime);
  const hh = d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  const dd = d.toLocaleDateString([], { weekday: "short", day: "2-digit", month: "short" });
  const s = statusDefs[item.status];

  return (
    <article className="relative overflow-hidden rounded-3xl border border-[#E3D3BB] bg-[#FAF7F0] p-4 text-stone-900 shadow-[0_4px_12px_rgba(0,0,0,0.06)] font-[SF Pro Display,Inter,sans-serif]">
      {/* glassmorphic cover — top third with gradient */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-1/3 bg-gradient-to-b from-white/50 via-white/25 to-transparent backdrop-blur-xl ring-1 ring-white/40" />
      {/* subtle radial highlight */}
      <div className="pointer-events-none absolute left-1/2 top-0 h-48 w-48 -translate-x-1/2 rounded-full bg-white/40 blur-3xl opacity-70" />

      {/* soft highlight */}
      <div className="pointer-events-none absolute -left-24 -top-24 h-40 w-40 rounded-full bg-white/60 blur-2xl" />

      {/* CONTENT */}
      <div className="relative z-10">
        {/* host */}
        <div className="mb-4 flex items-center justify-between">
          <HostPill avatar={item.hostAvatar} handle={item.hostHandle} />
        </div>

        {/* venue */}
        <h2 className="mb-1 font-serif text-2xl leading-tight tracking-tight">{item.venue}</h2>
        <div className={`mb-3 flex items-center gap-2 text-sm ${colors.text.secondary}`}>
          <MapPin className="h-4 w-4" />
          <span>{item.address}</span>
        </div>

        {/* status + datetime */}
        <div className="mb-5 flex items-center justify-between">
          <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs ${s.chip}`}>
            {s.icon}
            {s.label}
          </span>
          <div className="text-right">
            <div className="flex items-center justify-end gap-2 text-sm text-stone-600">
              <Calendar className="h-4 w-4" /> {dd}
            </div>
            <div className="flex items-center justify-end gap-2 text-2xl font-medium">
              <Clock className="h-5 w-5" /> {hh}
            </div>
          </div>
        </div>

        {/* etiquette */}
        <p className="mb-5 text-sm text-stone-600">
          Wait for your host at the entrance — entry is by invitation only.
        </p>

        {/* rules */}
        <div className="mb-4 flex items-center gap-6 text-[12px] tracking-wide text-stone-600">
          <span className="inline-flex items-center gap-2">
            <ShieldCheck className="h-4 w-4" /> RULES OF CONDUCT
          </span>
        </div>

        {/* actions */}
        <div className="flex items-center justify-between">
          <button className="inline-flex items-center gap-2 rounded-full bg-emerald-600/10 px-4 py-2 text-emerald-700 ring-1 ring-emerald-600/30 hover:bg-emerald-600/15">
            <MessageCircle className="h-4 w-4" /> Chat
          </button>
          <button className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 ring-1 ring-[#E3D3BB] hover:bg-white/90">
            <Shirt className="h-4 w-4" /> Dress code
          </button>
        </div>
      </div>
    </article>
  );
}

export default function TicketList() {
  const { data, isLoading, isError, error } = useQuery<TicketItem[], Error>({
    queryKey: ["bookings"],
    queryFn: fetchBookings,
    staleTime: 60_000,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#E9DEC9] flex items-center justify-center">
        <div className="flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 text-sm text-stone-700 shadow">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Loading tickets…</span>
        </div>
      </div>
    );
  }

  const items = data ?? [];

  return (
    <div className="min-h-screen bg-[#E9DEC9] px-3 py-4 text-stone-900 font-[SF Pro Display,Inter,sans-serif]">
      <div className="mx-auto max-w-sm space-y-4">
        {/* header */}
        <div className="mb-1 flex items-center justify-between">
          <h1 className="font-serif text-xl">Your Tickets</h1>
          <div className="inline-flex overflow-hidden rounded-full ring-1 ring-[#E3D3BB] bg-white">
            <button className="px-3 py-1.5 text-xs text-stone-800">Upcoming</button>
            <button className="px-3 py-1.5 text-xs text-stone-500 hover:text-stone-800">Past</button>
          </div>
        </div>

        <div className="grid gap-4">
          {items.map((item) => (
            <TicketCard key={item.id} item={item} />
          ))}
        </div>

        {isError && (
          <div className="pointer-events-none fixed inset-x-0 bottom-4 flex justify-center px-4">
            <div className="pointer-events-auto rounded-full bg-stone-900/90 px-4 py-2 text-xs text-stone-100 shadow">
              Unable to load tickets. {error?.message}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
