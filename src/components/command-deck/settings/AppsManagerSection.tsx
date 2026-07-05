import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { open } from "@tauri-apps/plugin-dialog";
import { useAppLauncher } from "../../../context/AppLauncherContext";
import { AddAppModal } from "../AddAppModal";

export function AppsManagerSection() {
  const { apps, removeApp } = useAppLauncher();
  const [pendingPath, setPendingPath] = useState<string | null>(null);

  const handleAdd = async () => {
    const selected = await open({
      multiple: false,
      directory: false,
      filters: [
        { name: "Applications", extensions: ["app", "exe", "bat", "sh"] },
      ],
    });
    if (typeof selected === "string") {
      setPendingPath(selected);
    }
  };

  return (
    <section className="flex min-h-0 flex-1 flex-col gap-3 overflow-hidden">
      <div className="flex shrink-0 items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-[11px] font-semibold tracking-wider text-[var(--color-deck-muted)] uppercase">
            Приложения
          </h3>
          <p className="mt-1 text-xs text-[var(--color-deck-muted)]">
            Добавляйте и удаляйте приложения в лаунчере. Удаление системных
            скрывает их из списка.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void handleAdd()}
          className="flex shrink-0 items-center gap-1 rounded-lg bg-[var(--color-deck-accent)] px-3 py-2 text-xs font-medium text-white transition-opacity hover:opacity-90"
        >
          <Plus className="h-3.5 w-3.5" />
          Добавить
        </button>
      </div>

      {apps.length === 0 ? (
        <p className="text-xs text-[var(--color-deck-muted)]">
          Нет приложений в списке
        </p>
      ) : (
        <div className="deck-scroll-area min-h-0 flex-1 space-y-1 overflow-y-auto pr-1">
          {apps.map((app) => (
            <div
              key={app.path}
              className="flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-[var(--color-deck-surface-hover)]"
            >
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
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{app.name}</p>
                <p className="text-[10px] text-[var(--color-deck-muted)]">
                  {app.source === "manual" ? "Добавлено вручную" : "Системное"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => removeApp(app.path)}
                className="shrink-0 rounded-md p-2 text-[var(--color-deck-muted)] transition-colors hover:bg-red-500/15 hover:text-red-400"
                aria-label={`Удалить ${app.name}`}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {pendingPath && (
        <AddAppModal
          path={pendingPath}
          onClose={() => setPendingPath(null)}
        />
      )}
    </section>
  );
}
