import { useAppLauncher } from "../../../context/AppLauncherContext";
import type { LauncherLayoutMode } from "../../../types/appLauncher";

const MODES: { id: LauncherLayoutMode; label: string }[] = [
  { id: "auto", label: "Автоматически" },
  { id: "list", label: "Вертикальный список" },
  { id: "grid", label: "Сетка" },
];

export function LauncherModeSection() {
  const { layoutMode, setLayoutMode } = useAppLauncher();

  return (
    <section className="space-y-2">
      <h3 className="text-[11px] font-semibold tracking-wider text-[var(--color-deck-muted)] uppercase">
        Режим лаунчера
      </h3>
      <div className="flex flex-col gap-1.5">
        {MODES.map((mode) => (
          <button
            key={mode.id}
            type="button"
            onClick={() => setLayoutMode(mode.id)}
            className={`rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${
              layoutMode === mode.id
                ? "bg-[var(--color-deck-accent)]/20 text-[var(--color-deck-text)] ring-1 ring-[var(--color-deck-accent)]/40"
                : "deck-surface text-[var(--color-deck-muted)] hover:bg-[var(--color-deck-surface-hover)]"
            }`}
          >
            {mode.id === "auto" ? (
              <>
                <span className="font-medium">Автоматически</span>
                <span className="mt-0.5 block text-xs opacity-70">
                  Список до 9 · Сетка если &gt;9
                </span>
              </>
            ) : (
              mode.label
            )}
          </button>
        ))}
      </div>
    </section>
  );
}
