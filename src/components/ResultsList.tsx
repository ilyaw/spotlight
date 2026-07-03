import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight } from "lucide-react";
import type { SpotlightItem } from "../data/mockItems";

type ResultsListProps = {
  results: SpotlightItem[];
  selectedIndex: number;
  onSelect: (item: SpotlightItem) => void;
  onHover: (index: number) => void;
};

export function ResultsList({
  results,
  selectedIndex,
  onSelect,
  onHover,
}: ResultsListProps) {
  if (results.length === 0) {
    return (
      <div className="px-5 py-8 text-center text-sm text-zinc-500">
        No results found
      </div>
    );
  }

  return (
    <ul className="max-h-[240px] overflow-y-auto py-2">
      <AnimatePresence mode="popLayout">
        {results.map((item, index) => {
          const Icon = item.icon;
          const isSelected = index === selectedIndex;

          return (
            <motion.li
              key={item.id}
              layout
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15, delay: index * 0.02 }}
            >
              <button
                type="button"
                onClick={() => onSelect(item)}
                onMouseEnter={() => onHover(index)}
                className={`flex w-full items-center gap-3 px-5 py-2.5 text-left transition-colors ${
                  isSelected ? "bg-white/10" : "hover:bg-white/5"
                }`}
              >
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                    isSelected
                      ? "bg-white/15 text-zinc-100"
                      : "bg-white/5 text-zinc-400"
                  }`}
                >
                  <Icon className="h-4 w-4" strokeWidth={2} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium text-zinc-100">
                    {item.title}
                  </div>
                  <div className="truncate text-xs text-zinc-500">
                    {item.subtitle}
                  </div>
                </div>
                {isSelected && (
                  <ArrowRight className="h-4 w-4 shrink-0 text-zinc-500" />
                )}
              </button>
            </motion.li>
          );
        })}
      </AnimatePresence>
    </ul>
  );
}
