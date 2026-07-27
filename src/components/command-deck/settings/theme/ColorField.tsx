type ColorFieldProps = {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
};

function toHexInput(value: string): string {
  const trimmed = value.trim();
  if (/^#[0-9a-fA-F]{6}$/.test(trimmed)) return trimmed.toLowerCase();
  if (/^#[0-9a-fA-F]{3}$/.test(trimmed)) {
    const r = trimmed[1];
    const g = trimmed[2];
    const b = trimmed[3];
    return `#${r}${r}${g}${g}${b}${b}`.toLowerCase();
  }
  return "#888888";
}

export function ColorField({ id, label, value, onChange }: ColorFieldProps) {
  const hex = toHexInput(value);

  return (
    <div className="space-y-1">
      <label
        htmlFor={id}
        className="block text-[10px] font-medium tracking-wide text-[var(--color-deck-muted)] uppercase"
      >
        {label}
      </label>
      <div className="flex items-center gap-2">
        <input
          id={id}
          type="color"
          value={hex}
          onChange={(e) => onChange(e.target.value)}
          className="h-8 w-8 shrink-0 cursor-pointer rounded-md border deck-border bg-transparent p-0.5"
          aria-label={label}
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          spellCheck={false}
          className="font-mono-deck min-w-0 flex-1 rounded-md border deck-border bg-transparent px-2 py-1.5 text-[11px] text-[var(--color-deck-text)] outline-none transition-colors focus:ring-1 focus:ring-[var(--color-deck-accent)]/50"
          aria-label={`${label}, hex`}
        />
      </div>
    </div>
  );
}
