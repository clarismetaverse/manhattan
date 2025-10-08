import React, { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import WorkBodyUploader, { WBFile } from "@/components/WorkBodyUploader";
import BrandSearchSelect from "@/components/BrandSearchSelect";
import TeamSearchSelect, { type Teammate } from "@/components/TeamSearchSelect";
import type { BrandLite } from "@/services/brands";

type FormData = {
  Name: string;
  Deliverables: string;             // "Reel", "Stories", etc.
  Shooting_Location: string;        // id numerico
  KPI?: string;                     // facoltativa — "Key: Value" per riga
  About?: string;
};

const input = "w-full rounded-xl border px-3 py-2 text-sm bg-white dark:bg-neutral-900 border-neutral-300 dark:border-neutral-700 placeholder:text-neutral-400";
const label = "text-xs font-medium text-neutral-700 dark:text-neutral-200";

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

  const navigate = useNavigate();

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
  const [brandsSel, setBrandsSel]   = useState<BrandLite[]>([]);

  // --- Team search (multi) ---
  const [teamSel, setTeamSel] = useState<Teammate[]>([]);

  // --- Helpers ---
  const previewCover = useMemo(() => (coverFile ? URL.createObjectURL(coverFile) : null), [coverFile]);
  const previewHero  = useMemo(() => (heroFile ? URL.createObjectURL(heroFile) : null), [heroFile]);

  // --- Submit ---
  async function onSubmit(v: FormData) {
    const token =
      localStorage.getItem("user_turbo_id_token") ||
      localStorage.getItem("user_turbo_token") ||
      localStorage.getItem("auth_token") || "";

    const form = new FormData();

    if (v.Name) form.append("Name", v.Name.trim());
    if (v.Deliverables) form.append("Deliverables", v.Deliverables);
    if (v.Shooting_Location) {
      const loc = Number(v.Shooting_Location);
      if (!Number.isNaN(loc)) form.append("Shooting_Location", String(loc));
    }
    if (brandsSel.length) form.append("Brand", JSON.stringify(brandsSel.map(b => b.id)));
    if (teamSel.length) form.append("Team", JSON.stringify(teamSel.map(u => u.id)));
    if (teamSel.length) form.append("TeamRoles", JSON.stringify(teamSel.map(t => ({ id: t.id, role: t.role }))));
    if (v.KPI) form.append("KPI", JSON.stringify(parseKPI(v.KPI)));
    if (v.About) form.append("About", v.About);

    if (coverFile) form.append("CoverF", coverFile);
    if (heroFile) form.append("HeroF", heroFile);
    workFiles.forEach(f => form.append("Work_BodyF[]", f));

    const res = await fetch("https://xbut-eryu-hhsg.f2.xano.io/api:vGd6XDW3/portfolio", {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      body: form,
    });

    if (!res.ok) {
      const txt = await res.text().catch(() => "");
      console.error("Create portfolio failed", res.status, txt);
      alert(`Create failed: ${res.status}`);
      return;
    }

    const created = await res.json().catch(() => ({} as any));
    const newId = created?.id ?? created?.portfolio_id ?? created?.data?.id;
    if (newId) {
      navigate(`/case/${encodeURIComponent(String(newId))}`);
    } else {
      console.log("Created without id", created);
      alert("Created, but missing ID.");
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
            <div className="mt-2">
              <BrandSearchSelect value={brandsSel} onChange={setBrandsSel} disabled={isSubmitting} />
            </div>
          </div>

          {/* --- Team multi-search --- */}
          <div>
            <label className={label}>Team</label>
            <div className="mt-2">
              <TeamSearchSelect value={teamSel} onChange={setTeamSel} disabled={isSubmitting} />
            </div>
            <div className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">Seleziona utenti e imposta il ruolo.</div>
          </div>

          {/* --- Uploaders --- */}
          {/* Cover upload */}
          <div>
            <label className={label}>Cover (file → inviato come CoverF)</label>
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
            <label className={label}>Hero (file → inviato come HeroF)</label>
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
            <label className={label}>Work Body (più file → inviato come Work_BodyF[])</label>
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
