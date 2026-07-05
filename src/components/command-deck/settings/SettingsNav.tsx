export type SettingsTab =
  | "launcher"
  | "apps"
  | "categories"
  | "shortcuts"
  | "appearance"
  | "system";

type SettingsNavProps = {
  active: SettingsTab;
  onChange: (tab: SettingsTab) => void;
};

const TABS: { id: SettingsTab; label: string }[] = [
  { id: "launcher", label: "Режим" },
  { id: "apps", label: "Приложения" },
  { id: "categories", label: "Категории" },
  { id: "shortcuts", label: "Горячие клавиши" },
  { id: "appearance", label: "Оформление" },
  { id: "system", label: "Система" },
];

export function SettingsNav({ active, onChange }: SettingsNavProps) {
  return (
    <nav className="flex w-[200px] shrink-0 flex-col gap-1 border-r deck-border px-3 py-4">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onChange(tab.id)}
          className={`rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${
            active === tab.id
              ? "bg-[var(--color-deck-accent)]/20 text-[var(--color-deck-text)] ring-1 ring-[var(--color-deck-accent)]/40"
              : "text-[var(--color-deck-muted)] hover:bg-[var(--color-deck-surface-hover)] hover:text-[var(--color-deck-text)]"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  );
}
