import React from "react";
import { Calendar, Clock, MapPin, MessageCircle, Shirt, CheckCircle2, Clock3, XCircle } from "lucide-react";

export type TicketStatus = "approved" | "pending" | "declined";

export interface TicketItem {
  id: string;
  venue: string;
  address: string;
  datetime: string; // ISO
  status: TicketStatus;
  hostHandle: string; // @DANIELV
  hostAvatar?: string; // url
  notes?: string;
}

const statusDefs: Record<TicketStatus, { label: string; chip: string; icon: React.ReactNode }> = {
  approved: {
    label: "APPROVED",
    icon: <CheckCircle2 className="h-4 w-4" />,
    chip: "bg-emerald-100/70 text-emerald-800 ring-1 ring-emerald-200/80",
  },
  pending: {
    label: "PENDING",
    icon: <Clock3 className="h-4 w-4" />,
    chip: "bg-amber-100/70 text-amber-800 ring-1 ring-amber-200/80",
  },
  declined: {
    label: "DECLINED",
    icon: <XCircle className="h-4 w-4" />,
    chip: "bg-rose-100/70 text-rose-800 ring-1 ring-rose-200/80",
  },
};

export function TicketCardV2({ item }: { item: TicketItem }) {
  const d = new Date(item.datetime);
  const hh = d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  const dd = d.toLocaleDateString([], { weekday: "short", day: "2-digit", month: "short" });
  const s = statusDefs[item.status];

  return (
    <article className="relative overflow-hidden rounded-3xl border border-black/5 bg-white/70 p-4 text-stone-900 shadow-[0_12px_40px_rgba(0,0,0,0.06)] backdrop-blur-md font-[SF Pro Display,Inter,sans-serif]">
      {/* subtle highlights */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-1/3 bg-gradient-to-b from-white/60 via-white/30 to-transparent" />
      <div className="pointer-events-none absolute left-1/2 top-0 h-44 w-44 -translate-x-1/2 rounded-full bg-white/50 blur-3xl" />
      <div className="pointer-events-none absolute -left-20 -top-20 h-32 w-32 rounded-full bg-white/60 blur-2xl" />

      <div className="relative z-10 space-y-4">
        {/* venue */}
        <div className="space-y-2">
          <h2 className="font-serif text-2xl leading-tight tracking-tight text-black/90">{item.venue}</h2>
          <div className="flex items-center gap-2 text-sm text-black/55">
            <MapPin className="h-4 w-4" />
            <span>{item.address}</span>
          </div>
        </div>

        {/* status + datetime */}
        <div className="flex items-center justify-between gap-3">
          <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs ${s.chip}`}>
            {s.icon}
            {s.label}
          </span>
          <div className="text-right text-black/70">
            <div className="flex items-center justify-end gap-2 text-sm">
              <Calendar className="h-4 w-4" /> {dd}
            </div>
            <div className="flex items-center justify-end gap-2 text-2xl font-medium text-black/80">
              <Clock className="h-5 w-5" /> {hh}
            </div>
          </div>
        </div>

        {/* actions */}
        <div className="flex items-center justify-between gap-3">
          <button className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-emerald-100/80 px-4 py-2 text-sm font-medium text-emerald-900 ring-1 ring-emerald-200 transition hover:bg-emerald-100">
            <MessageCircle className="h-4 w-4" /> Chat
          </button>
          <button className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-white/70 px-4 py-2 text-sm font-medium text-black/80 ring-1 ring-black/10 transition hover:bg-white">
            <Shirt className="h-4 w-4" /> Details
          </button>
        </div>
      </div>
    </article>
  );
}

export default function TicketListV2() {
  const items: TicketItem[] = [
    {
      id: "1",
      venue: "Cipriani Milano",
      address: "Via Palazzo 2, Milano",
      datetime: new Date().toISOString(),
      status: "approved",
      hostHandle: "@DANIELV",
      hostAvatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop",
    },
    {
      id: "2",
      venue: "Sanctuary",
      address: "Jumeirah, Dubai",
      datetime: new Date(Date.now() + 86400000).toISOString(),
      status: "pending",
      hostHandle: "@SOFIYA",
    },
    {
      id: "3",
      venue: "Matcha Club",
      address: "Al Quoz, Dubai",
      datetime: new Date(Date.now() - 86400000 * 2).toISOString(),
      status: "declined",
      hostHandle: "@LEO",
    },
  ];

  return (
    <div className="min-h-screen bg-[#EEE6D8] px-3 py-4 text-stone-900 font-[SF Pro Display,Inter,sans-serif]">
      <div className="mx-auto max-w-sm space-y-4">
        {/* header */}
        <div className="mb-1 flex items-center justify-between">
          <h1 className="font-serif text-xl text-black/90">Your Tickets</h1>
          <div className="inline-flex overflow-hidden rounded-full border border-black/10 bg-white/70 shadow-sm">
            <button className="px-3 py-1.5 text-xs font-medium text-black/80">Upcoming</button>
            <button className="px-3 py-1.5 text-xs font-medium text-black/55 hover:text-black/80">Past</button>
          </div>
        </div>

        {/* list */}
        <div className="grid gap-4">
          {items.map((item) => (
            <TicketCardV2 key={item.id} item={item} />
          ))}
        </div>
      </div>
    </div>
  );
}
