import { motion } from "framer-motion";
import { comboToDisplay } from "../../types/hotkey";
import { isMacPlatform } from "../../lib/platform";
import type { LauncherApp } from "../../types/appLauncher";

type AppListItemProps = {
  app: LauncherApp;
  layout: "list" | "grid";
  index: number;
  selected: boolean;
  hideShortcut?: boolean;
  onSelect: () => void;
  onLaunch: () => void;
  onHover: () => void;
};

export function AppListItem({
  app,
  layout,
  index,
  selected,
  hideShortcut = false,
  onSelect,
  onLaunch,
  onHover,
}: AppListItemProps) {
  const isList = layout === "list";
  const isMac = isMacPlatform();

  return (
    <motion.div
      layout
      layoutId={app.path}
      data-app-index={index}
      onMouseEnter={onHover}
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ type: "spring", stiffness: 500, damping: 35 }}
      className={isList ? "w-full" : ""}
    >
      <button
        type="button"
        onClick={() => {
          onSelect();
          onLaunch();
        }}
        className={`flex w-full cursor-pointer items-center transition-colors ${
          isList
            ? "gap-3 rounded-lg px-3 py-2.5"
            : "flex-col gap-2 rounded-xl p-3"
        } ${
          selected
            ? "bg-[var(--color-deck-accent)]/20 ring-1 ring-[var(--color-deck-accent)]/40"
            : "hover:bg-[var(--color-deck-surface-hover)]"
        }`}
      >
        {app.icon ? (
          <img
            src={app.icon}
            alt=""
            className={`shrink-0 rounded-lg object-contain ${
              isList ? "h-9 w-9" : "h-10 w-10"
            }`}
          />
        ) : (
          <span
            className={`flex shrink-0 items-center justify-center rounded-lg deck-surface text-[var(--color-deck-muted)] ${
              isList ? "h-9 w-9 text-xs" : "h-10 w-10 text-sm"
            }`}
          >
            ?
          </span>
        )}
        <span
          className={`min-w-0 truncate text-left ${
            isList ? "flex-1 text-sm font-medium" : "text-center text-xs font-medium"
          }`}
        >
          {app.name}
        </span>
        {isList && app.shortcut && !hideShortcut && (
          <kbd className="font-mono-deck shrink-0 rounded deck-surface px-1.5 py-0.5 text-[10px] text-[var(--color-deck-muted)]">
            {comboToDisplay(app.shortcut, isMac)}
          </kbd>
        )}
      </button>
    </motion.div>
  );
}
