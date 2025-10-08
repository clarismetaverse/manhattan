import React from "react";
import { searchBrands } from "@/services/brands";
import type { BrandLite } from "@/services/brands";

type Props = {
  value: BrandLite[];
  onChange: (next: BrandLite[]) => void;
  placeholder?: string;
  disabled?: boolean;
  max?: number;
};

const DEBOUNCE = 220;

const chipClass =
  "flex items-center gap-2 rounded-full border border-neutral-700 bg-neutral-800/80 px-3 py-1 text-xs text-neutral-100";

const dropdownItemClass =
  "flex w-full items-center gap-3 px-3 py-2 text-left text-sm text-neutral-200 hover:bg-neutral-800/60";

const logoClass = "h-6 w-6 flex-shrink-0 overflow-hidden rounded-full bg-neutral-800 object-cover";

const BrandSearchSelect: React.FC<Props> = ({
  value,
  onChange,
  placeholder = "Search brands…",
  disabled,
  max,
}) => {
  const [query, setQuery] = React.useState("");
  const [options, setOptions] = React.useState<BrandLite[]>([]);
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [highlight, setHighlight] = React.useState(0);

  const containerRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const reachedMax = typeof max === "number" && value.length >= max;

  const debouncedQuery = useDebouncedValue(query, DEBOUNCE);

  React.useEffect(() => {
    let active = true;

    async function run() {
      if (!debouncedQuery.trim()) {
        setOptions([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      const results = await searchBrands(debouncedQuery, 8);
      if (!active) return;

      const filtered = results.filter((brand) => !value.some((v) => v.id === brand.id));
      setOptions(filtered);
      setLoading(false);
      setHighlight(0);
    }

    run();

    return () => {
      active = false;
    };
  }, [debouncedQuery, value]);

  React.useEffect(() => {
    if (disabled) {
      setOpen(false);
    }
  }, [disabled]);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    window.addEventListener("mousedown", handleClickOutside);
    return () => window.removeEventListener("mousedown", handleClickOutside);
  }, []);

  React.useEffect(() => {
    if (!open) {
      setOptions([]);
    }
  }, [open]);

  const handleSelect = React.useCallback(
    (brand: BrandLite) => {
      if (value.some((b) => b.id === brand.id)) return;
      if (reachedMax) return;
      onChange([...value, brand]);
      setQuery("");
      setOptions([]);
      setOpen(false);
      setHighlight(0);
      inputRef.current?.focus();
    },
    [onChange, reachedMax, value]
  );

  const handleRemove = React.useCallback(
    (id: number) => {
      onChange(value.filter((brand) => brand.id !== id));
    },
    [onChange, value]
  );

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setOpen(true);
      setHighlight((prev) => (options.length ? (prev + 1) % options.length : 0));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setHighlight((prev) => (options.length ? (prev - 1 + options.length) % options.length : 0));
    } else if (event.key === "Enter") {
      if (open && options[highlight]) {
        event.preventDefault();
        handleSelect(options[highlight]);
      }
    } else if (event.key === "Escape") {
      setOpen(false);
    } else if (event.key === "Backspace" && !query) {
      if (value.length) {
        event.preventDefault();
        handleRemove(value[value.length - 1].id);
      }
    }
  };

  const showDropdown = open && (loading || options.length > 0 || query.trim().length > 0);

  return (
    <div ref={containerRef} className="relative">
      <div
        className={`flex min-h-[3rem] flex-wrap items-center gap-2 rounded-xl border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm text-neutral-100 transition focus-within:border-pink-500 focus-within:ring-1 focus-within:ring-pink-500 ${
          disabled ? "cursor-not-allowed opacity-60" : ""
        }`}
        onClick={() => {
          if (disabled) return;
          setOpen(true);
          inputRef.current?.focus();
        }}
      >
        {value.map((brand) => (
          <span key={brand.id} className={chipClass}>
            {brand.LogoBrand?.url ? (
              <img src={brand.LogoBrand.url} alt={brand.BrandName} className={logoClass} />
            ) : (
              <span className={`${logoClass} flex items-center justify-center text-[10px] text-neutral-400`}>B</span>
            )}
            <span className="truncate max-w-[8rem]">{brand.BrandName}</span>
            {!disabled && (
              <button
                type="button"
                className="text-neutral-400 transition hover:text-pink-400"
                onClick={(event) => {
                  event.stopPropagation();
                  handleRemove(brand.id);
                }}
              >
                ×
              </button>
            )}
          </span>
        ))}

        {!reachedMax && (
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setOpen(true);
            }}
            onFocus={() => !disabled && setOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder={value.length === 0 ? placeholder : ""}
            disabled={disabled}
            className="flex-1 min-w-[6rem] bg-transparent text-sm text-neutral-100 placeholder:text-neutral-500 focus:outline-none"
          />
        )}

        {reachedMax && value.length > 0 && (
          <span className="text-xs text-neutral-500">Max {max} brands</span>
        )}
      </div>

      {showDropdown && !disabled && (
        <div className="absolute left-0 right-0 z-20 mt-2 overflow-hidden rounded-xl border border-neutral-700/60 bg-neutral-950 shadow-xl">
          <div className="max-h-64 overflow-y-auto">
            {loading && (
              <div className="px-3 py-2 text-sm text-neutral-500">Searching…</div>
            )}
            {!loading && options.length === 0 && (
              <div className="px-3 py-2 text-sm text-neutral-600">No brands found.</div>
            )}
            {options.map((brand, index) => (
              <button
                key={brand.id}
                type="button"
                onClick={() => handleSelect(brand)}
                className={`${dropdownItemClass} ${index === highlight ? "bg-neutral-800/80" : ""}`}
              >
                {brand.LogoBrand?.url ? (
                  <img src={brand.LogoBrand.url} alt={brand.BrandName} className={logoClass} />
                ) : (
                  <span className={`${logoClass} flex items-center justify-center text-[10px] text-neutral-500`}>B</span>
                )}
                <span className="flex-1 truncate">{brand.BrandName}</span>
              </button>
            ))}
          </div>
          <div className="border-t border-neutral-800/60 px-3 py-2 text-xs text-neutral-500">
            + Create Brand (coming soon)
          </div>
        </div>
      )}
    </div>
  );
};

function useDebouncedValue<T>(value: T, delay: number) {
  const [debounced, setDebounced] = React.useState(value);

  React.useEffect(() => {
    const id = window.setTimeout(() => setDebounced(value), delay);
    return () => window.clearTimeout(id);
  }, [value, delay]);

  return debounced;
}

export default BrandSearchSelect;
