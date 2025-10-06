import React from "react";

export type WBFile = File;

interface WorkBodyUploaderProps {
  value: WBFile[];
  onChange: (files: WBFile[]) => void;
  label?: string;
}

const WorkBodyUploader: React.FC<WorkBodyUploaderProps> = ({ value, onChange, label }) => {
  function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files ? Array.from(e.target.files) : [];
    onChange(files);
  }

  function handleRemove(index: number) {
    const next = value.filter((_, i) => i !== index);
    onChange(next);
  }

  return (
    <div className="space-y-2">
      {label ? <label className="text-sm font-medium text-foreground">{label}</label> : null}
      <input
        type="file"
        multiple
        onChange={handleFiles}
        className="block w-full text-sm text-foreground file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
      />
      {value.length > 0 && (
        <ul className="space-y-1 text-sm">
          {value.map((file, index) => (
            <li key={`${file.name}-${index}`} className="flex items-center justify-between rounded-md border px-2 py-1">
              <span className="truncate">{file.name}</span>
              <button
                type="button"
                onClick={() => handleRemove(index)}
                className="text-xs font-medium text-destructive hover:underline"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default WorkBodyUploader;
