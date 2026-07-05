import { useAppLauncher } from "../../context/AppLauncherContext";

type FilterTagsProps = {
  active: string | "all";
  onChange: (tag: string | "all") => void;
};

export function FilterTags({ active, onChange }: FilterTagsProps) {
  const { filterSettings } = useAppLauncher();

  return (
    <div className="flex flex-wrap gap-1.5 px-4 py-2.5">
      <button
        type="button"
        onClick={() => onChange("all")}
        className={`rounded-full px-3 py-1 text-xs transition-colors ${
          active === "all"
            ? "bg-[var(--color-deck-accent)] text-white"
            : "deck-surface text-[var(--color-deck-muted)] hover:bg-[var(--color-deck-surface-hover)] hover:text-[var(--color-deck-text)]"
        }`}
      >
        Все
      </button>
      {filterSettings.filters.map((filter) => (
        <button
          key={filter.id}
          type="button"
          onClick={() => onChange(filter.id)}
          className={`rounded-full px-3 py-1 text-xs transition-colors ${
            active === filter.id
              ? "bg-[var(--color-deck-accent)] text-white"
              : "deck-surface text-[var(--color-deck-muted)] hover:bg-[var(--color-deck-surface-hover)] hover:text-[var(--color-deck-text)]"
          }`}
        >
          {filter.label}
        </button>
      ))}
    </div>
  );
}
