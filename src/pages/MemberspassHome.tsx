import React, { useMemo, useState } from "react";
import { Compass, Crown, Moon, PlusCircle, Sun, Ticket, User, Users } from "lucide-react";

type Club = {
  id: string;
  name: string;
  city: string;
  tonight: number;
  image: string;
  type: "day" | "night";
};

const CLUBS: Club[] = [
  {
    id: "cipriani-mi",
    name: "Cipriani Milano",
    city: "Milano",
    tonight: 27,
    image:
      "https://images.unsplash.com/photo-1532635042-50d0b7e96c57?q=80&w=1887&auto=format&fit=crop",
    type: "night",
  },
  {
    id: "sanctuary-mi",
    name: "The Sanctuary",
    city: "Milano",
    tonight: 18,
    image:
      "https://images.unsplash.com/photo-1541542684-4a3a964f3c1a?q=80&w=1887&auto=format&fit=crop",
    type: "day",
  },
  {
    id: "giardino25",
    name: "Giardino 25",
    city: "Milano",
    tonight: 12,
    image:
      "https://images.unsplash.com/photo-1521017432531-fbd92d1cf066?q=80&w=1887&auto=format&fit=crop",
    type: "night",
  },
  {
    id: "casa-cipriani-dxb",
    name: "Casa Cipriani",
    city: "Dubai",
    tonight: 22,
    image:
      "https://images.unsplash.com/photo-1542353436-312f0fa2c4f6?q=80&w=1887&auto=format&fit=crop",
    type: "night",
  },
  {
    id: "twiggy-dubai",
    name: "Twiggy by La Cantine",
    city: "Dubai",
    tonight: 9,
    image:
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=1887&auto=format&fit=crop",
    type: "day",
  },
];

export default function MemberspassHome() {
  const [tab, setTab] = useState<"night" | "day">("night");

  const filtered = useMemo(() => CLUBS.filter((club) => club.type === tab), [tab]);
  const totalTonight = useMemo(() => CLUBS.reduce((total, club) => total + (club.tonight || 0), 0), []);

  return (
    <div className="relative min-h-screen w-full bg-[radial-gradient(1200px_600px_at_50%_-10%,#1b1f1d_0%,#0b0b0b_60%,#090909_100%)] text-[#F3F3F3]">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-[radial-gradient(600px_80px_at_50%_0%,rgba(255,255,255,0.12),rgba(255,255,255,0)_70%)]" />

      <header className="sticky top-0 z-30 backdrop-blur-xl/0">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 pt-6 pb-3">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#101411] ring-1 ring-white/5 shadow-inner">
              <Crown className="h-4 w-4 text-[#C9C9C9]" />
            </div>
            <h1 className="font-serif text-xl tracking-[0.02em]">Members Clubs</h1>
          </div>

          <div className="flex items-center gap-3 text-sm text-zinc-300/90">
            <Users className="h-4 w-4 opacity-70" />
            <span className="uppercase tracking-wide">{totalTonight} checking in tonight</span>
          </div>
        </div>

        <div className="mx-auto max-w-5xl px-5 pb-4">
          <div className="inline-flex rounded-2xl border border-white/10 bg-[#101211]/60 p-1">
            <button
              onClick={() => setTab("day")}
              className={`group inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm transition ${
                tab === "day" ? "bg-white/5 text-white" : "text-zinc-300 hover:text-white"
              }`}
            >
              <Sun className="h-4 w-4 opacity-80" /> Day Activities
            </button>
            <button
              onClick={() => setTab("night")}
              className={`group inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm transition ${
                tab === "night" ? "bg-white/5 text-white" : "text-zinc-300 hover:text-white"
              }`}
            >
              <Moon className="h-4 w-4 opacity-80" /> Night
            </button>
          </div>
        </div>
        <div className="mx-auto max-w-5xl px-5">
          <div className="h-px w-full bg-gradient-to-r from-transparent via-emerald-400/20 to-transparent" />
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-5 pb-32 pt-4">
        <ul className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {filtered.map((club) => (
            <li
              key={club.id}
              className="group relative overflow-hidden rounded-2xl ring-1 ring-white/5 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.6)]"
            >
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-[1.03]"
                style={{ backgroundImage: `url(${club.image})` }}
              />

              <div className="absolute inset-0 bg-black/45 transition-colors group-hover:bg-black/40" />

              <div className="relative z-10 p-4 md:p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-serif text-lg drop-shadow-[0_1px_0_rgba(0,0,0,0.6)] md:text-xl">{club.name}</h3>
                    <p className="text-sm text-zinc-300/85">{club.city}</p>
                  </div>
                  <div className="rounded-xl bg-black/50 px-3 py-2 text-xs backdrop-blur-md ring-1 ring-white/10">
                    <span className="opacity-80">Tonight</span>
                    <span className="mx-2 inline-block h-1 w-1 rounded-full bg-emerald-400/60 align-middle" />
                    <span className="font-medium">{club.tonight}</span>
                  </div>
                </div>

                <div className="mt-28" />

                <div className="flex items-center justify-between">
                  <button className="rounded-xl bg-white/5 px-4 py-2 text-sm font-medium text-white/95 ring-1 ring-emerald-400/30 backdrop-blur-md transition hover:ring-emerald-400/60">
                    Request Pass
                  </button>
                  <button className="rounded-xl px-3 py-2 text-xs text-zinc-300/90 transition hover:text-white">Details</button>
                </div>
              </div>

              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/70 to-transparent" />
            </li>
          ))}
        </ul>
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-30 mx-auto mb-5 max-w-5xl px-5">
        <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-[#0E0F0F]/80 px-4 py-3 backdrop-blur-xl">
          <div className="flex flex-1 items-center justify-around text-zinc-300/90">
            <IconTab label="Clubs" active>
              <Crown className="h-5 w-5" />
            </IconTab>
            <IconTab label="Passes">
              <Ticket className="h-5 w-5" />
            </IconTab>
            <div className="-mt-8">
              <button className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-[#0E1210] p-3 shadow-xl ring-1 ring-white/5 transition hover:scale-[1.03]">
                <PlusCircle className="h-6 w-6 text-white" />
              </button>
            </div>
            <IconTab label="Explore">
              <Compass className="h-5 w-5" />
            </IconTab>
            <IconTab label="Profile">
              <User className="h-5 w-5" />
            </IconTab>
          </div>
        </div>
      </nav>
    </div>
  );
}

type IconTabProps = {
  label: string;
  active?: boolean;
  children: React.ReactNode;
};

function IconTab({ label, active = false, children }: IconTabProps) {
  return (
    <button
      className={`flex flex-col items-center gap-1 rounded-xl px-3 py-1.5 text-xs transition ${
        active ? "text-white" : "text-zinc-300 hover:text-white"
      }`}
    >
      <span className="opacity-90">{children}</span>
      <span className="uppercase tracking-wide">{label}</span>
    </button>
  );
}
