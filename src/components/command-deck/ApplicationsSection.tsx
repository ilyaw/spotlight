import { AnimatePresence, LayoutGroup, motion } from "framer-motion";
import { useEffect, useRef } from "react";
import type { LauncherApp } from "../../types/appLauncher";
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
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current?.querySelector(
      `[data-app-index="${selectedIndex}"]`,
    );
    el?.scrollIntoView({ block: "nearest" });
  }, [selectedIndex]);

  return (
    <section className="flex min-h-0 flex-1 flex-col overflow-hidden px-4 pt-3 pb-3">
      <h2 className="mb-2 shrink-0 text-[11px] font-semibold tracking-wider text-[var(--color-deck-muted)] uppercase">
        Приложения
      </h2>

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
        <div
          ref={scrollRef}
          className="deck-scroll-area min-h-0 flex-1 overflow-y-auto px-1.5 pt-1.5"
        >
          <LayoutGroup>
            <motion.div
              layout
              className={
                layout === "list"
                  ? "flex flex-col gap-0.5"
                  : "grid grid-cols-3 gap-2 pb-1"
              }
            >
              <AnimatePresence mode="popLayout" initial={false}>
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
              </AnimatePresence>
            </motion.div>
          </LayoutGroup>
        </div>
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
