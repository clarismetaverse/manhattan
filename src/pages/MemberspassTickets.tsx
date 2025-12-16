import React from "react";
import {
  CalendarDays,
  MapPin,
  Ticket as TicketIcon,
  CheckCircle2,
  Clock3,
  XCircle,
  MessageCircle,
  Shield,
  Shirt,
  RotateCcw,
} from "lucide-react";

type TicketStatus = "approved" | "pending" | "postponed";

interface PassItem {
  id: string;
  clubName: string;
  address: string;
  city: string;
  date: string;
  time: string;
  status: TicketStatus;
  host: { handle: string; avatar: string } | null;
  background: string;
}

const PASSES: PassItem[] = [
  {
    id: "1",
    clubName: "Cipriani Milano",
    address: "Via Palazzo 2",
    city: "Milano",
    date: "Fri, 12 Dec",
    time: "9:00 PM",
    status: "approved",
    host: {
      handle: "@danielv",
      avatar:
        "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=160&auto=format&fit=crop",
    },
    background:
      "https://images.unsplash.com/photo-1579551055097-5f8b0b6b1d4f?q=80&w=2400&auto=format&fit=crop",
  },
  {
    id: "2",
    clubName: "The Sanctuary",
    address: "Via Torino 21",
    city: "Milano",
    date: "Sat, 13 Dec",
    time: "8:30 PM",
    status: "pending",
    host: {
      handle: "@emilyp",
      avatar:
        "https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?q=80&w=160&auto=format&fit=crop",
    },
    background:
      "https://images.unsplash.com/photo-1498654200943-1088dd4438ae?q=80&w=2400&auto=format&fit=crop",
  },
  {
    id: "3",
    clubName: "Palazzo Parigi",
    address: "Corso di Porta Nuova 1",
    city: "Milano",
    date: "Sun, 14 Dec",
    time: "7:00 PM",
    status: "postponed",
    host: null,
    background:
      "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=2400&auto=format&fit=crop",
  },
];

export default function MemberspassTickets() {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#030304] text-[#F4EFE7]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(250,245,237,0.12),transparent_55%)]" />
      <div className="pointer-events-none absolute inset-x-0 bottom-[-18%] h-[45rem] bg-[conic-gradient(from_140deg_at_50%_50%,rgba(50,150,150,0.18),rgba(0,0,0,0.08),rgba(120,120,120,0.12),rgba(0,0,0,0.08),rgba(50,150,150,0.18))] blur-3xl opacity-60" />

      <main className="relative z-10 mx-auto flex min-h-screen max-w-5xl flex-col px-5 pb-24 pt-16 sm:px-8 lg:px-10">
        <header className="mb-12 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-white/50">Memberspass</p>
            <h1 className="mt-3 font-serif text-[40px] leading-none tracking-[-0.03em] sm:text-[48px]">
              My Guest Experiences
            </h1>
          </div>
          <a
            href="/memberspass"
            className="rounded-full border border-white/20 bg-white/5 px-5 py-2 text-xs uppercase tracking-[0.24em] text-white/80 transition hover:bg-white/10"
          >
            Back Home
          </a>
        </header>

        <div className="flex-1 space-y-12">
          {PASSES.map((pass) => (
            <TicketCard key={pass.id} item={pass} />
          ))}
        </div>
      </main>
    </div>
  );
}

