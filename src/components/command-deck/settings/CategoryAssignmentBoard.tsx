import { useCallback, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ListChecks } from "lucide-react";
import { useAppLauncher } from "../../../context/AppLauncherContext";
import type { CustomFilter, LauncherApp } from "../../../types/appLauncher";
import { DraggableAppChip } from "./DraggableAppChip";

type CategoryAssignmentBoardProps = {
  onEditCategory: (category: CustomFilter) => void;
};

function findDropTarget(
  point: { x: number; y: number },
  refs: Map<string, HTMLDivElement | null>,
): string | null {
  for (const [id, el] of refs) {
    if (!el) continue;
    const rect = el.getBoundingClientRect();
    if (
      point.x >= rect.left &&
      point.x <= rect.right &&
      point.y >= rect.top &&
      point.y <= rect.bottom
    ) {
      return id;
    }
  }
  return null;
}

export function CategoryAssignmentBoard({
  onEditCategory,
}: CategoryAssignmentBoardProps) {
  const { apps, filterSettings, addAppToCategory } = useAppLauncher();
  const [dragOverCategoryId, setDragOverCategoryId] = useState<string | null>(
    null,
  );
  const dropRefs = useRef<Map<string, HTMLDivElement | null>>(new Map());

  const setDropRef = useCallback(
    (id: string) => (el: HTMLDivElement | null) => {
      dropRefs.current.set(id, el);
    },
    [],
  );

  const handleDragEnd = useCallback(
    (
      app: LauncherApp,
      _event: MouseEvent | TouchEvent | PointerEvent,
      info: { point: { x: number; y: number } },
    ) => {
      const targetId = findDropTarget(info.point, dropRefs.current);
      if (targetId) {
        addAppToCategory(app.path, targetId);
      }
      setDragOverCategoryId(null);
    },
    [addAppToCategory],
  );

  const handleDrag = useCallback(
    (
      _event: MouseEvent | TouchEvent | PointerEvent,
      info: { point: { x: number; y: number } },
    ) => {
      const targetId = findDropTarget(info.point, dropRefs.current);
      setDragOverCategoryId(targetId);
    },
    [],
  );

  const unassignedApps = apps.filter((app) => app.categoryIds.length === 0);

  if (filterSettings.filters.length === 0) {
    return (
      <p className="text-xs text-[var(--color-deck-muted)]">
        Создайте категории выше, чтобы распределять приложения.
      </p>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <div>
        <p className="mb-2 text-[10px] font-medium tracking-wide text-[var(--color-deck-muted)] uppercase">
          Категории — перетащите приложение в нужную колонку
        </p>
        <div className="grid grid-cols-3 gap-3">
          {filterSettings.filters.map((filter) => {
            const categoryApps = apps.filter((a) =>
              a.categoryIds.includes(filter.id),
            );
            const isDropTarget = dragOverCategoryId === filter.id;

            return (
              <motion.div
                key={filter.id}
                ref={setDropRef(filter.id)}
                animate={{
                  borderColor: isDropTarget
                    ? "var(--color-deck-accent)"
                    : "var(--color-deck-border)",
                  backgroundColor: isDropTarget
                    ? "color-mix(in srgb, var(--color-deck-accent) 12%, transparent)"
                    : "transparent",
                }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                className="flex min-h-[140px] flex-col rounded-xl border deck-border p-3"
              >
                <div className="mb-2 flex items-center justify-between gap-1">
                  <span className="min-w-0 truncate text-xs font-semibold">
                    {filter.label}
                  </span>
                  <button
                    type="button"
                    onClick={() => onEditCategory(filter)}
                    className="flex shrink-0 items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] text-[var(--color-deck-muted)] transition-colors hover:bg-[var(--color-deck-surface-hover)] hover:text-[var(--color-deck-text)]"
                  >
                    <ListChecks className="h-3 w-3" />
                    Состав
                  </button>
                </div>
                <div className="flex min-h-0 flex-1 flex-wrap content-start gap-1.5">
                  {categoryApps.length === 0 ? (
                    <span className="text-[10px] text-[var(--color-deck-muted)]">
                      Перетащите сюда
                    </span>
                  ) : (
                    categoryApps.map((app) => (
                      <DraggableAppChip key={app.path} app={app} />
                    ))
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col">
        <p className="mb-2 shrink-0 text-[10px] font-medium tracking-wide text-[var(--color-deck-muted)] uppercase">
          Без категории
        </p>
        <div className="deck-scroll-area min-h-0 flex-1 overflow-y-auto rounded-xl border deck-border p-3">
          {unassignedApps.length === 0 ? (
            <p className="py-4 text-center text-xs text-[var(--color-deck-muted)]">
              Все приложения распределены по категориям
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {unassignedApps.map((app) => (
                <DraggableAppChip
                  key={app.path}
                  app={app}
                  draggable
                  onDrag={handleDrag}
                  onDragEnd={(event, info) => handleDragEnd(app, event, info)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
