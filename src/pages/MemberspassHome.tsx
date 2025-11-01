import React, { useMemo, useState } from "react";
import {
  Compass,
  Crown,
  Moon,
  PlusCircle,
  Sun,
  Ticket,
  User,
  Users,
} from "lucide-react";

const CLUBS = [
  {
    id: "cipriani-mi",
    name: "Cipriani Milano",
    city: "Milano",
    tonight: 27,
    image:
      "https://images.unsplash.com/photo-1532635042-50d0b7e96c57?q=80&w=1887&auto=format&fit=crop",
    type: "night" as const,
  },
  {
    id: "sanctuary-mi",
    name: "The Sanctuary",
    city: "Milano",
    tonight: 18,
    image:
      "https://images.unsplash.com/photo-1541542684-4a3a964f3c1a?q=80&w=1887&auto=format&fit=crop",
    type: "day" as const,
  },
  {
    id: "giardino25",
    name: "Giardino 25",
    city: "Milano",
    tonight: 12,
    image:
      "https://images.unsplash.com/photo-1521017432531-fbd92d1cf066?q=80&w=1887&auto=format&fit=crop",
    type: "night" as const,
  },
  {
    id: "casa-cipriani-dxb",
    name: "Casa Cipriani",
    city: "Dubai",
    tonight: 22,
    image:
      "https://images.unsplash.com/photo-1542353436-312f0fa2c4f6?q=80&w=1887&auto=format&fit=crop",
    type: "night" as const,
  },
  {
    id: "twiggy-dubai",
    name: "Twiggy by La Cantine",
    city: "Dubai",
    tonight: 9,
    image:
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=1887&auto=format&fit=crop",
    type: "day" as const,
  },
];

const SECTION_ORDER: Array<{ key: "day" | "night"; title: string }> = [
  { key: "day", title: "Day Activities" },
  { key: "night", title: "Night" },
];