function TicketCard({ item }: { item: PassItem }) {
  const statusStyles: Record<
    TicketStatus,
    {
      label: string;
      icon: JSX.Element;
      chipClasses: string;
    }
  > = {
    approved: {
      label: "Approved",
      icon: <CheckCircle2 className="h-4 w-4" />,
      chipClasses:
        "bg-emerald-500/15 text-emerald-200 ring-1 ring-inset ring-emerald-400/40 shadow-[0_0_28px_rgba(16,185,129,0.35)]",
    },
    pending: {
      label: "Pending",
      icon: <Clock3 className="h-4 w-4" />,
      chipClasses: "bg-white/10 text-white/80 ring-1 ring-inset ring-white/15",
    },
    postponed: {
      label: "Postponed",
      icon: <XCircle className="h-4 w-4" />,
      chipClasses: "bg-white/5 text-white/60 ring-1 ring-inset ring-white/10",
    },
  };

  const status = statusStyles[item.status];
  const isApproved = item.status === "approved";

  return (
    <article className="relative overflow-hidden rounded-[28px] border border-white/10 bg-white/5 shadow-[0_45px_120px_-40px_rgba(0,0,0,0.8)] backdrop-blur-xl transition hover:border-white/20">
      <div
        className="absolute inset-0 scale-105 bg-cover bg-center opacity-90"
        style={{ backgroundImage: `url(${item.background})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-br from-black/75 via-black/55 to-black/90" />
      <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-white/10 via-transparent to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black via-black/60 to-transparent" />

      <div className="relative z-10 flex flex-col gap-8 px-7 pb-8 pt-10 sm:px-10 sm:pb-10 lg:flex-row lg:gap-10">
        <div className="flex-1 space-y-6">
          <div className="inline-flex items-center gap-3 rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-[11px] uppercase tracking-[0.28em] text-white/80 backdrop-blur">
            <TicketIcon className="h-4 w-4 text-white/60" />
            {item.host ? (
              <span className="flex items-center gap-3">
                <span className="relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border border-white/30 bg-white/10">
                  <img
                    src={item.host.avatar}
                    alt={item.host.handle}
                    className="h-full w-full object-cover"
                  />
                </span>
                <span className="tracking-[0.12em] text-white/75">Host {item.host.handle}</span>
              </span>
            ) : (
              <span className="tracking-[0.12em] text-white/75">Open Invitation Request</span>
            )}
          </div>

          <div className="space-y-4">
            <h2 className="font-serif text-[34px] leading-[1.1] tracking-[-0.035em] text-[#F9F5EC] drop-shadow-[0_10px_45px_rgba(0,0,0,0.65)] sm:text-[40px]">
              {item.clubName}
            </h2>
            <p className="flex flex-wrap items-center gap-3 text-sm text-white/75 sm:text-base">
              <MapPin className="h-4 w-4 opacity-75" />
              <span className="truncate text-white/85 sm:whitespace-nowrap">
                {item.address}, {item.city}
              </span>
            </p>
          </div>
        </div>

        <div className="flex flex-col justify-between gap-6 lg:w-[260px]">
          <div className="flex flex-col items-end gap-4 text-right sm:items-end">
            <span
              className={`inline-flex items-center gap-2 rounded-full px-4 py-1 text-[11px] uppercase tracking-[0.32em] ${status.chipClasses}`}
            >
              {status.icon}
              {status.label}
            </span>
            <div className="flex flex-col gap-3 text-sm text-white/80">
              <span className="inline-flex items-center justify-end gap-3">
                <CalendarDays className="h-4 w-4 opacity-75" />
                <span>{item.date}</span>
              </span>
              <span className="text-[26px] font-light tracking-[0.12em] text-white/90">
                {item.time}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-5 text-xs uppercase tracking-[0.32em] text-white/60">
            <span className="inline-flex items-center gap-2 text-[11px] tracking-[0.18em]">
              <Shield className="h-4 w-4" />
              Rules of conduct
            </span>
            <span className="hidden text-white/30 sm:inline">•</span>
            <button className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-[11px] tracking-[0.18em] text-white/75 transition hover:border-white/40 hover:text-white">
              <Shirt className="h-4 w-4" />
              Dress code
            </button>
            <span className="hidden text-white/30 sm:inline">•</span>
            <button className="inline-flex items-center gap-2 text-[11px] tracking-[0.18em] text-white/65 transition hover:text-white">
              <RotateCcw className="h-4 w-4" />
              Cancellation
            </button>
          </div>

          {isApproved && (
            <button className="inline-flex items-center justify-center gap-2 self-end rounded-full border border-emerald-400/40 bg-emerald-500/10 px-5 py-2 text-sm font-medium text-emerald-200 shadow-[0_0_35px_rgba(16,185,129,0.35)] transition hover:border-emerald-300/70 hover:bg-emerald-500/20">
              <MessageCircle className="h-4 w-4" />
              Chat
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

export function __TestHost_NoRouter() {
  return (
    <div className="min-h-screen bg-[#030304] p-10">
      <MemberspassTickets />
    </div>
  );
}
