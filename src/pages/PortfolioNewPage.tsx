import React, { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { getAuthToken, request } from "@/services/xano";
import WorkBodyUploader, { WBFile } from "@/components/WorkBodyUploader";

type BrandLite = { id: number; BrandName: string; LogoBrand?: { url?: string } };
type UserLite  = { id: number; handle?: string; name?: string; avatar?: { url?: string } };

type FormData = {
  Name: string;
  Deliverables: string;             // "Reel", "Stories", etc.
  Shooting_Location: string;        // id o testo
  KPI?: string;                     // facoltativa — "Key: Value" per riga
};

const input = "w-full rounded-xl border px-3 py-2 text-sm bg-white dark:bg-neutral-900 border-neutral-300 dark:border-neutral-700 placeholder:text-neutral-400";
const label = "text-xs font-medium text-neutral-700 dark:text-neutral-200";

// Endpoints di ricerca (aggiusta se hai path diversi)
const BRAND_SEARCH_PATH = import.meta.env.VITE_XANO_BRAND_SEARCH || "/brands/search";
const USER_SEARCH_PATH  = import.meta.env.VITE_XANO_USER_SEARCH  || "/users/search";

function useDebounced<T>(value: T, delay = 300) {
  const [v, setV] = useState(value);
  React.useEffect(() => {
    const id = setTimeout(() => setV(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return v;
}

const Chip: React.FC<React.PropsWithChildren<{ onRemove?: () => void }>> = ({ children, onRemove }) => (
  <span className="inline-flex items-center gap-1 rounded-full bg-neutral-200 dark:bg-neutral-800 px-2 py-1 text-xs">
    {children}
    {onRemove && (
      <button type="button" onClick={onRemove} className="ml-1 text-[11px] opacity-70 hover:opacity-100">✕</button>
    )}
  </span>
);

function parseKPI(text?: string) {
  const rows = (text || "").split("\n").map(s => s.trim()).filter(Boolean);
  return rows.map((row, i) => {
    const [k, ...rest] = row.split(":");
    const key = (k || `kpi_${i}`).trim();
    const val = rest.join(":").trim();
    return { [key]: val };
  });
}

const PortfolioNewPage: React.FC = () => {

  // --- RHF base (campi testuali) ---
  const { register, handleSubmit, formState: { isSubmitting } } = useForm<FormData>({
    defaultValues: {
      Name: "",
      Deliverables: "Reel",
      Shooting_Location: "",
      KPI: "",
    }
  });

  // --- State per Upload ---
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [heroFile, setHeroFile]   = useState<File | null>(null);
  const [workFiles, setWorkFiles] = useState<WBFile[]>([]);

  // --- Brand search (multi) ---
  const [brandQuery, setBrandQuery] = useState("");
  const debBrand = useDebounced(brandQuery, 300);
  const [brandOpts, setBrandOpts]   = useState<BrandLite[]>([]);
  const [brandsSel, setBrandsSel]   = useState<BrandLite[]>([]);

  React.useEffect(() => {
    (async () => {
      if (!debBrand) { setBrandOpts([]); return; }
      try {
        const res = await request<BrandLite[] | { items: BrandLite[] }>(`${BRAND_SEARCH_PATH}?q=${encodeURIComponent(debBrand)}`);
        const list = Array.isArray(res) ? res : (res as any)?.items || [];
        setBrandOpts(list);
      } catch {
        setBrandOpts([]);
      }
    })();
  }, [debBrand]);

  // --- Team search (multi) ---
  const [teamQuery, setTeamQuery] = useState("");
  const debTeam = useDebounced(teamQuery, 300);
  const [teamOpts, setTeamOpts]   = useState<UserLite[]>([]);
  const [teamSel, setTeamSel]     = useState<UserLite[]>([]);

  React.useEffect(() => {
    (async () => {
      if (!debTeam) { setTeamOpts([]); return; }
      try {
        const res = await request<UserLite[] | { items: UserLite[] }>(`${USER_SEARCH_PATH}?q=${encodeURIComponent(debTeam)}`);
        const list = Array.isArray(res) ? res : (res as any)?.items || [];
        setTeamOpts(list);
      } catch {
        setTeamOpts([]);
      }
    })();
  }, [debTeam]);

  // --- Helpers ---
  const previewCover = useMemo(() => (coverFile ? URL.createObjectURL(coverFile) : null), [coverFile]);
  const previewHero  = useMemo(() => (heroFile ? URL.createObjectURL(heroFile) : null), [heroFile]);

  // --- Submit ---
  async function onSubmit(v: FormData) {
    const token = getAuthToken();

    const form = new FormData();

    if (v.Name) form.append("Name", v.Name.trim());
    if (v.Deliverables) form.append("Deliverables", v.Deliverables);
    if (v.Shooting_Location) {
      const raw = v.Shooting_Location.trim();
      if (raw) {
        const loc = Number(raw);
        form.append(
          "Shooting_Location",
          !Number.isNaN(loc) && loc > 0 ? String(loc) : raw
        );
      }
    }

    if (brandsSel.length) form.append("Brand", JSON.stringify(brandsSel.map(b => b.id)));
    if (teamSel.length) form.append("Team", JSON.stringify(teamSel.map(u => u.id)));

    if (v.KPI) form.append("KPI", JSON.stringify(parseKPI(v.KPI)));

    if (coverFile) form.append("Cover", coverFile);
    if (heroFile) form.append("Hero", heroFile);
    workFiles.forEach(f => form.append("Work_Body[]", f));

    const res = await fetch("https://xbut-eryu-hhsg.f2.xano.io/api:vGd6XDW3/portfolio", {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      body: form,
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      console.error("[/portfolio] POST failed", res.status, errText);
      alert(`Create failed: ${res.status}`);
      return;
    }

    const created = await res.json().catch(() => ({} as any));
    const newId = created?.id ?? created?.portfolio_id ?? created?.data?.id;
    if (newId) {
      window.location.href = `/case/${encodeURIComponent(String(newId))}`;
    } else {
      console.log("Create OK but no id in response", created);
      alert("Created, but missing ID in response.");
    }
  }

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-50">
      <header className="sticky top-0 z-30 bg-white/80 dark:bg-neutral-900/80 backdrop-blur border-b border-neutral-200 dark:border-neutral-800">
        <div className="max-w-md mx-auto px-4 h-14 flex items-center">
          <button onClick={() => window.history.back()} className="text-sm opacity-80">← Back</button>
          <div className="ml-auto text-sm font-semibold">New Portfolio</div>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 py-6 space-y-6">
        {/* --- Base fields --- */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label className={label}>Name</label>
            <input {...register("Name", { minLength: 2 })} className={input} placeholder="Agua Swimwear • Summer" />
          </div>

          <div>
            <label className={label}>Deliverables</label>
            <select {...register("Deliverables")} className={input}>
              <option>Reel</option>
              <option>Stories</option>
              <option>Post</option>
              <option>Carousel</option>
              <option>Short Video</option>
              <option>Gallery</option>
            </select>
          </div>

          <div>
            <label className={label}>Shooting Location (id o testo)</label>
            <input {...register("Shooting_Location")} className={input} placeholder="421 o 'Los Angeles, CA'" />
          </div>

          {/* --- Brand multi-search --- */}
          <div>
            <label className={label}>Brands</label>
            <div className="flex gap-2 flex-wrap mb-2">
              {brandsSel.map(b => (
                <Chip key={b.id} onRemove={() => setBrandsSel(prev => prev.filter(x => x.id !== b.id))}>
                  {b.BrandName}
                </Chip>
              ))}
            </div>
            <input
              value={brandQuery}
              onChange={(e) => setBrandQuery(e.target.value)}
              className={input}
              placeholder="Cerca brand..."
            />
            {!!brandOpts.length && (
              <div className="mt-2 rounded-xl border bg-white dark:bg-neutral-900 max-h-48 overflow-auto">
                {brandOpts.map(o => (
                  <button
                    key={o.id}
                    type="button"
                    onClick={() => {
                      if (!brandsSel.find(b => b.id === o.id)) setBrandsSel(prev => [...prev, o]);
                      setBrandQuery("");
                      setBrandOpts([]);
                    }}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800"
                  >
                    {o.BrandName}
                  </button>
                ))}
              </div>
            )}
            <div className="mt-2">
              <button
                type="button"
                onClick={() => alert("Create Brand: coming soon")}
                className="text-xs underline opacity-80"
              >
                + Create Brand (coming soon)
              </button>
            </div>
          </div>

          {/* --- Team multi-search --- */}
          <div>
            <label className={label}>Team</label>
            <div className="flex gap-2 flex-wrap mb-2">
              {teamSel.map(u => (
                <Chip key={u.id} onRemove={() => setTeamSel(prev => prev.filter(x => x.id !== u.id))}>
                  {u.handle || u.name || `User #${u.id}`}
                </Chip>
              ))}
            </div>
            <input
              value={teamQuery}
              onChange={(e) => setTeamQuery(e.target.value)}
              className={input}
              placeholder="Cerca utente..."
            />
            {!!teamOpts.length && (
              <div className="mt-2 rounded-xl border bg-white dark:bg-neutral-900 max-h-48 overflow-auto">
                {teamOpts.map(o => (
                  <button
                    key={o.id}
                    type="button"
                    onClick={() => {
                      if (!teamSel.find(u => u.id === o.id)) setTeamSel(prev => [...prev, o]);
                      setTeamQuery("");
                      setTeamOpts([]);
                    }}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800"
                  >
                    {o.handle || o.name || `User #${o.id}`}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* --- Uploaders --- */}
          {/* Cover upload */}
          <div>
            <label className={label}>Cover (immagine singola)</label>
            <div className="mt-2">
              <label
                htmlFor="cover-upload"
                className="group relative flex h-36 w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-neutral-400 dark:border-neutral-700 hover:border-pink-500 transition-colors"
              >
                {previewCover ? (
                  <img src={previewCover} alt="cover" className="absolute inset-0 h-full w-full object-cover rounded-xl" />
                ) : (
                  <div className="flex flex-col items-center justify-center text-center">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-pink-500 text-white group-hover:bg-pink-600 transition-colors">
                      <span className="text-2xl font-bold leading-none">+</span>
                    </div>
                    <span className="mt-2 text-xs opacity-80">Aggiungi Cover</span>
                  </div>
                )}
              </label>
              <input
                id="cover-upload"
                type="file"
                accept="image/*"
                onChange={(e) => setCoverFile(e.target.files?.[0] || null)}
                className="hidden"
              />
            </div>
          </div>

          {/* Hero upload */}
          <div>
            <label className={label}>Hero (immagine singola)</label>
            <div className="mt-2">
              <label
                htmlFor="hero-upload"
                className="group relative flex h-36 w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-neutral-400 dark:border-neutral-700 hover:border-pink-500 transition-colors"
              >
                {previewHero ? (
                  <img src={previewHero} alt="hero" className="absolute inset-0 h-full w-full object-cover rounded-xl" />
                ) : (
                  <div className="flex flex-col items-center justify-center text-center">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-pink-500 text-white group-hover:bg-pink-600 transition-colors">
                      <span className="text-2xl font-bold leading-none">+</span>
                    </div>
                    <span className="mt-2 text-xs opacity-80">Aggiungi Hero</span>
                  </div>
                )}
              </label>
              <input
                id="hero-upload"
                type="file"
                accept="image/*"
                onChange={(e) => setHeroFile(e.target.files?.[0] || null)}
                className="hidden"
              />
            </div>
          </div>

          <div>
            <label className={label}>Work Body (più immagini)</label>
            <div className="mt-2">
              <WorkBodyUploader files={workFiles} onChange={setWorkFiles} max={12} />
            </div>
          </div>

          {/* KPI facoltativa */}
          <div>
            <label className={label}>KPI (facoltativa — 'Key: Value' per riga)</label>
            <textarea {...register("KPI")} rows={4} className={input} placeholder={"Reach: 2.5M\nEngagement: 8.5%"} />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-xl py-2 text-sm font-semibold bg-black text-white dark:bg-white dark:text-black disabled:opacity-60"
          >
            {isSubmitting ? "Saving…" : "Create Portfolio"}
          </button>
        </form>
      </main>
    </div>
  );
};

export default PortfolioNewPage;