export default function MemberspassHome() {
  const [tab, setTab] = useState<"day" | "night">("night");
  const tonightCount = 23;

  const sections = useMemo(
    () =>
      SECTION_ORDER.map(({ key, title }) => ({
        key,
        title,
        items: CLUBS.filter((club) => club.type === key),
      })),
    [],
  );

  return (
    <div
      className="relative min-h-screen w-full overflow-x-hidden bg-[linear-gradient(180deg,#0B0B0B_0%,#121212_65%)] text-[#F5F2E9]"
      style={{ fontFamily: '"Neue Haas Grotesk", sans-serif' }}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[320px] bg-[radial-gradient(60%_160px_at_50%_0%,rgba(255,255,255,0.22),rgba(255,255,255,0))]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[480px] bg-[linear-gradient(180deg,rgba(255,255,255,0.08)_0%,rgba(0,0,0,0)_55%)]" />

      <header className="relative z-30 mx-auto max-w-6xl px-6 pt-16 pb-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-[18px] border border-white/10 bg-black/50 shadow-[0_12px_32px_-18px_rgba(0,0,0,0.9)] backdrop-blur-xl">
              <Crown className="h-5 w-5 text-[#E7E4DA]" />
            </div>
            <div>
              <h1
                className="text-3xl tracking-[0.02em] text-[#F6F1E4]"
                style={{ fontFamily: '"Canela", serif' }}
              >
                Members Clubs
              </h1>
              <p className="mt-1 text-[11px] uppercase tracking-[0.32em] text-[#C6C4BB]/70">
                Access for top models in Milan & Dubai
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-[18px] border border-white/10 bg-[#111111]/70 px-5 py-3 text-[11px] uppercase tracking-[0.3em] text-[#C6C4BB]/80 backdrop-blur-xl">
            <Users className="h-4 w-4 text-[#C6C4BB]/80" />
            <span>{tonightCount} Members checking in tonight</span>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <span className="text-[11px] uppercase tracking-[0.32em] text-[#BEBBB2]/60">
            Night / Day Activities
          </span>
          <div className="inline-flex items-center gap-1 rounded-[18px] border border-white/10 bg-[#0F1010]/70 p-1.5 backdrop-blur-2xl">
            <TogglePill
              icon={<Sun className="h-4 w-4" />}
              label="Day"
              active={tab === "day"}
              onClick={() => setTab("day")}
            />
            <TogglePill
              icon={<Moon className="h-4 w-4" />}
              label="Night"
              active={tab === "night"}
              onClick={() => setTab("night")}
            />
          </div>
        </div>

        <div className="mt-8 h-px w-full bg-gradient-to-r from-transparent via-white/15 to-transparent" />
      </header>

      <main className="relative z-20 mx-auto max-w-6xl space-y-16 px-6 pb-40">
        {sections.map((section) => (
          <section
            key={section.key}
            className={`transition-all duration-300 ease-out ${
              tab === section.key ? "opacity-100" : "opacity-60"
            }`}
          >
            <div className="flex items-center justify-between">
              <h2
                className="text-2xl tracking-[0.08em] text-[#F6F1E4]"
                style={{ fontFamily: '"Canela", serif' }}
              >
                {section.title}
              </h2>
              <span className="text-[11px] uppercase tracking-[0.32em] text-[#BEBBB2]/70">
                {section.items.length} curated clubs
              </span>
            </div>

            <ul className="mt-8 space-y-8">
              {section.items.map((club) => (
                <li
                  key={club.id}
                  className="group relative overflow-hidden rounded-[18px] border border-white/12 bg-black/40 shadow-[0_18px_60px_-24px_rgba(0,0,0,0.9)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_30px_70px_-30px_rgba(0,0,0,0.95)]"
                >
                  <div
                    className="absolute inset-0 scale-105 bg-cover bg-center opacity-70 transition-transform duration-500 ease-out group-hover:scale-110"
                    style={{
                      backgroundImage: `url(${club.image})`,
                    }}
                  />

                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(0,0,0,0.35),rgba(0,0,0,0.75))] transition-colors duration-300 group-hover:bg-[radial-gradient(circle_at_30%_10%,rgba(0,0,0,0.3),rgba(0,0,0,0.75))]" />

                  <div className="relative z-10 flex flex-col justify-between gap-6 rounded-[18px] border border-white/10 bg-white/5 p-6 backdrop-blur-[24px] transition-colors duration-300 group-hover:border-[#00FFB3]/30">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-[11px] uppercase tracking-[0.4em] text-[#C6C4BB]/70">
                          {club.city}
                        </p>
                        <h3
                          className="mt-2 text-2xl tracking-[0.04em] text-[#F6F1E4] drop-shadow-[0_10px_25px_rgba(0,0,0,0.4)]"
                          style={{ fontFamily: '"Canela", serif' }}
                        >
                          {club.name}
                        </h3>
                      </div>
                      <div className="flex flex-col items-end gap-2 rounded-[16px] border border-white/10 bg-black/40 px-4 py-3 text-right text-[11px] uppercase tracking-[0.32em] text-[#C6C4BB]/80 backdrop-blur-xl">
                        <span className="text-[#BEBBB2]/70">Tonight</span>
                        <span className="flex items-center gap-2 text-sm tracking-[0.1em] text-[#F6F1E4]">
                          <span className="inline-block h-2 w-2 rounded-full bg-[#00FFB3] shadow-[0_0_12px_rgba(0,255,179,0.8)]" />
                          {club.tonight}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <button
                        className="inline-flex items-center justify-center gap-2 rounded-[18px] border border-[#00FFB3]/60 bg-transparent px-6 py-3 text-sm font-medium uppercase tracking-[0.3em] text-[#F6F1E4] transition duration-300 hover:border-[#00FFB3] hover:text-[#00FFB3]"
                      >
                        Request Pass
                      </button>
                      <span className="text-[11px] uppercase tracking-[0.32em] text-[#BEBBB2]/70 transition-colors duration-300 group-hover:text-[#F6F1E4]">
                        Tap to reveal cinematic preview
                      </span>
                    </div>
                  </div>

                  <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black via-black/40 to-transparent" />
                  <div className="pointer-events-none absolute inset-0 border border-white/5 opacity-0 transition-opacity duration-300 group-hover:opacity-40" />
                </li>
              ))}
            </ul>
          </section>
        ))}
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-30 mx-auto mb-6 w-full max-w-6xl px-6">
        <div className="relative overflow-hidden rounded-[22px] border border-white/10 bg-[#0C0C0C]/85 px-6 py-4 backdrop-blur-2xl">
          <div className="absolute inset-x-0 -top-12 h-24 bg-[radial-gradient(50%_100%_at_50%_0%,rgba(255,255,255,0.12),rgba(0,0,0,0))]" />
          <div className="relative flex items-center justify-between text-[#C6C4BB]/80">
            <IconTab label="Clubs" active>
              <Crown className="h-5 w-5" />
            </IconTab>
            <IconTab label="Passes">
              <Ticket className="h-5 w-5" />
            </IconTab>
            <div className="-mt-10">
              <button className="inline-flex h-16 w-16 items-center justify-center rounded-full border border-white/10 bg-[#111]/90 shadow-[0_20px_60px_-30px_rgba(0,0,0,0.9)] transition duration-300 hover:scale-105">
                <PlusCircle className="h-7 w-7 text-[#F6F1E4]" />
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

type TogglePillProps = {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick: () => void;
};

function TogglePill({ icon, label, active, onClick }: TogglePillProps) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 rounded-[16px] px-4 py-2 text-[11px] uppercase tracking-[0.32em] transition duration-300 ${
        active
          ? "border border-white/20 bg-white/10 text-[#F6F1E4]"
          : "text-[#BEBBB2]/80 hover:text-[#F6F1E4]"
      }`}
    >
      <span className="text-[#C6C4BB]/80">{icon}</span>
      {label}
    </button>
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
      className={`flex flex-col items-center gap-2 rounded-[16px] px-3 py-1.5 text-[10px] uppercase tracking-[0.32em] transition duration-300 ${
        active
          ? "text-[#00FFB3] shadow-[0_0_24px_rgba(0,255,179,0.35)]"
          : "text-[#C6C4BB]/80 hover:text-[#F6F1E4]"
      }`}
    >
      <span className={active ? "text-[#00FFB3]" : "text-[#C6C4BB]/80"}>{children}</span>
      {label}
    </button>
  );
}
