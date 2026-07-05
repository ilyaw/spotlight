import { motion } from "framer-motion";
import { X } from "lucide-react";
import { comboToDisplay } from "../../types/hotkey";
import { isMacPlatform } from "../../lib/platform";
import type { LauncherApp } from "../../types/appLauncher";

type AppListItemProps = {
  app: LauncherApp;
  layout: "list" | "grid";
  index: number;
  selected: boolean;
  onSelect: () => void;
  onLaunch: () => void;
  onHover: () => void;
  onRemove?: () => void;
};

export function AppListItem({
  app,
  layout,
  index,
  selected,
  onSelect,
  onLaunch,
  onHover,
  onRemove,
}: AppListItemProps) {
  const isList = layout === "list";
  const isMac = isMacPlatform();
  const canRemove = app.source === "manual" && onRemove;

  return (
    <motion.div
      layout
      layoutId={app.path}
      data-app-index={index}
      onMouseEnter={onHover}
      className={`group relative ${
        isList ? "w-full" : ""
      }`}
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
        {isList && app.shortcut && (
          <kbd className="font-mono-deck shrink-0 rounded deck-surface px-1.5 py-0.5 text-[10px] text-[var(--color-deck-muted)]">
            {comboToDisplay(app.shortcut, isMac)}
          </kbd>
        )}
      </button>

      {canRemove && (
        <button
          type="button"
          aria-label={`Удалить ${app.name}`}
          onClick={(event) => {
            event.stopPropagation();
            onRemove();
          }}
          className={`absolute z-10 flex h-5 w-5 items-center justify-center rounded-md border deck-border bg-[var(--color-deck-bg)] text-[var(--color-deck-muted)] opacity-0 transition-opacity hover:bg-red-500/20 hover:text-red-300 group-hover:opacity-100 group-focus-within:opacity-100 ${
            isList ? "top-1/2 right-2 -translate-y-1/2" : "top-1.5 right-1.5"
          }`}
        >
          <X className="h-3 w-3" strokeWidth={2.5} />
        </button>
      )}
    </motion.div>
  );
}
