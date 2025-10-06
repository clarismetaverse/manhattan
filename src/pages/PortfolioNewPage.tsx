import React from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { request } from "@/services/xano";

type FormData = {
  Name: string; // usi già p.Name nelle card: lo salviamo
  Deliverables: string; // es. "Reel"
  brandIds: string; // "1,3,9" → Brand: number[]
  Shooting_Location: string; // id o testo
  CoverUrl: string; // → Cover: { url }
  HeroUrl: string; // → Hero: { url }
  WorkBodyUrls: string; // ogni riga un URL → Work_Body: [{url}]
  KPI?: string; // facoltativa — ogni riga "Chiave: Valore" → [{ key: value }]
};

function parseIds(csv: string): number[] {
  return csv
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .map(Number)
    .filter((n) => !Number.isNaN(n));
}
const toFile = (url?: string) => (url ? { url } : undefined);
const parseWorkBody = (txt: string) =>
  txt
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean)
    .map((url) => ({ url }));
const parseKPI = (txt?: string) =>
  (txt || "")
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean)
    .map((row, i) => {
      const [k, ...rest] = row.split(":");
      const key = (k || `kpi_${i}`).trim();
      const val = rest.join(":").trim();
      return { [key]: val };
    });

const input =
  "w-full rounded-xl border px-3 py-2 text-sm bg-white dark:bg-neutral-900 border-neutral-300 dark:border-neutral-700 placeholder:text-neutral-400";
const label = "text-xs font-medium text-neutral-700 dark:text-neutral-200";

const PortfolioNewPage: React.FC = () => {
  const nav = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<FormData>({
    defaultValues: {
      Name: "",
      Deliverables: "Reel",
      brandIds: "",
      Shooting_Location: "",
      CoverUrl: "",
      HeroUrl: "",
      WorkBodyUrls: "",
      KPI: "",
    },
  });

  async function onSubmit(v: FormData) {
    const body: any = {
      Name: v.Name?.trim() || undefined,
      Deliverables: v.Deliverables,
      Brand: parseIds(v.brandIds),
      Shooting_Location: v.Shooting_Location || undefined,
      Cover: toFile(v.CoverUrl),
      Hero: toFile(v.HeroUrl),
      Work_Body: parseWorkBody(v.WorkBodyUrls),
      KPI: v.KPI ? parseKPI(v.KPI) : undefined, // facoltativa
    };

    // pulisci chiavi vuote
    Object.keys(body).forEach((k) => {
      const val = body[k];
      const emptyArr = Array.isArray(val) && val.length === 0;
      if (val === undefined || val === "" || emptyArr) delete body[k];
    });

    const created = await request<any>("/portfolio", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const newId = created?.id ?? created?.portfolio_id ?? created?.data?.id;
    if (newId != null) {
      // redirect coerente con PROView: /case/:id
      nav(`/case/${encodeURIComponent(String(newId))}`);
    } else {
      alert("Creato, ma non ho ricevuto l'ID. Controlla la risposta Xano in console.");
      console.log("Xano create response:", created);
    }
  }

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-50">
      <header className="sticky top-0 z-30 bg-white/80 dark:bg-neutral-900/80 backdrop-blur border-b border-neutral-200 dark:border-neutral-800">
        <div className="max-w-md mx-auto px-4 h-14 flex items-center">
          <button onClick={() => window.history.back()} className="text-sm opacity-80">
            ← Back
          </button>
          <div className="ml-auto text-sm font-semibold">New Portfolio</div>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 py-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className={label}>Name</label>
            <input
              {...register("Name", { minLength: 2 })}
              className={input}
              placeholder="Agua Swimwear • Summer"
            />
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
            <label className={label}>Brand IDs (comma separated)</label>
            <input {...register("brandIds")} className={input} placeholder="1,3,9" />
          </div>

          <div>
            <label className={label}>Shooting Location (id o testo)</label>
            <input
              {...register("Shooting_Location")}
              className={input}
              placeholder="421 o 'Los Angeles, CA'"
            />
          </div>

          <div>
            <label className={label}>Cover URL</label>
            <input {...register("CoverUrl")} className={input} placeholder="https://.../cover.png" />
          </div>

          <div>
            <label className={label}>Hero URL</label>
            <input {...register("HeroUrl")} className={input} placeholder="https://.../hero.png" />
          </div>

          <div>
            <label className={label}>Work Body URLs (una per riga)</label>
            <textarea
              {...register("WorkBodyUrls")}
              rows={5}
              className={input}
              placeholder={"https://.../img1.png\nhttps://.../img2.png"}
            />
          </div>

          <div>
            <label className={label}>KPI (facoltativa — 'Chiave: Valore' per riga)</label>
            <textarea
              {...register("KPI")}
              rows={4}
              className={input}
              placeholder={"Reach: 2.5M\nEngagement: 8.5%"}
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-xl py-2 text-sm font-semibold bg-black text-white dark:bg-white dark:text-black disabled:opacity-60"
          >
            {isSubmitting ? "Saving…" : "Create Portfolio"}
          </button>
        </form>

        <p className="text-[11px] opacity-70 mt-3">
          Suggerimento: prima carica le immagini nel Vault Xano e incolla qui gli URL restituiti.
        </p>
      </main>
    </div>
  );
};

export default PortfolioNewPage;
