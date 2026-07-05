import { useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useAppLauncher } from "../../../context/AppLauncherContext";
import type { CustomFilter } from "../../../types/appLauncher";
import { CategoryAppsEditor } from "./CategoryAppsEditor";
import { CategoryAssignmentBoard } from "./CategoryAssignmentBoard";

export function CategoriesSection() {
  const {
    filterSettings,
    showShortcutBar,
    addFilter,
    updateFilter,
    removeFilter,
    setFiltersEnabled,
    setShowShortcutBar,
  } = useAppLauncher();
  const [newLabel, setNewLabel] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState("");
  const [editingCategory, setEditingCategory] = useState<CustomFilter | null>(
    null,
  );

  const handleAdd = () => {
    if (!newLabel.trim()) return;
    addFilter(newLabel);
    setNewLabel("");
  };

  const startEdit = (id: string, label: string) => {
    setEditingId(id);
    setEditLabel(label);
  };

  const saveEdit = () => {
    if (editingId && editLabel.trim()) {
      updateFilter(editingId, editLabel);
    }
    setEditingId(null);
    setEditLabel("");
  };

  if (editingCategory) {
    return (
      <CategoryAppsEditor
        category={editingCategory}
        onClose={() => setEditingCategory(null)}
      />
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden">
      <section className="shrink-0 space-y-3">
        <h3 className="text-[11px] font-semibold tracking-wider text-[var(--color-deck-muted)] uppercase">
          Категории
        </h3>

        <label className="flex cursor-pointer items-center justify-between rounded-lg deck-surface px-3 py-2.5">
          <span className="text-sm">Показывать категории на главном экране</span>
          <input
            type="checkbox"
            checked={filterSettings.enabled}
            onChange={(e) => setFiltersEnabled(e.target.checked)}
            className="h-4 w-4 accent-[var(--color-deck-accent)]"
          />
        </label>

        <label className="flex cursor-pointer items-center justify-between rounded-lg deck-surface px-3 py-2.5">
          <span className="text-sm">Показывать шорткаты на главном экране</span>
          <input
            type="checkbox"
            checked={showShortcutBar}
            onChange={(e) => setShowShortcutBar(e.target.checked)}
            className="h-4 w-4 accent-[var(--color-deck-accent)]"
          />
        </label>

        <div className="flex gap-2">
          <input
            type="text"
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleAdd();
            }}
            placeholder="Новая категория…"
            className="min-w-0 flex-1 rounded-lg border deck-border bg-transparent px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-[var(--color-deck-accent)]/50"
          />
          <button
            type="button"
            onClick={handleAdd}
            disabled={!newLabel.trim()}
            className="flex shrink-0 items-center gap-1 rounded-lg bg-[var(--color-deck-accent)] px-3 py-2 text-xs font-medium text-white disabled:opacity-40"
          >
            <Plus className="h-3.5 w-3.5" />
            Добавить
          </button>
        </div>

        {filterSettings.filters.length > 0 && (
          <ul className="space-y-1">
            {filterSettings.filters.map((filter) => (
              <li
                key={filter.id}
                className="flex items-center gap-2 rounded-lg deck-surface px-2 py-1.5"
              >
                {editingId === filter.id ? (
                  <input
                    type="text"
                    value={editLabel}
                    onChange={(e) => setEditLabel(e.target.value)}
                    onBlur={saveEdit}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") saveEdit();
                      if (e.key === "Escape") setEditingId(null);
                    }}
                    autoFocus
                    className="min-w-0 flex-1 rounded border deck-border bg-transparent px-2 py-1 text-sm outline-none"
                  />
                ) : (
                  <span className="min-w-0 flex-1 truncate text-sm">
                    {filter.label}
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => startEdit(filter.id, filter.label)}
                  className="rounded p-1 text-[var(--color-deck-muted)] hover:bg-[var(--color-deck-surface-hover)]"
                  aria-label="Редактировать"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => removeFilter(filter.id)}
                  className="rounded p-1 text-[var(--color-deck-muted)] hover:bg-[var(--color-deck-surface-hover)] hover:text-red-400"
                  aria-label="Удалить"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <CategoryAssignmentBoard onEditCategory={setEditingCategory} />
    </div>
  );
}
