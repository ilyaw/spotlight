import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { KeyRound, RotateCcw } from "lucide-react";
import { useHotkey } from "../context/HotkeyContext";
import {
  comboFromEvent,
  comboToDisplay,
  DEFAULT_HOTKEY,
  hasModifier,
  isModifierCode,
} from "../types/hotkey";
import { isMacPlatform } from "../lib/platform";

type HotkeySettingsPanelProps = {
  open: boolean;
};

export function HotkeySettingsPanel({ open }: HotkeySettingsPanelProps) {
  const { hotkey, setHotkey, resetHotkey, error } = useHotkey();
  const [recording, setRecording] = useState(false);
  const isMac = isMacPlatform();

  useEffect(() => {
    if (!recording) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      event.preventDefault();
      event.stopPropagation();

      if (event.code === "Escape") {
        setRecording(false);
        return;
      }

      if (isModifierCode(event.code)) return;

      const combo = comboFromEvent(event);
      if (!hasModifier(combo)) return;

      setHotkey(combo);
      setRecording(false);
    };

    window.addEventListener("keydown", handleKeyDown, true);
    return () => window.removeEventListener("keydown", handleKeyDown, true);
  }, [recording, setHotkey]);

  useEffect(() => {
    if (!open) setRecording(false);
  }, [open]);

  const handleToggleRecording = useCallback(() => {
    setRecording((prev) => !prev);
  }, []);

  return (
    <AnimatePresence initial={false}>
      {open && (
        <motion.div
          key="hotkey-settings"
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="border-t border-white/10"
        >
          <div className="space-y-3 px-5 py-4">
            <p className="text-xs text-zinc-500">
              Global shortcut to show or hide Spotlight from anywhere
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleToggleRecording}
                className={`flex h-9 flex-1 items-center justify-center gap-2 rounded-lg px-3 font-mono text-xs transition-colors ${
                  recording
                    ? "bg-violet-600/20 text-violet-300 ring-1 ring-violet-500/50"
                    : "bg-white/5 text-zinc-200 hover:bg-white/10"
                }`}
              >
                <KeyRound className="h-3.5 w-3.5" />
                {recording
                  ? "Press a key combination…"
                  : comboToDisplay(hotkey, isMac)}
              </button>
              <button
                type="button"
                onClick={resetHotkey}
                className="rounded p-1.5 text-zinc-500 transition-colors hover:bg-white/10 hover:text-zinc-300"
                aria-label="Reset to default shortcut"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </button>
            </div>

            {recording && (
              <p className="text-[10px] text-zinc-600">
                Must include a modifier ({isMac ? "⌘⌥⌃⇧" : "Ctrl/Alt/Shift"}) ·
                Esc to cancel
              </p>
            )}

            {error && (
              <p className="text-[10px] text-red-400">
                Failed to register shortcut: {error}
              </p>
            )}

            <p className="text-[10px] text-zinc-600">
              Default: {comboToDisplay(DEFAULT_HOTKEY, isMac)}
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
