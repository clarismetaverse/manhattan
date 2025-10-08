import * as React from "react";
import { searchUsers, type UserLite } from "@/services/users";

export type Teammate = UserLite & { role: string };

type Props = {
  value: Teammate[];
  onChange: (next: Teammate[]) => void;
  placeholder?: string;
  disabled?: boolean;
  max?: number;
  roles?: string[];
};

const DEFAULT_ROLES = [
  "Photographer",
  "Videographer",
  "Model",
  "MUA",
  "Stylist",
  "Producer",
  "Assistant",
  "Retoucher",
  "Director",
  "Other",
];

export default function TeamSearchSelect({
  value,
  onChange,
  placeholder = "Cerca utente...",
  disabled,
  max = 10,
  roles = DEFAULT_ROLES,
}: Props) {
  const [q, setQ] = React.useState("");
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [results, setResults] = React.useState<UserLite[]>([]);
  const [active, setActive] = React.useState(0);
  const boxRef = React.useRef<HTMLDivElement | null>(null);
  const inputRef = React.useRef<HTMLInputElement | null>(null);

  React.useEffect(() => {
    let alive = true;
    const h = setTimeout(async () => {
      try {
        if (!q) {
          setResults([]);
          return;
        }
        setLoading(true);
        const r = await searchUsers(q);
        if (!alive) return;
        const selected = new Set(value.map(v => v.id));
        setResults(r.filter(u => !selected.has(u.id)));
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 220);
    return () => {
      alive = false;
      clearTimeout(h);
    };
  }, [q, value]);

  React.useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!boxRef.current) return;
      if (!boxRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const add = (u: UserLite) => {
    if (disabled) return;
    if (value.find(v => v.id === u.id)) return;
    if (value.length >= max) return;
    onChange([...value, { ...u, role: roles[0] }]);
    setQ("");
    setResults([]);
    setActive(0);
    inputRef.current?.focus();
  };

  const removeAt = (i: number) => {
    const next = [...value];
    next.splice(i, 1);
    onChange(next);
    inputRef.current?.focus();
  };

  const setRoleAt = (i: number, role: string) => {
    const next = [...value];
    next[i] = { ...next[i], role };
    onChange(next);
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
      if (open && results[active]) {
        e.preventDefault();
        add(results[active]);
      }
    } else if (e.key === "Backspace" && !q && value.length) {
      removeAt(value.length - 1);
    }
  };

  return (
    <div ref={boxRef} className="relative">
      <div
        className={`min-h-11 w-full rounded-xl border border-neutral-700/60 bg-neutral-900 px-2 py-1.5 flex flex-wrap gap-2 focus-within:ring-1 focus-within:ring-pink-500 ${disabled ? "opacity-60" : ""}`}
        onClick={() => inputRef.current?.focus()}
      >
        {value.map((u, i) => (
          <span key={u.id} className="inline-flex items-center gap-2 rounded-full bg-neutral-800 px-2 py-1">
            {u.avatar?.url ? (
              <img src={u.avatar.url || ""} alt="" className="h-5 w-5 rounded-full object-cover" />
            ) : (
              <span className="h-5 w-5 rounded-full bg-neutral-700 grid place-items-center text-[10px]">U</span>
            )}
            <span className="text-sm">{u.name || u.handle || `ID ${u.id}`}</span>
            <select
              value={u.role}
              onChange={e => setRoleAt(i, e.target.value)}
              className="ml-1 rounded-md bg-neutral-900 border border-neutral-700/60 text-xs px-1 py-0.5"
            >
              {roles.map(r => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
            <button
              type="button"
              className="ml-1 text-xs text-neutral-400 hover:text-white"
              onClick={() => removeAt(i)}
              aria-label={`Remove ${u.name || u.handle || u.id}`}
            >
              ×
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          value={q}
          onChange={e => {
            setQ(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          disabled={disabled || value.length >= max}
          className="flex-1 bg-transparent outline-none text-sm placeholder:text-neutral-500 min-w-[140px]"
        />
      </div>

      {open && (q || loading) && (
        <div className="absolute z-20 mt-1 w-full rounded-xl border border-neutral-700/60 bg-neutral-950 shadow-lg">
          {loading && <div className="px-3 py-2 text-sm text-neutral-400">Searching…</div>}
          {!loading && results.length === 0 && (
            <div className="px-3 py-2 text-sm text-neutral-400">Nessun utente trovato</div>
          )}
          {!loading &&
            results.map((u, i) => (
              <button
                key={u.id}
                type="button"
                onMouseEnter={() => setActive(i)}
                onClick={() => add(u)}
                className={`w-full px-3 py-2 text-left flex items-center gap-2 hover:bg-neutral-800 ${i === active ? "bg-neutral-800" : ""}`}
              >
                {u.avatar?.url ? (
                  <img src={u.avatar.url || ""} className="h-7 w-7 rounded-md object-cover" />
                ) : (
                  <div className="h-7 w-7 rounded-md bg-neutral-700 grid place-items-center text-[10px]">U</div>
                )}
                <div className="min-w-0">
                  <div className="truncate">{u.name || u.handle || `ID ${u.id}`}</div>
                  {u.handle && <div className="text-xs text-neutral-400 truncate">{u.handle}</div>}
                </div>
              </button>
            ))}
        </div>
      )}
    </div>
  );
}
