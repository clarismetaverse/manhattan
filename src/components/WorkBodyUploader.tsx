import React from "react";

export type WBFile = File & { __url?: string };

type Props = {
  files: WBFile[];
  onChange: (files: WBFile[]) => void;
  max?: number; // default 12
};

export default function WorkBodyUploader({ files, onChange, max = 12 }: Props) {
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const [dragIdx, setDragIdx] = React.useState<number | null>(null);
  const [isOver, setIsOver] = React.useState(false);

  const withPreview = (f: File): WBFile => Object.assign(f, { __url: URL.createObjectURL(f) });
  const dedupMerge = (current: WBFile[], added: File[]) => {
    const key = (f: File) => `${f.name}_${f.size}_${(f as any).lastModified ?? ""}`;
    const map = new Map(current.map(f => [key(f), f]));
    for (const f of added) {
      const k = key(f);
      if (!map.has(k)) map.set(k, withPreview(f));
    }
    return Array.from(map.values()).slice(0, max);
  };

  const handleInput = (filesList: FileList | null) => {
    if (!filesList) return;
    onChange(dedupMerge(files, Array.from(filesList)));
  };

  const handleClickAdd = () => inputRef.current?.click();

  // Reorder
  const onDragStart = (i: number) => (e: React.DragEvent) => {
    setDragIdx(i);
    e.dataTransfer.effectAllowed = "move";
  };
  const onDragOver = (i: number) => (e: React.DragEvent) => {
    e.preventDefault();
  };
  const onDrop = (i: number) => (e: React.DragEvent) => {
    e.preventDefault();
    if (dragIdx === null || dragIdx === i) return;
    const next = [...files];
    const [moved] = next.splice(dragIdx, 1);
    next.splice(i, 0, moved);
    onChange(next);
    setDragIdx(null);
  };

  // Drop add
  const onContainerDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsOver(false);
    const fl = e.dataTransfer.files;
    if (fl && fl.length) onChange(dedupMerge(files, Array.from(fl)));
  };

  // Paste support
  React.useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      const items = Array.from(e.clipboardData?.files ?? []);
      if (items.length) onChange(dedupMerge(files, items));
    };
    window.addEventListener("paste", onPaste as any);
    return () => window.removeEventListener("paste", onPaste as any);
  }, [files]);

  return (
    <div
      className={`rounded-xl border-2 border-dashed p-2 transition-colors ${
        isOver ? "border-pink-500 bg-pink-500/5" : "border-neutral-400 dark:border-neutral-700"
      }`}
      onDragOver={(e) => { e.preventDefault(); setIsOver(true); }}
      onDragLeave={() => setIsOver(false)}
      onDrop={onContainerDrop}
    >
      <div className="grid grid-cols-3 gap-2">
        {files.map((f, i) => (
          <div
            key={i}
            className={`group relative aspect-square overflow-hidden rounded-lg border ${
              dragIdx === i ? "ring-2 ring-pink-500" : "border-neutral-200 dark:border-neutral-700"
            }`}
            draggable
            onDragStart={onDragStart(i)}
            onDragOver={onDragOver(i)}
            onDrop={onDrop(i)}
            title={f.name}
          >
            <img src={f.__url as string} alt={f.name} className="h-full w-full object-cover" />
            <div className="absolute inset-x-1 top-1 flex justify-between opacity-0 group-hover:opacity-100 transition">
              <button
                type="button"
                className="rounded-md bg-black/60 px-2 py-1 text-[11px] text-white"
                onClick={() => { const next = [...files]; next.splice(i, 1); onChange(next); }}
              >
                Remove
              </button>
              <label className="rounded-md bg-black/60 px-2 py-1 text-[11px] text-white cursor-pointer">
                Replace
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const fl = e.target.files?.[0];
                    if (!fl) return;
                    const next = [...files]; next[i] = withPreview(fl); onChange(next);
                  }}
                />
              </label>
            </div>
            <div className="pointer-events-none absolute bottom-1 right-1 rounded bg-black/60 px-1.5 py-0.5 text-[10px] text-white">
              Drag to reorder
            </div>
          </div>
        ))}

        {/* Add tile */}
        {files.length < max && (
          <button
            type="button"
            onClick={handleClickAdd}
            className="group relative aspect-square rounded-lg border-2 border-dashed border-neutral-400 dark:border-neutral-700 hover:border-pink-500 transition-colors"
          >
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-pink-500 text-white group-hover:bg-pink-600 transition">
                <span className="text-2xl font-bold leading-none">+</span>
              </div>
              <span className="mt-2 text-xs opacity-80">Add images</span>
            </div>
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => handleInput(e.target.files)}
      />

      <div className="mt-2 flex items-center justify-between text-[11px] opacity-70">
        <span>{files.length}/{max} selected • Drag to reorder • Paste or Drop files</span>
        <button
          type="button"
          onClick={handleClickAdd}
          className="rounded-full bg-black text-white dark:bg-white dark:text-black px-3 py-1 text-[11px]"
        >
          + Add more
        </button>
      </div>
    </div>
  );
}
