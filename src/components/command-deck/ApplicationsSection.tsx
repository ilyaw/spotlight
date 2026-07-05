import { LayoutGroup, motion } from "framer-motion";
import { open } from "@tauri-apps/plugin-dialog";
import { useAppLauncher } from "../../context/AppLauncherContext";
import {
  basenameFromPath,
  type FilterTag,
  type LauncherApp,
} from "../../types/appLauncher";
import { AppListItem } from "./AppListItem";

type ApplicationsSectionProps = {
  apps: LauncherApp[];
  layout: "list" | "grid";
  selectedIndex: number;
  onSelectIndex: (index: number) => void;
  onLaunch: (app: LauncherApp) => void;
};

export function ApplicationsSection({
  apps,
  layout,
  selectedIndex,
  onSelectIndex,
  onLaunch,
}: ApplicationsSectionProps) {
  const { addApp } = useAppLauncher();

  const handleAdd = async () => {
    const selected = await open({
      multiple: false,
      directory: false,
      filters: [
        { name: "Applications", extensions: ["app", "exe", "bat", "sh"] },
      ],
    });
    if (typeof selected === "string") {
      addApp(selected, basenameFromPath(selected));
    }
  };

  return (
    <section className="px-4 pb-3">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-[11px] font-semibold tracking-wider text-[var(--color-deck-muted)] uppercase">
          Приложения
        </h2>
        <button
          type="button"
          onClick={() => void handleAdd()}
          className="rounded-md border deck-border px-2.5 py-1 text-xs text-[var(--color-deck-muted)] transition-colors hover:bg-[var(--color-deck-surface-hover)] hover:text-[var(--color-deck-text)]"
        >
          + Добавить
        </button>
      </div>

      {apps.length === 0 ? (
        <p className="py-6 text-center text-sm text-[var(--color-deck-muted)]">
          Нет приложений
        </p>
      ) : (
        <LayoutGroup>
          <motion.div
            layout
            className={
              layout === "list"
                ? "flex flex-col gap-0.5"
                : "grid grid-cols-3 gap-2"
            }
          >
            {apps.map((app, index) => (
              <AppListItem
                key={app.id}
                app={app}
                layout={layout}
                selected={index === selectedIndex}
                onSelect={() => onSelectIndex(index)}
                onLaunch={() => onLaunch(app)}
                onHover={() => onSelectIndex(index)}
              />
            ))}
          </motion.div>
        </LayoutGroup>
      )}
    </section>
  );
}

export function useFilteredApps(
  apps: LauncherApp[],
  query: string,
  filterTag: FilterTag,
): LauncherApp[] {
  return apps.filter((app) => {
    const matchesTag =
      filterTag === "all" || app.category === filterTag;
    const matchesQuery =
      query.trim() === "" ||
      app.name.toLowerCase().includes(query.trim().toLowerCase());
    return matchesTag && matchesQuery;
  });
}
