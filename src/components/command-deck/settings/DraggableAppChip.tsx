import { motion } from "framer-motion";
import type { LauncherApp } from "../../../types/appLauncher";

type DraggableAppChipProps = {
  app: LauncherApp;
  draggable?: boolean;
  onDragStart?: () => void;
  onDrag?: (
    event: MouseEvent | TouchEvent | PointerEvent,
    info: { point: { x: number; y: number } },
  ) => void;
  onDragEnd?: (
    event: MouseEvent | TouchEvent | PointerEvent,
    info: { point: { x: number; y: number } },
  ) => void;
};

export function DraggableAppChip({
  app,
  draggable = false,
  onDragStart,
  onDrag,
  onDragEnd,
}: DraggableAppChipProps) {
  return (
    <motion.div
      drag={draggable}
      dragSnapToOrigin={draggable}
      dragElastic={0.1}
      onDragStart={onDragStart}
      onDrag={onDrag}
      onDragEnd={onDragEnd}
      whileDrag={
        draggable
          ? { scale: 1.05, zIndex: 50, opacity: 0.9, cursor: "grabbing" }
          : undefined
      }
      className={`flex min-w-0 items-center gap-2 rounded-lg deck-surface px-2 py-1.5 ${
        draggable ? "cursor-grab active:cursor-grabbing" : ""
      }`}
    >
      {app.icon ? (
        <img
          src={app.icon}
          alt=""
          className="h-6 w-6 shrink-0 rounded-md object-contain"
        />
      ) : (
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-[var(--color-deck-surface-hover)] text-[10px] text-[var(--color-deck-muted)]">
          ?
        </span>
      )}
      <span className="min-w-0 truncate text-xs font-medium">{app.name}</span>
    </motion.div>
  );
}
