import {
  FILTER_TAGS,
  FILTER_TAG_LABELS,
  type FilterTag,
} from "../../types/appLauncher";

type FilterTagsProps = {
  active: FilterTag;
  onChange: (tag: FilterTag) => void;
};

export function FilterTags({ active, onChange }: FilterTagsProps) {
  return (
    <div className="flex flex-wrap gap-1.5 px-4 py-2.5">
      {FILTER_TAGS.map((tag) => (
        <button
          key={tag}
          type="button"
          onClick={() => onChange(tag)}
          className={`rounded-full px-3 py-1 text-xs transition-colors ${
            active === tag
              ? "bg-[var(--color-deck-accent)] text-white"
              : "deck-surface text-[var(--color-deck-muted)] hover:bg-[var(--color-deck-surface-hover)] hover:text-[var(--color-deck-text)]"
          }`}
        >
          {FILTER_TAG_LABELS[tag]}
        </button>
      ))}
    </div>
  );
}
