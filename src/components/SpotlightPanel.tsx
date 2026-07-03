import { useCallback, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { SearchInput } from "./SearchInput";
import { ResultsList } from "./ResultsList";
import { useSpotlightSearch } from "../hooks/useSpotlightSearch";
import type { SpotlightItem } from "../data/mockItems";

export function SpotlightPanel() {
  const inputRef = useRef<HTMLInputElement>(null);
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

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSelect = useCallback((item: SpotlightItem) => {
    console.log("Selected:", item.title);
  }, []);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
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
    [selectNext, selectPrevious, getSelectedItem, handleSelect],
  );

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96, y: -8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      className="w-full max-w-[680px] overflow-hidden rounded-2xl border border-white/10 bg-zinc-900/70 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] backdrop-blur-2xl"
    >
      <SearchInput
        ref={inputRef}
        value={query}
        onChange={setQuery}
        onKeyDown={handleKeyDown}
      />

      <ResultsList
        results={results}
        selectedIndex={selectedIndex}
        onSelect={handleSelect}
        onHover={setSelectedIndex}
      />

      <div className="flex items-center justify-between border-t border-white/10 px-5 py-2.5 text-xs text-zinc-500">
        <span>Spotlight</span>
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
              esc
            </kbd>{" "}
            close
          </span>
        </div>
      </div>
    </motion.div>
  );
}
