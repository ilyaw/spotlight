import { useMemo, useState } from "react";
import { ChevronLeft } from "lucide-react";
import { useAppLauncher } from "../../../context/AppLauncherContext";
import type { CustomFilter } from "../../../types/appLauncher";

type CategoryAppsEditorProps = {
  category: CustomFilter;
  onClose: () => void;
};

export function CategoryAppsEditor({ category, onClose }: CategoryAppsEditorProps) {
  const { apps, updateAppCategories } = useAppLauncher();

  const initialSelected = useMemo(
    () =>
      new Set(
        apps.filter((a) => a.categoryIds.includes(category.id)).map((a) => a.path),
      ),
    [apps, category.id],
  );

  const [draft, setDraft] = useState<Set<string>>(() => new Set(initialSelected));

  const toggleApp = (path: string) => {
    setDraft((prev) => {
      const next = new Set(prev);
      if (next.has(path)) next.delete(path);
      else next.add(path);
      return next;
    });
  };

  const handleSave = () => {
    for (const app of apps) {
      const wasSelected = initialSelected.has(app.path);
      const isSelected = draft.has(app.path);
      if (wasSelected === isSelected) continue;

      const nextIds = isSelected
        ? [...app.categoryIds, category.id]
        : app.categoryIds.filter((id) => id !== category.id);
      updateAppCategories(app.path, nextIds);
    }
    onClose();
  };

  const hasChanges =
    draft.size !== initialSelected.size ||
    apps.some((a) => draft.has(a.path) !== initialSelected.has(a.path));

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <div className="flex shrink-0 items-center gap-2 border-b deck-border px-1 pb-3">
        <button
          type="button"
          onClick={onClose}
          className="flex items-center gap-1 rounded-md px-2 py-1 text-sm text-[var(--color-deck-muted)] transition-colors hover:bg-[var(--color-deck-surface-hover)] hover:text-[var(--color-deck-text)]"
        >
          <ChevronLeft className="h-4 w-4" />
          Назад
        </button>
        <h3 className="text-sm font-semibold">{category.label}</h3>
        <span className="text-xs text-[var(--color-deck-muted)]">
          — состав категории
        </span>
      </div>

      <div className="deck-scroll-area min-h-0 flex-1 overflow-y-auto py-3">
        <ul className="space-y-1">
          {apps.map((app) => {
            const checked = draft.has(app.path);
            return (
              <li key={app.path}>
                <label
                  className={`flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 transition-colors ${
                    checked
                      ? "bg-[var(--color-deck-accent)]/10 ring-1 ring-[var(--color-deck-accent)]/30"
                      : "hover:bg-[var(--color-deck-surface-hover)]"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleApp(app.path)}
                    className="h-4 w-4 accent-[var(--color-deck-accent)]"
                  />
                  {app.icon ? (
                    <img
                      src={app.icon}
                      alt=""
                      className="h-8 w-8 shrink-0 rounded-lg object-contain"
                    />
                  ) : (
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg deck-surface text-xs text-[var(--color-deck-muted)]">
                      ?
                    </span>
                  )}
                  <span className="min-w-0 flex-1 truncate text-sm">{app.name}</span>
                </label>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="flex shrink-0 justify-end gap-2 border-t deck-border pt-3">
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg px-3 py-2 text-xs text-[var(--color-deck-muted)] hover:bg-[var(--color-deck-surface-hover)]"
        >
          Отмена
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={!hasChanges}
          className="rounded-lg bg-[var(--color-deck-accent)] px-3 py-2 text-xs font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-40"
        >
          Сохранить
        </button>
      </div>
    </div>
  );
}
