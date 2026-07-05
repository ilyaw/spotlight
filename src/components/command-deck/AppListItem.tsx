import { motion } from "framer-motion";
import { comboToDisplay } from "../../types/hotkey";
import { isMacPlatform } from "../../lib/platform";
import type { LauncherApp } from "../../types/appLauncher";

type AppListItemProps = {
  app: LauncherApp;
  layout: "list" | "grid";
  selected: boolean;
  onSelect: () => void;
  onLaunch: () => void;
  onHover: () => void;
};

export function AppListItem({
  app,
  layout,
  selected,
  onSelect,
  onLaunch,
  onHover,
}: AppListItemProps) {
  const isList = layout === "list";
  const isMac = isMacPlatform();

  return (
    <motion.button
      type="button"
      layout
      layoutId={app.path}
      onClick={() => {
        onSelect();
        onLaunch();
      }}
      onMouseEnter={onHover}
      whileHover={{ scale: isList ? 1.005 : 1.02 }}
      transition={{ type: "spring", stiffness: 500, damping: 35 }}
      className={`flex cursor-pointer items-center transition-colors ${
        isList
          ? "w-full gap-3 rounded-lg px-3 py-2.5"
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
      {isList && app.shortcut && (
        <kbd className="font-mono-deck shrink-0 rounded deck-surface px-1.5 py-0.5 text-[10px] text-[var(--color-deck-muted)]">
          {comboToDisplay(app.shortcut, isMac)}
        </kbd>
      )}
    </motion.button>
  );
}
