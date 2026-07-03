import { AnimatePresence, motion } from "framer-motion";
import { open } from "@tauri-apps/plugin-dialog";
import { FolderOpen, X } from "lucide-react";
import { useQuickLaunch } from "../context/QuickLaunchContext";
import {
  basenameFromPath,
  QUICK_LAUNCH_KEYS,
  type QuickLaunchKey,
} from "../types/quickLaunch";
import { isMacPlatform } from "../lib/platform";

type QuickLaunchSettingsPanelProps = {
  open: boolean;
};

export function QuickLaunchSettingsPanel({
  open: isOpen,
}: QuickLaunchSettingsPanelProps) {
  const { getSlot, setSlot, clearSlot } = useQuickLaunch();
  const modifierLabel = isMacPlatform() ? "⌘" : "Ctrl";

  const handleBrowse = async (key: QuickLaunchKey) => {
    const selected = await open({
      multiple: false,
      directory: false,
      filters: [
        { name: "Applications", extensions: ["app", "exe", "bat", "sh"] },
      ],
    });
    if (typeof selected === "string") {
      setSlot(key, selected, basenameFromPath(selected));
    }
  };

  return (
    <AnimatePresence initial={false}>
      {isOpen && (
        <motion.div
          key="quick-launch-settings"
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="border-t border-white/10"
        >
          <div className="space-y-2 px-5 py-4">
            <p className="text-xs text-zinc-500">
              Bind an app to {modifierLabel}+1–9 for instant launch
            </p>

            {QUICK_LAUNCH_KEYS.map((key) => {
              const slot = getSlot(key);
              const isBound = slot.path.length > 0;

              return (
                <div key={key} className="flex items-center gap-2">
                  <kbd className="flex h-7 w-14 shrink-0 items-center justify-center rounded bg-white/10 font-mono text-[10px] text-zinc-400">
                    {modifierLabel}
                    {key}
                  </kbd>
                  <div className="min-w-0 flex-1 truncate rounded-lg bg-white/5 px-3 py-1.5 text-xs">
                    {isBound ? (
                      <span className="text-zinc-200">{slot.label}</span>
                    ) : (
                      <span className="text-zinc-600">Not assigned</span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => void handleBrowse(key)}
                    className="rounded p-1.5 text-zinc-500 transition-colors hover:bg-white/10 hover:text-zinc-300"
                    aria-label={`Browse for slot ${key}`}
                  >
                    <FolderOpen className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => clearSlot(key)}
                    disabled={!isBound}
                    className="rounded p-1.5 text-zinc-500 transition-colors hover:bg-white/10 hover:text-zinc-300 disabled:opacity-30 disabled:hover:bg-transparent"
                    aria-label={`Clear slot ${key}`}
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
