import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { comboToDisplay } from "../../types/hotkey";
import { isMacPlatform } from "../../lib/platform";
import type { LauncherApp } from "../../types/appLauncher";

type FavoritesBarProps = {
  apps: LauncherApp[];
  selectedIndex: number;
  hasPinnedApps: boolean;
  query: string;
  onLaunch: (app: LauncherApp) => void;
  onSelectIndex: (index: number) => void;
};

function emptyMessage(hasPinnedApps: boolean, query: string): string {
  if (!hasPinnedApps) {
    return "Добавьте избранное в настройках";
  }
  if (query.trim()) {
    return "Ничего не найдено";
  }
  return "Добавьте избранное в настройках";
}

export function FavoritesBar({
  apps,
  selectedIndex,
  hasPinnedApps,
  query,
  onLaunch,
  onSelectIndex,
}: FavoritesBarProps) {
  const isMac = isMacPlatform();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current?.querySelector(
      `[data-favorite-index="${selectedIndex}"]`,
    );
    el?.scrollIntoView({ block: "nearest", inline: "nearest" });
  }, [selectedIndex, apps.length]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: "auto" }}
        exit={{ opacity: 0, height: 0 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="overflow-hidden"
      >
        {apps.length === 0 ? (
          <p className="px-4 py-2 text-xs text-[var(--color-deck-muted)]">
            {emptyMessage(hasPinnedApps, query)}
          </p>
        ) : (
          <div
            ref={scrollRef}
            className="deck-scroll-area flex gap-1.5 overflow-x-auto px-4 py-2"
          >
            {apps.map((app, index) => {
              const selected = index === selectedIndex;

              return (
                <button
                  key={app.path}
                  type="button"
                  data-favorite-index={index}
                  title={app.name}
                  onClick={() => {
                    onSelectIndex(index);
                    onLaunch(app);
                  }}
                  className={`flex shrink-0 items-center gap-1.5 rounded-lg px-2 py-1 transition-colors ${
                    selected
                      ? "bg-[var(--color-deck-accent)]/20 ring-1 ring-[var(--color-deck-accent)]/40"
                      : "deck-surface hover:bg-[var(--color-deck-surface-hover)]"
                  }`}
                >
                  {app.shortcut && (
                    <kbd className="font-mono-deck rounded px-1.5 py-0.5 text-[10px] leading-none text-[var(--color-deck-muted)]">
                      {comboToDisplay(app.shortcut, isMac)}
                    </kbd>
                  )}
                  {app.icon ? (
                    <img
                      src={app.icon}
                      alt=""
                      className="h-5 w-5 shrink-0 rounded object-contain"
                    />
                  ) : (
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded text-[9px] text-[var(--color-deck-muted)]">
                      ?
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
