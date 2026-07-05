import { motion } from "framer-motion";
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

  return (
    <motion.button
      type="button"
      layout
      layoutId={app.id}
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
      <span
        className={`flex shrink-0 items-center justify-center rounded-lg font-medium text-white ${
          isList ? "h-9 w-9 text-xs" : "h-10 w-10 text-sm"
        }`}
        style={{ backgroundColor: app.color }}
      >
        {app.initials}
      </span>
      <span
        className={`truncate text-left ${
          isList ? "text-sm font-medium" : "text-center text-xs font-medium"
        }`}
      >
        {app.name}
      </span>
    </motion.button>
  );
}
