import * as React from "react";
import { searchLocations, type LocationLite } from "@/services/locations";

type Props =
  | {
      multi?: false;
      value: LocationLite | null;
      onChangeSingle: (loc: LocationLite | null) => void;
      placeholder?: string;
      disabled?: boolean;
    }
  | {
      multi: true;
      value: LocationLite[];
      onChange: (next: LocationLite[]) => void;
      placeholder?: string;
      disabled?: boolean;
      max?: number;
    };

export default function LocationSearchSelect(props: Props) {
  const multi = (props as any).multi === true;
  const disabled = Boolean((props as any).disabled);

  const [q, setQ] = React.useState("");
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [results, setResults] = React.useState<LocationLite[]>([]);
  const [active, setActive] = React.useState(0);
  const boxRef = React.useRef<HTMLDivElement | null>(null);
  const inputRef = React.useRef<HTMLInputElement | null>(null);

  const selectedList: LocationLite[] = multi
    ? (props as any).value
    : (props as any).value
    ? [(props as any).value]
    : [];

  const setSelectedList = (next: LocationLite[]) => {
    if (multi) (props as any).onChange(next);
    else (props as any).onChangeSingle(next[0] ?? null);
  };

  // debounce search
  React.useEffect(() => {
    let alive = true;
    const h = setTimeout(async () => {
      try {
        if (!q || disabled) { setResults([]); setLoading(false); return; }
        setLoading(true);
        const data = await searchLocations(q);
        if (!alive) return;
        const selectedIds = new Set(selectedList.map(s => s.id));
        setResults(data.filter(d => !selectedIds.has(d.id)));
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 220);
    return () => { alive = false; clearTimeout(h); };
  }, [q, JSON.stringify(selectedList), disabled]);

  // close on outside click
  React.useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!boxRef.current) return;
      if (!boxRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const add = (loc: LocationLite) => {
    if (disabled) return;
    if (multi) {
      const max = (props as any).max ?? 8;
      const next = [...selectedList];
      if (!next.find(x => x.id === loc.id) && next.length < max) next.push(loc);
      setSelectedList(next);
      setQ(""); setResults([]); setActive(0); setOpen(false);
      inputRef.current?.focus();
    } else {
      setSelectedList([loc]);
      setQ(""); setResults([]); setActive(0); setOpen(false);
    }
  };

  const removeAt = (i: number) => {
    if (disabled) return;
    const next = [...selectedList];
    next.splice(i, 1);
    setSelectedList(next);
    inputRef.current?.focus();
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      setActive(a => Math.min(a + 1, Math.max(results.length - 1, 0)));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive(a => Math.max(a - 1, 0));
    } else if (e.key === "Enter") {
      if (open && results[active]) { e.preventDefault(); add(results[active]); }
    } else if (e.key === "Backspace" && !q && selectedList.length && multi) {
      removeAt(selectedList.length - 1);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <div ref={boxRef} className="relative">
      <div
        className={`min-h-11 w-full rounded-xl border border-neutral-700/60 bg-neutral-900 px-2 py-1.5 flex flex-wrap gap-2 focus-within:ring-1 focus-within:ring-pink-500 ${disabled ? "opacity-60 cursor-not-allowed" : ""}`}
        onClick={() => { if (!disabled) inputRef.current?.focus(); setOpen(!disabled); }}
      >
        {selectedList.map((l, i) => (
          <span key={`${l.id}`} className="inline-flex items-center gap-2 rounded-full bg-neutral-800 px-2 py-1">
            <span className="h-5 w-5 grid place-items-center text-[11px]">📍</span>
            <span className="text-sm">
              {l.name}
              {l.region ? `, ${l.region}` : ""}{l.country ? `, ${l.country}` : ""}
            </span>
            {multi && !disabled && (
              <button
                type="button"
                className="ml-1 text-xs text-neutral-400 hover:text-white"
                onClick={() => removeAt(i)}
                aria-label={`Remove ${l.name}`}
              >
                ×
              </button>
            )}
          </span>
        ))}

        <input
          ref={inputRef}
          value={q}
          onChange={(e) => { setQ(e.target.value); setOpen(true); }}
          onKeyDown={onKeyDown}
          placeholder={(props as any).placeholder || "Search location…"}
          disabled={disabled}
          onFocus={() => !disabled && setOpen(true)}
          className="flex-1 bg-transparent outline-none text-sm placeholder:text-neutral-500 min-w-[140px]"
        />
      </div>

      {open && !disabled && (q || loading) && (
        <div className="absolute z-50 mt-1 w-full rounded-xl border border-neutral-700/60 bg-neutral-950 shadow-lg">
          {loading && <div className="px-3 py-2 text-sm text-neutral-400">Searching…</div>}
          {!loading && results.length === 0 && (
            <div className="px-3 py-2 text-sm text-neutral-400">No locations found</div>
          )}
          {!loading && results.map((l, i) => (
            <button
              key={`${l.id}`}
              type="button"
              onMouseEnter={() => setActive(i)}
              onClick={() => add(l)}
              className={`w-full px-3 py-2 text-left flex items-center gap-2 hover:bg-neutral-800 ${i===active ? "bg-neutral-800" : ""}`}
            >
              <span className="h-7 w-7 grid place-items-center">📍</span>
              <div className="min-w-0">
                <div className="truncate">
                  {l.name}{l.region ? `, ${l.region}` : ""}{l.country ? `, ${l.country}` : ""}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
