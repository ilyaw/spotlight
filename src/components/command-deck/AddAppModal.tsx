import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { fetchAppMetadata } from "../../lib/tauriApps";
import { useAppLauncher } from "../../context/AppLauncherContext";
import { shouldShowFilters } from "../../types/appLauncher";

type AddAppModalProps = {
  path: string;
  onClose: () => void;
};

export function AddAppModal({ path, onClose }: AddAppModalProps) {
  const { addManualApp, filterSettings } = useAppLauncher();
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("");
  const [categoryIds, setCategoryIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const showCategories = shouldShowFilters(filterSettings);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    void fetchAppMetadata(path)
      .then((meta) => {
        if (cancelled) return;
        setName(meta.name);
        setIcon(meta.icon);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(
          err instanceof Error ? err.message : "Не удалось загрузить данные",
        );
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [path]);

  const toggleCategory = (id: string) => {
    setCategoryIds((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id],
    );
  };

  const handleSave = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    addManualApp({
      path,
      name: trimmed,
      icon,
      categoryIds,
    });
    onClose();
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 8 }}
          transition={{ type: "spring", stiffness: 400, damping: 32 }}
          className="deck-panel w-full max-w-sm rounded-[var(--radius-deck)] border deck-border p-4 shadow-xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold">Добавить приложение</h3>
            <button
              type="button"
              onClick={onClose}
              className="rounded-md p-1 text-[var(--color-deck-muted)] hover:bg-[var(--color-deck-surface-hover)]"
              aria-label="Закрыть"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {loading ? (
            <p className="py-6 text-center text-sm text-[var(--color-deck-muted)]">
              Загрузка…
            </p>
          ) : error ? (
            <p className="py-4 text-center text-sm text-red-400">{error}</p>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                {icon ? (
                  <img
                    src={icon}
                    alt=""
                    className="h-12 w-12 shrink-0 rounded-lg object-contain"
                  />
                ) : (
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg deck-surface text-xs text-[var(--color-deck-muted)]">
                    ?
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  <label className="mb-1 block text-[10px] font-medium tracking-wide text-[var(--color-deck-muted)] uppercase">
                    Название
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-lg border deck-border bg-transparent px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-[var(--color-deck-accent)]/50"
                  />
                </div>
              </div>

              {showCategories && (
                <div>
                  <p className="mb-2 text-[10px] font-medium tracking-wide text-[var(--color-deck-muted)] uppercase">
                    Категории
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {filterSettings.filters.map((filter) => {
                      const checked = categoryIds.includes(filter.id);
                      return (
                        <label
                          key={filter.id}
                          className={`flex cursor-pointer items-center gap-1.5 rounded-full px-3 py-1 text-xs transition-colors ${
                            checked
                              ? "bg-[var(--color-deck-accent)] text-white"
                              : "deck-surface text-[var(--color-deck-muted)] hover:bg-[var(--color-deck-surface-hover)]"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleCategory(filter.id)}
                            className="sr-only"
                          />
                          {filter.label}
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-1">
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
                  disabled={!name.trim()}
                  className="rounded-lg bg-[var(--color-deck-accent)] px-3 py-2 text-xs font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-40"
                >
                  Добавить
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
