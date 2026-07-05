import { AnimatePresence, motion } from "framer-motion";
import { comboToDisplay } from "../../types/hotkey";
import { isMacPlatform } from "../../lib/platform";
import type { LauncherApp } from "../../types/appLauncher";

type ShortcutBarProps = {
  apps: LauncherApp[];
  onLaunch: (app: LauncherApp) => void;
};

export function ShortcutBar({ apps, onLaunch }: ShortcutBarProps) {
  const isMac = isMacPlatform();
  const shortcutApps = apps.filter((app) => app.shortcut);

  if (shortcutApps.length === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: "auto" }}
        exit={{ opacity: 0, height: 0 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="overflow-hidden"
      >
        <div className="deck-scroll-area flex gap-1.5 overflow-x-auto px-4 py-2">
          {shortcutApps.map((app) => (
            <button
              key={app.path}
              type="button"
              title={app.name}
              onClick={() => onLaunch(app)}
              className="flex shrink-0 items-center gap-1.5 rounded-lg deck-surface px-2 py-1 transition-colors hover:bg-[var(--color-deck-surface-hover)]"
            >
              <kbd className="font-mono-deck rounded px-1.5 py-0.5 text-[10px] leading-none text-[var(--color-deck-muted)]">
                {comboToDisplay(app.shortcut!, isMac)}
              </kbd>
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
          ))}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
