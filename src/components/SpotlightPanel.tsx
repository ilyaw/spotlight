import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Keyboard, Rocket, Settings2 } from "lucide-react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { invoke } from "@tauri-apps/api/core";
import { SearchInput } from "./SearchInput";
import { ResultsList } from "./ResultsList";
import { RgbBorderWrapper } from "./RgbBorderWrapper";
import { RgbSettingsPanel } from "./RgbSettingsPanel";
import { QuickLaunchSettingsPanel } from "./QuickLaunchSettingsPanel";
import { HotkeySettingsPanel } from "./HotkeySettingsPanel";
import { useSpotlightSearch } from "../hooks/useSpotlightSearch";
import { useWindowAutoHeight } from "../hooks/useWindowAutoHeight";
import { useQuickLaunch } from "../context/QuickLaunchContext";
import { isMacPlatform } from "../lib/platform";
import type { SpotlightItem } from "../data/mockItems";
import type { QuickLaunchKey } from "../types/quickLaunch";

type SettingsTab = "rgb" | "quickLaunch" | "hotkey" | null;

export function SpotlightPanel() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState<SettingsTab>(null);
  const settingsOpen = activeTab === "rgb";
  const quickLaunchOpen = activeTab === "quickLaunch";
  const hotkeyOpen = activeTab === "hotkey";

  const toggleTab = useCallback((tab: Exclude<SettingsTab, null>) => {
    setActiveTab((prev) => (prev === tab ? null : tab));
  }, []);

  const {
    query,
    setQuery,
    results,
    selectedIndex,
    setSelectedIndex,
    selectNext,
    selectPrevious,
    getSelectedItem,
  } = useSpotlightSearch();

  const { getSlot } = useQuickLaunch();
  const modifierLabel = isMacPlatform() ? "⌘" : "Ctrl";

  const panelRef = useWindowAutoHeight([
    settingsOpen,
    quickLaunchOpen,
    hotkeyOpen,
    results.length,
    query,
  ]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSelect = useCallback((item: SpotlightItem) => {
    console.log("Selected:", item.title);
  }, []);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      const isLaunchModifier = event.ctrlKey || event.metaKey;
      if (
        isLaunchModifier &&
        !settingsOpen &&
        !quickLaunchOpen &&
        !hotkeyOpen &&
        /^[1-9]$/.test(event.key)
      ) {
        event.preventDefault();
        const slot = getSlot(event.key as QuickLaunchKey);
        if (slot.path) {
          void invoke("launch_app", { path: slot.path })
            .then(() => getCurrentWindow().hide())
            .catch((error) => console.error("Failed to launch app:", error));
        }
        return;
      }

      switch (event.key) {
        case "ArrowDown":
          event.preventDefault();
          selectNext();
          break;
        case "ArrowUp":
          event.preventDefault();
          selectPrevious();
          break;
        case "Enter": {
          event.preventDefault();
          const selected = getSelectedItem();
          if (selected) handleSelect(selected);
          break;
        }
        case "Escape":
          event.preventDefault();
          void getCurrentWindow().hide();
          break;
      }
    },
    [
      settingsOpen,
      quickLaunchOpen,
      hotkeyOpen,
      getSlot,
      selectNext,
      selectPrevious,
      getSelectedItem,
      handleSelect,
    ],
  );

  return (
    <motion.div
      ref={panelRef}
      initial={{ opacity: 0, scale: 0.96, y: -8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      className="w-full max-w-[680px]"
    >
      <RgbBorderWrapper
        variant="full-panel"
        className="w-full"
        fallbackClassName="overflow-hidden rounded-2xl border border-white/10 bg-zinc-900 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)]"
      >
        <SearchInput
          ref={inputRef}
          value={query}
          onChange={setQuery}
          onKeyDown={handleKeyDown}
        />

        {!settingsOpen && !quickLaunchOpen && !hotkeyOpen && (
          <ResultsList
            results={results}
            selectedIndex={selectedIndex}
            onSelect={handleSelect}
            onHover={setSelectedIndex}
          />
        )}

        <RgbSettingsPanel open={settingsOpen} />
        <QuickLaunchSettingsPanel open={quickLaunchOpen} />
        <HotkeySettingsPanel open={hotkeyOpen} />

        <div className="flex items-center justify-between border-t border-white/10 px-5 py-2.5 text-xs text-zinc-500">
          <div className="flex items-center gap-2">
            <span>Spotlight</span>
            <button
              type="button"
              onClick={() => toggleTab("quickLaunch")}
              className={`rounded p-1 transition-colors ${
                quickLaunchOpen
                  ? "bg-white/15 text-zinc-200"
                  : "text-zinc-500 hover:bg-white/10 hover:text-zinc-300"
              }`}
              aria-label="Quick launch settings"
              aria-expanded={quickLaunchOpen}
            >
              <Rocket className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => toggleTab("hotkey")}
              className={`rounded p-1 transition-colors ${
                hotkeyOpen
                  ? "bg-white/15 text-zinc-200"
                  : "text-zinc-500 hover:bg-white/10 hover:text-zinc-300"
              }`}
              aria-label="Hotkey settings"
              aria-expanded={hotkeyOpen}
            >
              <Keyboard className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => toggleTab("rgb")}
              className={`rounded p-1 transition-colors ${
                settingsOpen
                  ? "bg-white/15 text-zinc-200"
                  : "text-zinc-500 hover:bg-white/10 hover:text-zinc-300"
              }`}
              aria-label="RGB settings"
              aria-expanded={settingsOpen}
            >
              <Settings2 className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="flex items-center gap-3">
            <span>
              <kbd className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-[10px] text-zinc-400">
                ↑↓
              </kbd>{" "}
              navigate
            </span>
            <span>
              <kbd className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-[10px] text-zinc-400">
                ↵
              </kbd>{" "}
              open
            </span>
            <span>
              <kbd className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-[10px] text-zinc-400">
                {modifierLabel}1–9
              </kbd>{" "}
              launch
            </span>
            <span>
              <kbd className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-[10px] text-zinc-400">
                esc
              </kbd>{" "}
              close
            </span>
          </div>
        </div>
      </RgbBorderWrapper>
    </motion.div>
  );
}
