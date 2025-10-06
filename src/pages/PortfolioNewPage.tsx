import React, { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { getAuthToken } from "@/services/xano";
import { useNavigate } from "react-router-dom";
import WorkBodyUploader, { WBFile } from "@/components/WorkBodyUploader";

interface PortfolioFormValues {
  Name?: string;
  Deliverables?: string;
  Shooting_Location?: string;
  KPI?: string;
}

interface SelectedItem {
  id: number;
  label: string;
}

function parseIds(input: string): SelectedItem[] {
  return input
    .split(/[,\n]/)
    .map((token) => token.trim())
    .filter(Boolean)
    .map((token) => {
      const id = Number(token);
      return { id, label: token };
    })
    .filter((item) => !Number.isNaN(item.id) && item.id > 0);
}

function parseKPI(text?: string) {
  const rows = (text || "")
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
  return rows.map((row, i) => {
    const [k, ...rest] = row.split(":");
    const key = (k || `kpi_${i}`).trim();
    const val = rest.join(":").trim();
    return { [key]: val };
  });
}

const PortfolioNewPage: React.FC = () => {
  const navigate = useNavigate();
  const { register, handleSubmit, reset } = useForm<PortfolioFormValues>({
    defaultValues: {
      Name: "",
      Deliverables: "",
      Shooting_Location: "",
      KPI: "",
    },
  });

  const [brandInput, setBrandInput] = useState("");
  const [teamInput, setTeamInput] = useState("");
  const brandsSel = useMemo(() => parseIds(brandInput), [brandInput]);
  const teamSel = useMemo(() => parseIds(teamInput), [teamInput]);

  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [heroFile, setHeroFile] = useState<File | null>(null);
  const [workBodyFiles, setWorkBodyFiles] = useState<WBFile[]>([]);
  const workFiles = useMemo(() => workBodyFiles.filter(Boolean), [workBodyFiles]);

  async function onSubmit(v: PortfolioFormValues) {
    const token = getAuthToken();

    const form = new FormData();

    // text / numeric
    if (v.Name) form.append("Name", v.Name.trim());
    if (v.Deliverables) form.append("Deliverables", v.Deliverables);
    if (v.Shooting_Location) {
      const loc = Number(v.Shooting_Location);
      if (!Number.isNaN(loc) && loc > 0) form.append("Shooting_Location", String(loc));
    }

    // arrays (IDs as JSON)
    if (brandsSel.length) form.append("Brand", JSON.stringify(brandsSel.map((b) => b.id)));
    if (teamSel.length) form.append("Team", JSON.stringify(teamSel.map((u) => u.id)));

    // KPI optional (array of objects)
    if (v.KPI) form.append("KPI", JSON.stringify(parseKPI(v.KPI)));

    // files (direct)
    if (coverFile) form.append("Cover", coverFile);
    if (heroFile) form.append("Hero", heroFile);
    workFiles.forEach((f) => form.append("Work_Body[]", f));

    // POST directly to /portfolio as multipart (NO manual Content-Type)
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

    const created = (await res.json().catch(() => ({} as any))) as any;
    const newId = created?.id ?? created?.portfolio_id ?? created?.data?.id;
    if (newId) {
      window.location.href = `/case/${encodeURIComponent(String(newId))}`;
    } else {
      console.log("Create OK but no id in response", created);
      alert("Created, but missing ID in response.");
    }
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-8">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Create Portfolio</h1>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted"
        >
          Cancel
        </button>
      </header>

      <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
        <section className="grid gap-4">
          <label className="grid gap-2 text-sm font-medium">
            <span>Project Name</span>
            <input
              type="text"
              className="w-full rounded-md border px-3 py-2 text-sm"
              placeholder="e.g. Spring campaign"
              {...register("Name")}
            />
          </label>

          <label className="grid gap-2 text-sm font-medium">
            <span>Deliverables</span>
            <textarea
              className="min-h-[100px] w-full rounded-md border px-3 py-2 text-sm"
              placeholder="List your deliverables"
              {...register("Deliverables")}
            />
          </label>

          <label className="grid gap-2 text-sm font-medium">
            <span>Shooting Location (ID)</span>
            <input
              type="number"
              className="w-full rounded-md border px-3 py-2 text-sm"
              placeholder="Enter numeric location ID"
              {...register("Shooting_Location")}
            />
          </label>
        </section>

        <section className="grid gap-4">
          <div className="grid gap-2 text-sm font-medium">
            <span>Brands (IDs separated by comma)</span>
            <input
              value={brandInput}
              onChange={(e) => setBrandInput(e.target.value)}
              className="w-full rounded-md border px-3 py-2 text-sm"
              placeholder="e.g. 1,2,3"
            />
            {brandsSel.length > 0 && (
              <p className="text-xs text-muted-foreground">
                Sending IDs: {brandsSel.map((b) => b.id).join(", ")}
              </p>
            )}
          </div>

          <div className="grid gap-2 text-sm font-medium">
            <span>Team (IDs separated by comma)</span>
            <input
              value={teamInput}
              onChange={(e) => setTeamInput(e.target.value)}
              className="w-full rounded-md border px-3 py-2 text-sm"
              placeholder="e.g. 4,5,6"
            />
            {teamSel.length > 0 && (
              <p className="text-xs text-muted-foreground">
                Sending IDs: {teamSel.map((t) => t.id).join(", ")}
              </p>
            )}
          </div>
        </section>

        <section className="grid gap-4">
          <label className="grid gap-2 text-sm font-medium">
            <span>KPI (one per line, format label:value)</span>
            <textarea
              className="min-h-[100px] w-full rounded-md border px-3 py-2 text-sm"
              placeholder="Views: 150k\nCTR: 3.2%"
              {...register("KPI")}
            />
          </label>
        </section>

        <section className="grid gap-4">
          <div className="grid gap-2 text-sm font-medium">
            <span>Cover Image</span>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setCoverFile(e.target.files?.[0] || null)}
              className="w-full rounded-md border px-3 py-2 text-sm"
            />
            {coverFile && <p className="text-xs text-muted-foreground">Selected: {coverFile.name}</p>}
          </div>

          <div className="grid gap-2 text-sm font-medium">
            <span>Hero Image</span>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setHeroFile(e.target.files?.[0] || null)}
              className="w-full rounded-md border px-3 py-2 text-sm"
            />
            {heroFile && <p className="text-xs text-muted-foreground">Selected: {heroFile.name}</p>}
          </div>
        </section>

        <section className="grid gap-2 text-sm font-medium">
          <span>Work Body Assets</span>
          <WorkBodyUploader value={workBodyFiles} onChange={setWorkBodyFiles} />
        </section>

        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => {
              reset();
              setBrandInput("");
              setTeamInput("");
              setCoverFile(null);
              setHeroFile(null);
              setWorkBodyFiles([]);
            }}
            className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted"
          >
            Reset
          </button>
          <button
            type="submit"
            className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
          >
            Create Portfolio
          </button>
        </div>
      </form>
    </div>
  );
};

export default PortfolioNewPage;
