import { Check, Pencil } from "lucide-react";
import {
  BUILTIN_THEME_PICKER_HEX,
  DEFAULT_THEME_GRADIENT,
  type CustomTheme,
  type ThemeId,
  type ThemeMode,
} from "../../../../types/theme";

type ThemeLibraryGridProps = {
  activeId: ThemeId;
  customThemes: CustomTheme[];
  onSelect: (id: ThemeId) => void;
  onEdit: (theme: CustomTheme) => void;
};

const BUILTINS: { id: ThemeMode; label: string }[] = [
  { id: "dark", label: "Тёмная" },
  { id: "light", label: "Светлая" },
];

function ThemeCard({
  label,
  bg,
  accent,
  gradientColors,
  active,
  onSelect,
  onEdit,
}: {
  label: string;
  bg: string;
  accent: string;
  gradientColors: string[];
  active: boolean;
  onSelect: () => void;
  onEdit?: () => void;
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-lg border transition-colors duration-200 ${
        active
          ? "border-[var(--color-deck-accent)] bg-[var(--color-deck-surface-hover)]"
          : "border-transparent deck-surface hover:border-[var(--color-deck-border)]"
      }`}
    >
      <button
        type="button"
        onClick={onSelect}
        className="flex w-full flex-col gap-1.5 p-2 text-left cursor-pointer"
        aria-pressed={active}
        aria-label={`Тема: ${label}${active ? ", активна" : ""}`}
      >
        <div
          className="relative h-10 w-full overflow-hidden rounded-md"
          style={{ background: bg }}
          aria-hidden
        >
          <div
            className="absolute inset-x-0 bottom-0 h-1.5"
            style={{ background: accent }}
          />
          <div
            className="absolute inset-x-1 top-1.5 h-2 rounded-sm opacity-90"
            style={{
              background: `linear-gradient(90deg, ${gradientColors.join(", ")})`,
            }}
          />
          {active && (
            <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--color-deck-accent)] text-white">
              <Check className="h-2.5 w-2.5" strokeWidth={3} />
            </span>
          )}
        </div>
        <span
          className={`truncate text-[10px] leading-tight ${
            active
              ? "text-[var(--color-deck-text)]"
              : "text-[var(--color-deck-muted)]"
          }`}
        >
          {label}
        </span>
      </button>
      {onEdit && (
        <button
          type="button"
          onClick={onEdit}
          className="absolute top-1 left-1 cursor-pointer rounded-md bg-black/35 p-1 text-white/90 backdrop-blur-sm transition-opacity duration-200 hover:bg-black/50"
          aria-label={`Редактировать тему ${label}`}
        >
          <Pencil className="h-3 w-3" />
        </button>
      )}
    </div>
  );
}

export function ThemeLibraryGrid({
  activeId,
  customThemes,
  onSelect,
  onEdit,
}: ThemeLibraryGridProps) {
  return (
    <div className="grid grid-cols-3 gap-1.5">
      {BUILTINS.map((b) => {
        const colors = BUILTIN_THEME_PICKER_HEX[b.id];
        return (
          <ThemeCard
            key={b.id}
            label={b.label}
            bg={colors.bg}
            accent={colors.accent}
            gradientColors={DEFAULT_THEME_GRADIENT.colors}
            active={activeId === b.id}
            onSelect={() => onSelect(b.id)}
          />
        );
      })}
      {customThemes.map((theme) => (
        <ThemeCard
          key={theme.id}
          label={theme.name}
          bg={theme.colors.bg}
          accent={theme.colors.accent}
          gradientColors={theme.gradient.colors}
          active={activeId === theme.id}
          onSelect={() => onSelect(theme.id)}
          onEdit={() => onEdit(theme)}
        />
      ))}
    </div>
  );
}
