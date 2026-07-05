import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { RgbBorderWrapper } from "../RgbBorderWrapper";
import { useAppLauncher } from "../../context/AppLauncherContext";
import { launchApp } from "../../lib/launchApp";
import { isWindowsPlatform } from "../../lib/platform";
import {
  resolveLayout,
  type FilterTag,
  type LauncherApp,
} from "../../types/appLauncher";
import {
  comboFromEvent,
  combosEqual,
  hasModifier,
  isModifierCode,
} from "../../types/hotkey";
import { useWindowAutoHeight } from "../../hooks/useWindowAutoHeight";
import { CommandDeckSearch } from "./CommandDeckSearch";
import { FilterTags } from "./FilterTags";
import {
  ApplicationsSection,
  useFilteredApps,
} from "./ApplicationsSection";
import { KeyboardFooter } from "./KeyboardFooter";
import { SettingsScreen } from "./settings/SettingsScreen";

type View = "main" | "settings";

export function CommandDeckPanel() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [view, setView] = useState<View>("main");
  const [query, setQuery] = useState("");
  const [filterTag, setFilterTag] = useState<FilterTag>("all");
  const [selectedIndex, setSelectedIndex] = useState(0);

  const { apps, layoutMode } = useAppLauncher();

  const filteredApps = useFilteredApps(apps, query, filterTag);
  const layout = resolveLayout(layoutMode, filteredApps.length);

  const panelRef = useWindowAutoHeight([
    view,
    filteredApps.length,
    layout,
    query,
    filterTag,
  ]);

  useEffect(() => {
    inputRef.current?.focus();
  }, [view]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query, filterTag, filteredApps.length]);

  const handleLaunch = useCallback(async (app: LauncherApp) => {
    await launchApp(app);
    await getCurrentWindow().hide();
  }, []);

  const tryAppShortcut = useCallback(
    (event: React.KeyboardEvent): boolean => {
      if (view !== "main") return false;
      if (isModifierCode(event.code)) return false;

      const combo = comboFromEvent(event);
      if (!hasModifier(combo)) return false;

      const matched = apps.find(
        (a) => a.shortcut && combosEqual(a.shortcut, combo),
      );
      if (!matched) return false;

      event.preventDefault();
      void handleLaunch(matched);
      return true;
    },
    [apps, handleLaunch, view],
  );

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (tryAppShortcut(event)) return;

      if (view === "settings") {
        if (event.key === "Escape") {
          event.preventDefault();
          setView("main");
        }
        return;
      }

      switch (event.key) {
        case "ArrowDown":
          event.preventDefault();
          setSelectedIndex((i) =>
            filteredApps.length === 0
              ? 0
              : Math.min(i + 1, filteredApps.length - 1),
          );
          break;
        case "ArrowUp":
          event.preventDefault();
          setSelectedIndex((i) => Math.max(i - 1, 0));
          break;
        case "Enter": {
          event.preventDefault();
          const selected = filteredApps[selectedIndex];
          if (selected) void handleLaunch(selected);
          break;
        }
        case "Escape":
          event.preventDefault();
          void getCurrentWindow().hide();
          break;
      }
    },
    [view, filteredApps, selectedIndex, handleLaunch, tryAppShortcut],
  );

  const settingsOpen = view === "settings";

  return (
    <motion.div
      ref={panelRef}
      initial={{ opacity: 0, scale: 0.96, y: -8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      className={`w-full max-w-[680px]${isWindowsPlatform() ? " spotlight-panel-shadow" : ""}`}
    >
      <RgbBorderWrapper
        variant="full-panel"
        className="w-full"
        fallbackClassName="deck-panel w-full overflow-hidden rounded-[var(--radius-deck)] border deck-border"
      >
        <AnimatePresence mode="wait" initial={false}>
          {settingsOpen ? (
            <motion.div
              key="settings-view"
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 24 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
            >
              <SettingsScreen
                onBack={() => {
                  setView("main");
                  requestAnimationFrame(() => inputRef.current?.focus());
                }}
              />
            </motion.div>
          ) : (
            <motion.div
              key="main-view"
              initial={{ opacity: 0, x: -24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
            >
              <CommandDeckSearch
                ref={inputRef}
                value={query}
                onChange={setQuery}
                onKeyDown={handleKeyDown}
                onOpenSettings={() => setView("settings")}
              />
              <FilterTags active={filterTag} onChange={setFilterTag} />
              <ApplicationsSection
                apps={filteredApps}
                layout={layout}
                selectedIndex={selectedIndex}
                onSelectIndex={setSelectedIndex}
                onLaunch={(app) => void handleLaunch(app)}
              />
              <KeyboardFooter />
            </motion.div>
          )}
        </AnimatePresence>
      </RgbBorderWrapper>
    </motion.div>
  );
}
