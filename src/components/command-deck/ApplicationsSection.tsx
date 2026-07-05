import { LayoutGroup, motion } from "framer-motion";
import { open } from "@tauri-apps/plugin-dialog";
import { useEffect, useRef, useState } from "react";
import type { LauncherApp } from "../../types/appLauncher";
import { AddAppModal } from "./AddAppModal";
import { AppListItem } from "./AppListItem";

type ApplicationsSectionProps = {
  apps: LauncherApp[];
  layout: "list" | "grid";
  selectedIndex: number;
  isLoading?: boolean;
  onSelectIndex: (index: number) => void;
  onLaunch: (app: LauncherApp) => void;
};

export function ApplicationsSection({
  apps,
  layout,
  selectedIndex,
  isLoading = false,
  onSelectIndex,
  onLaunch,
}: ApplicationsSectionProps) {
  const [pendingPath, setPendingPath] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current?.querySelector(
      `[data-app-index="${selectedIndex}"]`,
    );
    el?.scrollIntoView({ block: "nearest" });
  }, [selectedIndex]);

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
    <section className="flex min-h-0 flex-1 flex-col overflow-hidden px-4 pb-3">
      <div className="mb-2 flex shrink-0 items-center justify-between">
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

      {isLoading ? (
        <div className="space-y-2 py-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-11 animate-pulse rounded-lg deck-surface"
            />
          ))}
        </div>
      ) : apps.length === 0 ? (
        <p className="py-6 text-center text-sm text-[var(--color-deck-muted)]">
          Приложения не найдены
        </p>
      ) : (
        <div className="relative min-h-0 flex-1 overflow-hidden">
          <div ref={scrollRef} className="deck-scroll-area h-full min-h-0 px-1.5 pt-1.5">
            <LayoutGroup>
              <motion.div
                layout
                className={
                  layout === "list"
                    ? "flex flex-col gap-0.5"
                    : "grid grid-cols-3 gap-2 pb-1"
                }
              >
                {apps.map((app, index) => (
                  <AppListItem
                    key={app.path}
                    app={app}
                    layout={layout}
                    index={index}
                    selected={index === selectedIndex}
                    onSelect={() => onSelectIndex(index)}
                    onLaunch={() => onLaunch(app)}
                    onHover={() => onSelectIndex(index)}
                  />
                ))}
              </motion.div>
            </LayoutGroup>
          </div>
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

export function useFilteredApps(
  apps: LauncherApp[],
  query: string,
  filterId: string | "all",
): LauncherApp[] {
  return apps.filter((app) => {
    const matchesTag =
      filterId === "all" || app.categoryIds.includes(filterId);
    const matchesQuery =
      query.trim() === "" ||
      app.name.toLowerCase().includes(query.trim().toLowerCase());
    return matchesTag && matchesQuery;
  });
}
