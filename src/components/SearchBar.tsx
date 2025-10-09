import { Search, X } from "lucide-react";

type Props = {
  value: string;
  onChange: (v: string) => void;
  onClose?: () => void;
  autoFocus?: boolean;
  placeholder?: string;
  className?: string;
};

export default function SearchBar({
  value,
  onChange,
  onClose,
  autoFocus,
  placeholder = "Search venues…",
  className = "",
}: Props) {
  return (
    <div
      className={[
        "flex items-center gap-2 rounded-2xl border border-border/60 bg-card/70 backdrop-blur-xl px-3 py-2",
        "focus-within:ring-2 focus-within:ring-red-500/40",
        "pointer-events-auto",
        className,
      ].join(" ")}
      style={{ WebkitBackdropFilter: "blur(8px)" }}
    >
      <Search className="h-4 w-4 text-gray-300" />

      <input
        autoFocus={autoFocus}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onInput={(e: any) => onChange(e.target.value)}
        placeholder={placeholder}
        className="flex-1 bg-transparent outline-none text-white placeholder:text-gray-400 text-sm"
        autoCapitalize="none"
        autoCorrect="off"
        spellCheck={false}
        inputMode="search"
        enterKeyHint="search"
      />

      {value ? (
        <button
          type="button"
          onClick={() => onChange("")}
          aria-label="Clear search"
          className="rounded-full p-1 hover:bg-white/5"
        >
          <X className="h-4 w-4 text-gray-300" />
        </button>
      ) : null}

      {onClose ? (
        <button
          type="button"
          onClick={onClose}
          aria-label="Close search"
          className="ml-1 rounded-full px-2 py-1 text-xs bg-white/10 hover:bg-white/15"
        >
          Close
        </button>
      ) : null}
    </div>
  );
}
